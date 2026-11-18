import express from 'express';
import { Domain, User, Scan } from '../models/index.js';
import { normalizeTargetUrl, validateSafeHostDns } from '../scanner/urlValidator.js';

const router = express.Router();

/**
 * Helper to extract user & company context from headers, body, or query
 */
function resolveAuthContext(req) {
  const userId = req.headers['x-user-id'] || req.body?.userId || req.query?.userId || null;
  const companyId = req.headers['x-company-id'] || req.body?.companyId || req.query?.companyId || null;
  return { userId, companyId };
}

/**
 * POST /api/domains
 * Add a new domain to user/workspace inventory.
 */
router.post('/', async (req, res) => {
  try {
    const { url, domain: rawDomain } = req.body;
    const input = url || rawDomain;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid website domain or URL.'
      });
    }

    const { userId, companyId } = resolveAuthContext(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing user identifier.'
      });
    }

    // 1. Normalize URL and check scheme & format
    let normalized;
    try {
      normalized = normalizeTargetUrl(input);
    } catch (normErr) {
      return res.status(400).json({
        success: false,
        error: normErr.message
      });
    }

    const { normalizedDomain, displayUrl } = normalized;

    // 2. Perform safe public DNS resolution & SSRF protection pre-check
    try {
      await validateSafeHostDns(normalizedDomain);
    } catch (dnsErr) {
      return res.status(400).json({
        success: false,
        error: dnsErr.message
      });
    }

    // 3. Duplicate check within company or user scope
    const duplicateQuery = companyId
      ? { company_id: companyId, normalized_domain: normalizedDomain, status: 'active' }
      : { user_id: userId, normalized_domain: normalizedDomain, status: 'active' };

    const existingDomain = await Domain.findOne(duplicateQuery);
    if (existingDomain) {
      return res.status(409).json({
        success: false,
        error: `Domain "${normalizedDomain}" is already registered in your workspace.`,
        domain: existingDomain
      });
    }

    // 4. Create Domain record
    const domainId = `dom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newDomain = await Domain.create({
      id: domainId,
      user_id: userId,
      company_id: companyId,
      normalized_domain: normalizedDomain,
      display_url: displayUrl,
      status: 'active',
      latest_score: null,
      latest_scan_id: null,
      last_scan_at: null
    });

    return res.status(201).json({
      success: true,
      message: `Domain "${normalizedDomain}" registered successfully.`,
      domain: newDomain
    });
  } catch (err) {
    console.error('Add domain error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while registering domain: ' + err.message
    });
  }
});

/**
 * GET /api/domains
 * List all active domains scoped to the current user or company.
 */
router.get('/', async (req, res) => {
  try {
    const { userId, companyId } = resolveAuthContext(req);

    const query = { status: 'active' };
    if (companyId) {
      query.company_id = companyId;
    } else if (userId) {
      query.user_id = userId;
    }

    const domains = await Domain.find(query)
      .sort({ created_at: -1 })
      .lean();

    return res.json({
      success: true,
      count: domains.length,
      domains: domains.map(d => ({
        id: d.id,
        normalizedDomain: d.normalized_domain,
        displayUrl: d.display_url,
        status: d.status,
        latestScore: d.latest_score,
        latestScanId: d.latest_scan_id,
        lastScanAt: d.last_scan_at,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }))
    });
  } catch (err) {
    console.error('List domains error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve domains: ' + err.message
    });
  }
});

/**
 * GET /api/domains/:id
 * Retrieve a single domain by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findOne({ id }).lean();

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: `Domain not found with ID "${id}".`
      });
    }

    return res.json({
      success: true,
      domain: {
        id: domain.id,
        userId: domain.user_id,
        companyId: domain.company_id,
        normalizedDomain: domain.normalized_domain,
        displayUrl: domain.display_url,
        status: domain.status,
        latestScore: domain.latest_score,
        latestScanId: domain.latest_scan_id,
        lastScanAt: domain.last_scan_at,
        createdAt: domain.created_at,
        updatedAt: domain.updated_at
      }
    });
  } catch (err) {
    console.error('Get domain error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve domain details: ' + err.message
    });
  }
});

/**
 * DELETE /api/domains/:id
 * Remove a domain from user's active list (Soft-delete / archive).
 * Preserves all underlying scan history as required by retention policy.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, companyId } = resolveAuthContext(req);

    const query = { id };
    if (companyId) {
      query.company_id = companyId;
    } else if (userId) {
      query.user_id = userId;
    }

    const domain = await Domain.findOne(query);
    if (!domain) {
      return res.status(404).json({
        success: false,
        error: `Domain "${id}" not found or unauthorized to delete.`
      });
    }

    domain.status = 'archived';
    domain.updated_at = new Date();
    await domain.save();

    return res.json({
      success: true,
      message: `Domain "${domain.normalized_domain}" removed from active inventory. Historical scans preserved.`
    });
  } catch (err) {
    console.error('Delete domain error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove domain: ' + err.message
    });
  }
});

/**
 * GET /api/domains/:id/scans
 * Retrieve all historical audit scans for a domain in reverse chronological order.
 */
router.get('/:id/scans', async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findOne({ id }).lean();
    if (!domain) {
      return res.status(404).json({
        success: false,
        error: `Domain "${id}" not found.`
      });
    }

    const scans = await Scan.find({ domain_id: id })
      .sort({ created_at: -1 })
      .lean();

    return res.json({
      success: true,
      domain: {
        id: domain.id,
        normalizedDomain: domain.normalized_domain,
        displayUrl: domain.display_url,
        latestScore: domain.latest_score,
        lastScanAt: domain.last_scan_at
      },
      scansCount: scans.length,
      scans: scans.map(s => ({
        id: s.id,
        domainId: s.domain_id,
        targetUrl: s.target_url,
        normalizedDomain: s.normalized_domain,
        scanMode: s.scan_mode,
        status: s.status,
        scores: s.scores,
        summary: s.summary,
        startedAt: s.started_at,
        completedAt: s.completed_at
      }))
    });
  } catch (err) {
    console.error('Fetch domain scans error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve scan history: ' + err.message
    });
  }
});

export default router;
