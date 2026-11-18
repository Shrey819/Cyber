import { Scan, ScannedPage, Finding, Domain } from '../models/index.js';
import { crawlWebsite } from './crawler.js';
import { auditPageAccessibility, calculateAccessibilityScore } from './engines/accessibilityEngine.js';
import { auditPageMobile, calculateMobileScore } from './engines/mobileEngine.js';
import { auditSslAndDns, calculateSslDnsScore } from './engines/sslDnsEngine.js';
import { consolidateFindings } from './recommendations.js';

class ScanCoordinator {
  constructor() {
    this.activeScans = new Map(); // scanId -> { abortRequested: boolean }
  }

  /**
   * Request cancellation of a running scan.
   * @param {string} scanId
   * @returns {Promise<boolean>}
   */
  async cancelScan(scanId) {
    const task = this.activeScans.get(scanId);
    if (task) {
      task.abortRequested = true;
    }

    const updated = await Scan.findOneAndUpdate(
      { id: scanId, status: { $in: ['queued', 'validating', 'crawling', 'scanning', 'scoring'] } },
      {
        $set: {
          status: 'cancelled',
          'progress.stage': 'cancelled',
          'progress.currentStep': 'Scan was cancelled by user.',
          completed_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return Boolean(updated);
  }

  /**
   * Enqueue and run a scan asynchronously.
   * @param {string} scanId
   */
  async enqueueScan(scanId) {
    this.activeScans.set(scanId, { abortRequested: false });

    // Run asynchronously without blocking caller
    setImmediate(async () => {
      try {
        await this._executeScan(scanId);
      } catch (err) {
        const isCancelled = this.activeScans.get(scanId)?.abortRequested;
        if (isCancelled || err.message?.includes('cancelled')) {
          await Scan.updateOne(
            { id: scanId },
            {
              $set: {
                status: 'cancelled',
                'progress.stage': 'cancelled',
                'progress.currentStep': 'Scan was cancelled by user.',
                completed_at: new Date()
              }
            }
          );
        } else {
          console.error(`[ScanCoordinator] Error executing scan ${scanId}:`, err);
          await Scan.updateOne(
            { id: scanId, status: { $ne: 'cancelled' } },
            {
              $set: {
                status: 'failed',
                error_message: err.message,
                'progress.stage': 'failed',
                'progress.currentStep': `Failed: ${err.message}`,
                completed_at: new Date()
              }
            }
          );
        }
      } finally {
        this.activeScans.delete(scanId);
      }
    });
  }

  /**
   * Internal execution pipeline for a scan.
   */
  async _executeScan(scanId) {
    const scan = await Scan.findOne({ id: scanId });
    if (!scan) return;

    const isCancelled = () => {
      const task = this.activeScans.get(scanId);
      return task ? task.abortRequested : false;
    };

    if (isCancelled() || scan.status === 'cancelled') return;

    const startedDoc = await Scan.findOneAndUpdate(
      { id: scanId, status: { $ne: 'cancelled' } },
      {
        $set: {
          status: 'validating',
          started_at: new Date(),
          'progress.stage': 'validating',
          'progress.percent': 5,
          'progress.currentStep': 'Validating target domain safety and DNS...'
        }
      },
      { returnDocument: 'after' }
    );

    if (!startedDoc || isCancelled() || startedDoc.status === 'cancelled') return;

    // 1. Run Crawler
    const { pages, crawlCapped, robotsDisallowedCount } = await crawlWebsite({
      targetUrl: scan.target_url,
      scanMode: scan.scan_mode,
      onProgress: async (p) => {
        if (isCancelled()) return;
        await Scan.updateOne(
          { id: scanId, status: { $ne: 'cancelled' } },
          {
            $set: {
              status: p.stage,
              'progress.stage': p.stage,
              'progress.percent': p.percent,
              'progress.currentStep': p.currentStep,
              'progress.pagesDiscovered': p.pagesDiscovered,
              'progress.pagesAudited': p.pagesAudited,
              'progress.maxPages': p.maxPages
            }
          }
        );
      },
      isCancelled
    });

    if (isCancelled()) {
      await Scan.updateOne(
        { id: scanId },
        {
          $set: {
            status: 'cancelled',
            'progress.stage': 'cancelled',
            'progress.currentStep': 'Scan was cancelled by user.',
            completed_at: new Date()
          }
        }
      );
      return;
    }

    // 2. Persist Scanned Pages
    const scanningDoc = await Scan.findOneAndUpdate(
      { id: scanId, status: { $ne: 'cancelled' } },
      {
        $set: {
          status: 'scanning',
          'progress.stage': 'scanning',
          'progress.percent': 88,
          'progress.currentStep': 'Analyzing collected pages and technical telemetry...',
          'progress.pagesAudited': pages.length,
          'progress.crawlCapped': crawlCapped
        }
      },
      { returnDocument: 'after' }
    );
    if (!scanningDoc || isCancelled()) return;

    const pageDocs = [];
    for (const p of pages) {
      const pgId = `pg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      pageDocs.push({
        id: pgId,
        scan_id: scanId,
        url: p.url,
        normalized_url: p.normalizedUrl,
        status_code: p.statusCode,
        content_type: p.contentType,
        response_time_ms: p.responseTimeMs,
        page_title: p.pageTitle,
        page_size_bytes: p.pageSizeBytes,
        links_discovered: p.linksDiscovered,
        error: p.error
      });
    }
    if (pageDocs.length > 0) {
      await ScannedPage.insertMany(pageDocs);
    }

    // 3. Run Baseline Audit Checks on Pages
    const rawFindings = this._evaluatePageFindings(scanId, scan.domain_id, pages);

    // 3b. Run SSL and DNS Checks (Phase 5)
    try {
      const sslDnsFindings = await auditSslAndDns({
        hostname: scan.normalized_domain,
        url: scan.target_url
      });
      for (const sf of sslDnsFindings) {
        rawFindings.push({
          id: `fnd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          scan_id: scanId,
          domain_id: scan.domain_id,
          rule_id: sf.rule_id,
          category: 'ssl_dns',
          title: sf.title,
          description: sf.description,
          status: sf.status,
          severity: sf.severity,
          confidence: sf.confidence || 1.0,
          affected_urls: sf.affected_urls || [scan.target_url],
          evidence: sf.evidence || {},
          recommendation: sf.recommendation || {}
        });
      }
    } catch (sslErr) {
      console.warn(`[ScanCoordinator] SSL/DNS audit warning for ${scan.normalized_domain}:`, sslErr.message);
    }

    // 3c. Consolidate & Deduplicate across multi-page crawls, and enrich with Recommendation Engine (Phase 6 & 7)
    const findings = consolidateFindings(rawFindings, scanId, scan.domain_id);

    if (findings.length > 0) {
      await Finding.insertMany(findings);
    }

    if (isCancelled()) return;

    // 4. Scoring Stage
    const scoringDoc = await Scan.findOneAndUpdate(
      { id: scanId, status: { $ne: 'cancelled' } },
      {
        $set: {
          status: 'scoring',
          'progress.stage': 'scoring',
          'progress.percent': 96,
          'progress.currentStep': 'Calculating category health scores...'
        }
      },
      { returnDocument: 'after' }
    );
    if (!scoringDoc || isCancelled()) return;

    const { scores, summary } = this._calculateScores(findings, pages);

    // 5. Finalize Scan
    const anyErrors = pages.some(p => p.error);
    const finalStatus = anyErrors && pages.length > 1 ? 'completed_with_warnings' : 'completed';
    const completedAt = new Date();

    const finalizedDoc = await Scan.findOneAndUpdate(
      { id: scanId, status: { $ne: 'cancelled' } },
      {
        $set: {
          status: finalStatus,
          'progress.stage': 'completed',
          'progress.percent': 100,
          'progress.currentStep': 'Website audit completed successfully.',
          'progress.completedCategories': ['security', 'performance', 'seo', 'accessibility', 'mobile', 'ssl_dns'],
          scores,
          summary,
          completed_at: completedAt
        }
      },
      { returnDocument: 'after' }
    );

    if (!finalizedDoc || finalizedDoc.status === 'cancelled') return;

    // 6. Update Domain Record if associated
    if (scan.domain_id) {
      await Domain.updateOne(
        { id: scan.domain_id },
        {
          $set: {
            latest_scan_id: scan.id,
            latest_score: scores.overall,
            last_scan_at: completedAt
          }
        }
      );
    }
  }

  /**
   * Deterministic baseline finding evaluation.
   */
  _evaluatePageFindings(scanId, domainId, pages) {
    const findings = [];
    if (!pages || pages.length === 0) return findings;

    const homepage = pages[0];
    const headers = homepage.headers || {};

    const addFinding = ({ rule_id, category, title, description, status, severity, affected_urls, evidence, recommendation }) => {
      findings.push({
        id: `fnd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        scan_id: scanId,
        domain_id: domainId,
        rule_id,
        category,
        title,
        description,
        status,
        severity,
        affected_urls: affected_urls || [homepage.url],
        evidence: evidence || {},
        recommendation: recommendation || {}
      });
    };

    // A. Security: Strict-Transport-Security (HSTS)
    const hsts = headers['strict-transport-security'];
    if (!hsts) {
      addFinding({
        rule_id: 'sec-missing-hsts',
        category: 'security',
        title: 'Missing HTTP Strict Transport Security (HSTS)',
        description: 'The server does not send an HSTS header, leaving connections susceptible to man-in-the-middle SSL stripping attacks.',
        status: 'failed',
        severity: 'high',
        evidence: { header: 'strict-transport-security', observed: null, expected: 'max-age=31536000; includeSubDomains' },
        recommendation: {
          action: 'Enable HTTP Strict Transport Security',
          whyItMatters: 'Forces compliant browsers to always communicate with your domain over secure HTTPS.',
          codeSnippet: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
          effort: 'easy'
        }
      });
    } else {
      addFinding({
        rule_id: 'sec-missing-hsts',
        category: 'security',
        title: 'HTTP Strict Transport Security (HSTS) Configured',
        description: 'Server properly enforces HSTS.',
        status: 'passed',
        severity: 'info',
        evidence: { header: 'strict-transport-security', observed: hsts }
      });
    }

    // B. Security: Content-Security-Policy (CSP)
    const csp = headers['content-security-policy'];
    if (!csp) {
      addFinding({
        rule_id: 'sec-missing-csp',
        category: 'security',
        title: 'Missing Content-Security-Policy (CSP) Header',
        description: 'No Content-Security-Policy header detected. This significantly increases risk from Cross-Site Scripting (XSS) and code injection.',
        status: 'failed',
        severity: 'high',
        evidence: { header: 'content-security-policy', observed: null },
        recommendation: {
          action: 'Deploy a Content Security Policy',
          whyItMatters: 'Restricts sources from which scripts, images, and style assets can be loaded, mitigating XSS attacks.',
          codeSnippet: "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';",
          effort: 'medium'
        }
      });
    }

    // C. Security: X-Frame-Options (Clickjacking)
    const xfo = headers['x-frame-options'];
    if (!xfo) {
      addFinding({
        rule_id: 'sec-missing-xfo',
        category: 'security',
        title: 'Missing X-Frame-Options Header',
        description: 'Page does not forbid iframing, leaving users vulnerable to clickjacking overlay attacks.',
        status: 'failed',
        severity: 'medium',
        evidence: { header: 'x-frame-options', observed: null },
        recommendation: {
          action: 'Set X-Frame-Options to DENY or SAMEORIGIN',
          whyItMatters: 'Prevents untrusted third-party sites from framing your application.',
          codeSnippet: 'X-Frame-Options: SAMEORIGIN',
          effort: 'easy'
        }
      });
    }

    // D. Performance: Slow Response Time (TTFB)
    const slowPages = pages.filter(p => p.responseTimeMs > 1200);
    if (slowPages.length > 0) {
      addFinding({
        rule_id: 'perf-slow-ttfb',
        category: 'performance',
        title: 'High Server Response Latency',
        description: `${slowPages.length} audited page(s) took longer than 1,200ms to respond.`,
        status: 'failed',
        severity: 'medium',
        affected_urls: slowPages.map(p => p.url),
        evidence: { slowPagesCount: slowPages.length, slowestMs: Math.max(...slowPages.map(p => p.responseTimeMs)) },
        recommendation: {
          action: 'Optimize backend query execution and enable edge caching',
          whyItMatters: 'Fast server response times directly improve search rankings and visitor retention.',
          effort: 'medium'
        }
      });
    }

    // E. SEO: Missing Page Title
    const missingTitles = pages.filter(p => !p.pageTitle && p.statusCode === 200);
    if (missingTitles.length > 0) {
      addFinding({
        rule_id: 'seo-missing-title',
        category: 'seo',
        title: 'Missing Document Title Element',
        description: `${missingTitles.length} page(s) lack a <title> tag.`,
        status: 'failed',
        severity: 'medium',
        affected_urls: missingTitles.map(p => p.url),
        recommendation: {
          action: 'Add unique, descriptive <title> tags to every page',
          whyItMatters: 'The page title is the primary anchor text search engines display in search results.',
          codeSnippet: '<title>Descriptive Page Name | Brand</title>',
          effort: 'easy'
        }
      });
    }

    // F. Accessibility Auditing Engine (Phase 3)
    for (const page of pages) {
      if (page.html) {
        const a11yFindings = auditPageAccessibility({ url: page.url, html: page.html });
        for (const af of a11yFindings) {
          findings.push({
            id: `fnd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            scan_id: scanId,
            domain_id: domainId,
            rule_id: af.rule_id,
            category: 'accessibility',
            title: af.title,
            description: af.description,
            status: af.status,
            severity: af.severity,
            confidence: af.confidence || 1.0,
            affected_urls: af.affected_urls || [page.url],
            evidence: af.evidence || {},
            recommendation: af.recommendation || {}
          });
        }
      }
    }

    // G. Mobile Viewport Auditing Engine (Phase 4)
    for (const page of pages) {
      if (page.html) {
        const mobFindings = auditPageMobile({ url: page.url, html: page.html });
        for (const mf of mobFindings) {
          findings.push({
            id: `fnd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            scan_id: scanId,
            domain_id: domainId,
            rule_id: mf.rule_id,
            category: 'mobile',
            title: mf.title,
            description: mf.description,
            status: mf.status,
            severity: mf.severity,
            confidence: mf.confidence || 1.0,
            affected_urls: mf.affected_urls || [page.url],
            evidence: mf.evidence || {},
            recommendation: mf.recommendation || {}
          });
        }
      }
    }

    return findings;
  }

  /**
   * Deterministic category and overall score calculator.
   */
  _calculateScores(findings, pages) {
    let securityScore = 100;
    let performanceScore = 100;
    let seoScore = 100;

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let info = 0;
    let passed = 0;

    for (const f of findings) {
      if (f.status === 'passed') {
        passed++;
        continue;
      }

      if (f.severity === 'critical') {
        critical++;
        if (f.category === 'security') securityScore -= 30;
        if (f.category === 'performance') performanceScore -= 25;
      } else if (f.severity === 'high') {
        high++;
        if (f.category === 'security') securityScore -= 18;
        if (f.category === 'performance') performanceScore -= 15;
        if (f.category === 'seo') seoScore -= 15;
      } else if (f.severity === 'medium') {
        medium++;
        if (f.category === 'security') securityScore -= 10;
        if (f.category === 'performance') performanceScore -= 10;
        if (f.category === 'seo') seoScore -= 10;
      } else {
        low++;
        if (f.category === 'security') securityScore -= 5;
        if (f.category === 'performance') performanceScore -= 5;
      }
    }

    // Performance penalties based on avg load time
    const avgResponseTime = pages.length > 0 
      ? pages.reduce((acc, p) => acc + (p.responseTimeMs || 0), 0) / pages.length 
      : 0;

    if (avgResponseTime > 2000) performanceScore -= 20;
    else if (avgResponseTime > 1000) performanceScore -= 10;

    securityScore = Math.max(10, Math.min(100, securityScore));
    performanceScore = Math.max(10, Math.min(100, performanceScore));
    seoScore = Math.max(15, Math.min(100, seoScore));

    // Calculate SSL & DNS Category Score (Phase 5)
    const sslDnsFindings = findings.filter(f => f.category === 'ssl_dns');
    const sslDnsScore = calculateSslDnsScore(sslDnsFindings);

    // Calculate Accessibility Category Score (Phase 3)
    const a11yFindings = findings.filter(f => f.category === 'accessibility');
    const accessibilityScore = calculateAccessibilityScore(a11yFindings);

    // Calculate Mobile Category Score (Phase 4)
    const mobileFindings = findings.filter(f => f.category === 'mobile');
    const mobileScore = calculateMobileScore(mobileFindings);

    // Weighted Overall Score (Security 20%, Perf 20%, SEO 15%, Accessibility 15%, Mobile 15%, SSL/DNS 15%)
    const overall = Math.round(
      securityScore * 0.20 +
      performanceScore * 0.20 +
      seoScore * 0.15 +
      accessibilityScore * 0.15 +
      mobileScore * 0.15 +
      sslDnsScore * 0.15
    );

    return {
      scores: {
        overall,
        security: securityScore,
        performance: performanceScore,
        seo: seoScore,
        accessibility: accessibilityScore,
        mobile: mobileScore,
        sslDns: sslDnsScore
      },
      summary: {
        totalFindings: findings.length,
        critical,
        high,
        medium,
        low,
        info,
        passedTests: passed,
        skippedTests: 0
      }
    };
  }
}

export const scanCoordinator = new ScanCoordinator();
export default scanCoordinator;
