import assert from 'assert';
import { Writable } from 'stream';
import { Scan, Domain, Finding, ScannedPage } from './models/index.js';
import { connectDb, disconnectDb } from './db.js';
import { generateAuditReportPdf } from './scanner/pdfReportGenerator.js';
import express from 'express';
import domainRoutes from './routes/domainRoutes.js';
import scanRoutes from './routes/scanRoutes.js';

console.log('🧪 Starting Phase 8 & 9: Scan History, Comparison & PDF Report Tests...\n');

await connectDb();

// Clean up any test records
await Scan.deleteMany({ id: /^test-cmp-/ });
await Domain.deleteMany({ id: /^test-cmp-/ });
await Finding.deleteMany({ id: /^test-cmp-/ });
await ScannedPage.deleteMany({ id: /^test-cmp-/ });

// Spin up a test Express server
const app = express();
app.use(express.json());
app.use('/api/domains', domainRoutes);
app.use('/api/scans', scanRoutes);

const server = app.listen(5093);
const baseUrl = 'http://127.0.0.1:5093';

try {
  // 1. Create a test domain
  const testDomainId = 'test-cmp-dom-1';
  await Domain.create({
    id: testDomainId,
    user_id: 'usr-tester',
    normalized_domain: 'example-saas.com',
    display_url: 'https://example-saas.com',
    status: 'active',
    latest_score: 85
  });

  // 2. Create Baseline Scan (Scan B)
  const baselineScanId = 'test-cmp-scn-baseline';
  await Scan.create({
    id: baselineScanId,
    domain_id: testDomainId,
    user_id: 'usr-tester',
    target_url: 'https://example-saas.com',
    normalized_domain: 'example-saas.com',
    scan_mode: 'quick',
    status: 'completed',
    scores: {
      overall: 70,
      security: 60,
      performance: 80,
      seo: 70,
      accessibility: 75,
      mobile: 65,
      sslDns: 80
    },
    created_at: new Date(Date.now() - 3600000), // 1 hour ago
    completed_at: new Date(Date.now() - 3500000)
  });

  // Baseline Findings:
  // - sec-missing-hsts: failed
  // - a11y-missing-image-alt: failed
  // - seo-missing-title: failed
  // - perf-slow-ttfb: passed
  await Finding.insertMany([
    {
      id: 'test-cmp-fnd-b1',
      scan_id: baselineScanId,
      domain_id: testDomainId,
      rule_id: 'sec-missing-hsts',
      category: 'security',
      title: 'Missing HSTS',
      description: 'HSTS missing',
      status: 'failed',
      severity: 'high'
    },
    {
      id: 'test-cmp-fnd-b2',
      scan_id: baselineScanId,
      domain_id: testDomainId,
      rule_id: 'a11y-missing-image-alt',
      category: 'accessibility',
      title: 'Images Missing Alt',
      description: 'Images without alt',
      status: 'failed',
      severity: 'medium'
    },
    {
      id: 'test-cmp-fnd-b3',
      scan_id: baselineScanId,
      domain_id: testDomainId,
      rule_id: 'seo-missing-title',
      category: 'seo',
      title: 'Missing Page Title',
      description: 'Title tag absent',
      status: 'failed',
      severity: 'medium'
    },
    {
      id: 'test-cmp-fnd-b4',
      scan_id: baselineScanId,
      domain_id: testDomainId,
      rule_id: 'perf-slow-ttfb',
      category: 'performance',
      title: 'TTFB Latency',
      description: 'Response time within bounds',
      status: 'passed',
      severity: 'info'
    }
  ]);

  // 3. Create Current Scan (Scan A - Remediation Applied & New Bug Added)
  const currentScanId = 'test-cmp-scn-current';
  await Scan.create({
    id: currentScanId,
    domain_id: testDomainId,
    user_id: 'usr-tester',
    target_url: 'https://example-saas.com',
    normalized_domain: 'example-saas.com',
    scan_mode: 'quick',
    status: 'completed',
    scores: {
      overall: 85,
      security: 90,
      performance: 80,
      seo: 100,
      accessibility: 75,
      mobile: 80,
      sslDns: 85
    },
    created_at: new Date(),
    completed_at: new Date()
  });

  // Current Findings:
  // - sec-missing-hsts: passed (RESOLVED!)
  // - seo-missing-title: passed (RESOLVED!)
  // - a11y-missing-image-alt: failed (RECURRING!)
  // - sec-missing-csp: failed (NEW ISSUE!)
  await Finding.insertMany([
    {
      id: 'test-cmp-fnd-c1',
      scan_id: currentScanId,
      domain_id: testDomainId,
      rule_id: 'sec-missing-hsts',
      category: 'security',
      title: 'HSTS Configured',
      description: 'Strict-Transport-Security header present',
      status: 'passed',
      severity: 'info'
    },
    {
      id: 'test-cmp-fnd-c2',
      scan_id: currentScanId,
      domain_id: testDomainId,
      rule_id: 'seo-missing-title',
      category: 'seo',
      title: 'Document Title Element Present',
      description: 'Document has a valid title',
      status: 'passed',
      severity: 'info'
    },
    {
      id: 'test-cmp-fnd-c3',
      scan_id: currentScanId,
      domain_id: testDomainId,
      rule_id: 'a11y-missing-image-alt',
      category: 'accessibility',
      title: 'Images Missing Alt',
      description: 'Images without alt',
      status: 'failed',
      severity: 'medium'
    },
    {
      id: 'test-cmp-fnd-c4',
      scan_id: currentScanId,
      domain_id: testDomainId,
      rule_id: 'sec-missing-csp',
      category: 'security',
      title: 'Missing Content Security Policy',
      description: 'CSP not deployed',
      status: 'failed',
      severity: 'high'
    }
  ]);

  // Page documents for test
  await ScannedPage.create({
    id: 'test-cmp-pg-1',
    scan_id: currentScanId,
    url: 'https://example-saas.com',
    normalized_url: 'https://example-saas.com',
    status_code: 200,
    page_title: 'Example SaaS Enterprise Portal',
    response_time_ms: 220,
    page_size_bytes: 45000
  });

  // ==========================================
  // TEST 1: GET /api/domains/:id/scans
  // ==========================================
  console.log('Test 1: Testing Domain historical scans endpoint (GET /api/domains/:id/scans)...');
  const histRes = await fetch(`${baseUrl}/api/domains/${testDomainId}/scans`);
  assert.strictEqual(histRes.status, 200, 'Historical scans endpoint must return 200');
  const histData = await histRes.json();
  assert(histData.success, 'Response must be success');
  assert.strictEqual(histData.scansCount, 2, 'Domain should have 2 historical scans');
  assert.strictEqual(histData.scans[0].id, currentScanId, 'Most recent scan should be first');
  console.log('✅ Passed: Domain scan history correctly retrieved and chronologically sorted.');

  // ==========================================
  // TEST 2: GET /api/scans/:id/compare/:otherScanId
  // ==========================================
  console.log('\nTest 2: Testing Scan comparison endpoint (GET /api/scans/:id/compare/:otherScanId)...');
  const cmpRes = await fetch(`${baseUrl}/api/scans/${currentScanId}/compare/${baselineScanId}`);
  assert.strictEqual(cmpRes.status, 200, 'Compare endpoint must return 200');
  const cmpData = await cmpRes.json();

  assert(cmpData.success);
  // Score deltas: overall went from 70 to 85 = +15
  assert.strictEqual(cmpData.scoreDeltas.overall, 15, 'Overall delta must be +15');
  assert.strictEqual(cmpData.scoreDeltas.security, 30, 'Security delta must be +30');
  assert.strictEqual(cmpData.scoreDeltas.seo, 30, 'SEO delta must be +30');
  assert.strictEqual(cmpData.summary.improved, true, 'Scan must be marked as improved');

  // New issues: sec-missing-csp was not failing in baseline
  assert.strictEqual(cmpData.summary.newIssuesCount, 1);
  assert.strictEqual(cmpData.diff.newFindings[0].ruleId, 'sec-missing-csp');

  // Resolved issues: sec-missing-hsts and seo-missing-title were resolved
  assert.strictEqual(cmpData.summary.resolvedIssuesCount, 2);
  const resolvedRuleIds = cmpData.diff.resolvedFindings.map(f => f.ruleId);
  assert(resolvedRuleIds.includes('sec-missing-hsts'));
  assert(resolvedRuleIds.includes('seo-missing-title'));

  // Recurring issues: a11y-missing-image-alt failed in both
  assert.strictEqual(cmpData.summary.recurringIssuesCount, 1);
  assert.strictEqual(cmpData.diff.recurringFindings[0].ruleId, 'a11y-missing-image-alt');
  console.log('✅ Passed: Comparison logic accurately computed score deltas, new bugs, resolved issues, and recurring items.');

  // ==========================================
  // TEST 3: Direct PDF Generation Stream Test
  // ==========================================
  console.log('\nTest 3: Testing PDF Report Generator stream...');
  const chunks = [];
  const mockWritable = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    }
  });

  const scanDoc = await Scan.findOne({ id: currentScanId }).lean();
  const findingsList = await Finding.find({ scan_id: currentScanId }).lean();
  const pagesList = await ScannedPage.find({ scan_id: currentScanId }).lean();

  await new Promise((resolve, reject) => {
    mockWritable.on('finish', resolve);
    mockWritable.on('error', reject);
    generateAuditReportPdf({
      scan: scanDoc,
      findings: findingsList,
      pages: pagesList,
      res: mockWritable
    });
  });

  const pdfBuffer = Buffer.concat(chunks);
  assert(pdfBuffer.length > 1000, `PDF buffer length should be substantial, received ${pdfBuffer.length} bytes`);
  const pdfHeader = pdfBuffer.slice(0, 5).toString('ascii');
  assert.strictEqual(pdfHeader, '%PDF-', 'PDF file must start with valid PDF magic bytes');
  console.log(`✅ Passed: PDF successfully compiled into ${pdfBuffer.length} bytes with valid PDF structure.`);

  // ==========================================
  // TEST 4: GET /api/scans/:id/pdf HTTP Download Test
  // ==========================================
  console.log('\nTest 4: Testing PDF Download HTTP endpoint (GET /api/scans/:id/pdf)...');
  const pdfRes = await fetch(`${baseUrl}/api/scans/${currentScanId}/pdf`);
  assert.strictEqual(pdfRes.status, 200, 'PDF endpoint must return 200');
  assert.strictEqual(pdfRes.headers.get('content-type'), 'application/pdf');
  assert(pdfRes.headers.get('content-disposition').includes('attachment'), 'Content-Disposition must be attachment');
  const streamedPdf = await pdfRes.arrayBuffer();
  assert(streamedPdf.byteLength > 1000, 'Streamed PDF body must be > 1000 bytes');
  console.log('✅ Passed: PDF HTTP streaming endpoint verified.');

  console.log('\n🎉 ALL Phase 8 & 9 Comparison & PDF tests passed successfully!\n');
} finally {
  server.close();
  // Cleanup test records
  await Scan.deleteMany({ id: /^test-cmp-/ });
  await Domain.deleteMany({ id: /^test-cmp-/ });
  await Finding.deleteMany({ id: /^test-cmp-/ });
  await ScannedPage.deleteMany({ id: /^test-cmp-/ });
  await disconnectDb();
}
