import express from 'express';
import { Scan, ScannedPage, Finding, Domain } from '../models/index.js';
import { normalizeTargetUrl, validateSafeHostDns } from '../scanner/urlValidator.js';
import { scanCoordinator } from '../scanner/queue.js';
import { generateAuditReportPdf } from '../scanner/pdfReportGenerator.js';

const router = express.Router();

function resolveAuthContext(req) {
  const userId = req.headers['x-user-id'] || req.body?.userId || req.query?.userId || 'usr-anonymous';
  const companyId = req.headers['x-company-id'] || req.body?.companyId || req.query?.companyId || null;
  return { userId, companyId };
}

/**
 * POST /api/scans
 * Initiate a Quick or Full scan.
 */
router.post('/', async (req, res) => {
  try {
    const { url, domainId, scanMode = 'quick' } = req.body;
    let targetInput = url;

    // If domainId provided, fetch domain URL from database
    let linkedDomain = null;
    if (domainId) {
      linkedDomain = await Domain.findOne({ id: domainId });
      if (linkedDomain) {
        targetInput = linkedDomain.display_url;
      }
    }

    if (!targetInput || typeof targetInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid website URL or domain ID.'
      });
    }

    const mode = ['quick', 'full'].includes(scanMode) ? scanMode : 'quick';
    const { userId, companyId } = resolveAuthContext(req);

    // 1. Normalize and check protocol
    let normalized;
    try {
      normalized = normalizeTargetUrl(targetInput);
    } catch (normErr) {
      return res.status(400).json({
        success: false,
        error: normErr.message
      });
    }

    const { normalizedDomain, displayUrl, targetUrl } = normalized;

    // 2. Validate against SSRF and private IP ranges
    try {
      await validateSafeHostDns(normalizedDomain);
    } catch (dnsErr) {
      return res.status(400).json({
        success: false,
        error: dnsErr.message
      });
    }

    // 3. Prevent duplicate active scans for the same domain
    const activeScan = await Scan.findOne({
      normalized_domain: normalizedDomain,
      status: { $in: ['queued', 'validating', 'crawling', 'scanning', 'scoring'] },
      created_at: { $gt: new Date(Date.now() - 60000) } // Within last 60 seconds
    });

    if (activeScan) {
      return res.status(409).json({
        success: false,
        error: `A scan is already actively running for "${normalizedDomain}".`,
        scanId: activeScan.id,
        status: activeScan.status
      });
    }

    // 4. Create Scan record
    const scanId = `scn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newScan = await Scan.create({
      id: scanId,
      domain_id: linkedDomain ? linkedDomain.id : null,
      user_id: userId,
      company_id: companyId,
      target_url: displayUrl,
      normalized_domain: normalizedDomain,
      scan_mode: mode,
      status: 'queued',
      progress: {
        stage: 'queued',
        percent: 0,
        currentStep: 'Scan queued for processing...',
        pagesDiscovered: 0,
        pagesAudited: 0,
        maxPages: mode === 'quick' ? 1 : 25,
        crawlCapped: false,
        completedCategories: []
      }
    });

    // 5. Enqueue scan execution
    await scanCoordinator.enqueueScan(scanId);

    return res.status(201).json({
      success: true,
      message: `${mode === 'quick' ? 'Quick Homepage' : 'Full Website'} scan initiated.`,
      scanId: newScan.id,
      scan: newScan,
      status: newScan.status,
      scanMode: newScan.scan_mode,
      targetUrl: newScan.target_url
    });
  } catch (err) {
    console.error('Create scan error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate scan: ' + err.message
    });
  }
});

/**
 * GET /api/scans/:id
 * Retrieve live scan status and honest progress.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scan = await Scan.findOne({ id }).lean();

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: `Scan with ID "${id}" was not found.`
      });
    }

    return res.json({
      success: true,
      scan: {
        id: scan.id,
        domainId: scan.domain_id,
        targetUrl: scan.target_url,
        normalizedDomain: scan.normalized_domain,
        scanMode: scan.scan_mode,
        status: scan.status,
        progress: scan.progress,
        scores: scan.scores,
        summary: scan.summary,
        errorMessage: scan.error_message,
        startedAt: scan.started_at,
        completedAt: scan.completed_at,
        createdAt: scan.created_at
      }
    });
  } catch (err) {
    console.error('Get scan error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to check scan status: ' + err.message
    });
  }
});

/**
 * POST /api/scans/:id/cancel
 * Cancel an active scan.
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await scanCoordinator.cancelScan(id);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: `Scan "${id}" is either not currently running or cannot be cancelled.`
      });
    }

    return res.json({
      success: true,
      message: `Scan "${id}" was cancelled.`
    });
  } catch (err) {
    console.error('Cancel scan error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel scan: ' + err.message
    });
  }
});

/**
 * GET /api/scans/:id/results
 * Retrieve detailed findings, pages, and scores.
 */
router.get('/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const scan = await Scan.findOne({ id }).lean();

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: `Scan "${id}" not found.`
      });
    }

    const [pages, findings] = await Promise.all([
      ScannedPage.find({ scan_id: id }).sort({ created_at: 1 }).lean(),
      Finding.find({ scan_id: id }).sort({ severity: 1 }).lean()
    ]);

    return res.json({
      success: true,
      scan: {
        id: scan.id,
        domainId: scan.domain_id,
        targetUrl: scan.target_url,
        normalizedDomain: scan.normalized_domain,
        scanMode: scan.scan_mode,
        status: scan.status,
        progress: scan.progress,
        scores: scan.scores,
        summary: scan.summary,
        startedAt: scan.started_at,
        completedAt: scan.completed_at
      },
      pagesCount: pages.length,
      pages: pages.map(p => ({
        id: p.id,
        url: p.url,
        statusCode: p.status_code,
        responseTimeMs: p.responseTime_ms || p.response_time_ms,
        pageTitle: p.page_title,
        pageSizeBytes: p.page_size_bytes,
        linksDiscovered: p.links_discovered,
        error: p.error
      })),
      findingsCount: findings.length,
      findings: findings.map(f => ({
        id: f.id,
        ruleId: f.rule_id,
        category: f.category,
        title: f.title,
        description: f.description,
        status: f.status,
        severity: f.severity,
        affectedUrls: f.affected_urls,
        evidence: f.evidence,
        recommendation: f.recommendation
      }))
    });
  } catch (err) {
    console.error('Get scan results error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve scan results: ' + err.message
    });
  }
});

/**
 * GET /api/scans/:id/compare/:otherScanId
 * Compare two scans (e.g. current vs baseline) to calculate score deltas,
 * new issues, resolved issues, and recurring issues.
 */
router.get('/:id/compare/:otherScanId', async (req, res) => {
  try {
    const { id, otherScanId } = req.params;

    const [currentScan, baselineScan] = await Promise.all([
      Scan.findOne({ id }).lean(),
      Scan.findOne({ id: otherScanId }).lean()
    ]);

    if (!currentScan) {
      return res.status(404).json({ success: false, error: `Primary scan "${id}" not found.` });
    }
    if (!baselineScan) {
      return res.status(404).json({ success: false, error: `Baseline scan "${otherScanId}" not found.` });
    }

    const [currentFindings, baselineFindings] = await Promise.all([
      Finding.find({ scan_id: id }).lean(),
      Finding.find({ scan_id: otherScanId }).lean()
    ]);

    // 1. Calculate Score Deltas
    const scoreDeltas = {
      overall: (currentScan.scores?.overall ?? 0) - (baselineScan.scores?.overall ?? 0),
      security: (currentScan.scores?.security ?? 0) - (baselineScan.scores?.security ?? 0),
      performance: (currentScan.scores?.performance ?? 0) - (baselineScan.scores?.performance ?? 0),
      seo: (currentScan.scores?.seo ?? 0) - (baselineScan.scores?.seo ?? 0),
      accessibility: (currentScan.scores?.accessibility ?? 0) - (baselineScan.scores?.accessibility ?? 0),
      mobile: (currentScan.scores?.mobile ?? 0) - (baselineScan.scores?.mobile ?? 0),
      sslDns: (currentScan.scores?.sslDns ?? 0) - (baselineScan.scores?.sslDns ?? 0)
    };

    // 2. Map findings by rule_id
    const currentMap = new Map();
    for (const cf of currentFindings) {
      currentMap.set(cf.rule_id, cf);
    }

    const baselineMap = new Map();
    for (const bf of baselineFindings) {
      baselineMap.set(bf.rule_id, bf);
    }

    const newFindings = [];
    const recurringFindings = [];
    const resolvedFindings = [];
    const unchangedPassed = [];

    // Analyze current scan findings
    for (const cf of currentFindings) {
      const bf = baselineMap.get(cf.rule_id);
      if (cf.status === 'failed') {
        if (!bf || bf.status === 'passed') {
          newFindings.push(cf);
        } else if (bf.status === 'failed') {
          recurringFindings.push({
            current: cf,
            baseline: bf
          });
        }
      } else if (cf.status === 'passed' && bf?.status === 'passed') {
        unchangedPassed.push(cf);
      }
    }

    // Check for resolved findings from baseline
    for (const bf of baselineFindings) {
      if (bf.status === 'failed') {
        const cf = currentMap.get(bf.rule_id);
        if (!cf || cf.status === 'passed') {
          resolvedFindings.push(bf);
        }
      }
    }

    return res.json({
      success: true,
      currentScan: {
        id: currentScan.id,
        targetUrl: currentScan.target_url,
        completedAt: currentScan.completed_at,
        scores: currentScan.scores
      },
      baselineScan: {
        id: baselineScan.id,
        targetUrl: baselineScan.target_url,
        completedAt: baselineScan.completed_at,
        scores: baselineScan.scores
      },
      summary: {
        improved: scoreDeltas.overall > 0,
        regressed: scoreDeltas.overall < 0,
        overallDelta: scoreDeltas.overall,
        newIssuesCount: newFindings.length,
        resolvedIssuesCount: resolvedFindings.length,
        recurringIssuesCount: recurringFindings.length
      },
      scoreDeltas,
      diff: {
        newFindings: newFindings.map(f => ({
          ruleId: f.rule_id,
          title: f.title,
          category: f.category,
          severity: f.severity,
          description: f.description,
          affectedUrls: f.affected_urls
        })),
        resolvedFindings: resolvedFindings.map(f => ({
          ruleId: f.rule_id,
          title: f.title,
          category: f.category,
          severity: f.severity,
          description: f.description
        })),
        recurringFindings: recurringFindings.map(item => ({
          ruleId: item.current.rule_id,
          title: item.current.title,
          category: item.current.category,
          severity: item.current.severity,
          description: item.current.description,
          affectedUrls: item.current.affected_urls
        }))
      }
    });
  } catch (err) {
    console.error('Scan comparison error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare scans: ' + err.message
    });
  }
});

/**
 * GET /api/scans/:id/pdf
 * Stream generated multi-page executive audit report PDF.
 */
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const scan = await Scan.findOne({ id }).lean();

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: `Scan "${id}" not found.`
      });
    }

    const [pages, findings] = await Promise.all([
      ScannedPage.find({ scan_id: id }).sort({ created_at: 1 }).lean(),
      Finding.find({ scan_id: id }).sort({ severity: 1 }).lean()
    ]);

    const sanitizedFilename = (scan.normalized_domain || scan.id).replace(/[^a-zA-Z0-9.-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Audit-Report-${sanitizedFilename}-${scan.id}.pdf"`);

    generateAuditReportPdf({
      scan,
      findings,
      pages,
      res
    });
  } catch (err) {
    console.error('Download audit PDF report error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate PDF report: ' + err.message
      });
    }
  }
});

export default router;
