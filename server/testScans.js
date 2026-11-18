import assert from 'assert';
import { app } from './server.js';
import { initMongoDb } from './initMongoDb.js';
import { disconnectDb } from './db.js';
import { Scan, ScannedPage, Finding } from './models/index.js';
import { extractLinks, normalizeCrawlUrl, parseRobotsTxt } from './scanner/crawler.js';

const TEST_PORT = 5097;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runScanTests() {
  console.log('🌐 ========================================================');
  console.log('🌐 TESTING PHASE 2: SCAN ORCHESTRATION & CRAWLER PIPELINE');
  console.log('🌐 ========================================================\n');

  let server;
  try {
    await initMongoDb();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`📡 Scan test server running on port ${TEST_PORT}`);
        resolve();
      });
    });

    const mockUserId = 'usr-test-auditor';

    // 1. SSRF Guard on Scan Creation
    console.log('🔹 1. Testing SSRF Rejection on Scan Creation (127.0.0.1)...');
    const ssrfRes = await fetch(`${BASE_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': mockUserId },
      body: JSON.stringify({ url: 'http://127.0.0.1/admin', scanMode: 'quick' })
    });
    assert.strictEqual(ssrfRes.status, 400);
    const ssrfData = await ssrfRes.json();
    assert.strictEqual(ssrfData.success, false);
    console.log('   ✅ SSRF successfully rejected on scan endpoint.');

    // 2. Crawler Unit Tests (Link extraction, URL deduplication, robots.txt)
    console.log('🔹 2. Testing Crawler Link Discovery & Normalization...');
    const testHtml = `
      <html>
        <body>
          <a href="/about">About Us</a>
          <a href="https://example.com/contact?utm_source=twitter#team">Contact Team</a>
          <a href="https://external.com/partner">External Site</a>
          <a href="/assets/manual.pdf">PDF Document</a>
          <a href="javascript:void(0)">Action</a>
        </body>
      </html>
    `;
    const links = extractLinks(testHtml, 'https://example.com', 'https://example.com');
    assert.strictEqual(links.length, 2);
    assert(links.includes('https://example.com/about'));
    assert(links.includes('https://example.com/contact'));
    console.log('   ✅ Same-origin links extracted, parameters/hashes stripped, external & PDF links ignored.');

    console.log('🔹 3. Testing robots.txt Disallow Parser...');
    const sampleRobots = `
      User-agent: *
      Disallow: /admin/
      Disallow: /private
      Allow: /public
    `;
    const disallowed = parseRobotsTxt(sampleRobots);
    assert.strictEqual(disallowed.length, 2);
    assert(disallowed.includes('/admin/'));
    assert(disallowed.includes('/private'));
    console.log('   ✅ robots.txt Disallow directives correctly parsed.');

    // 4. Quick Scan Initiation
    console.log('🔹 4. Testing POST /api/scans (Quick Scan Creation)...');
    // Clear previous test scans for example.com
    await Scan.deleteMany({ normalized_domain: 'example.com' });

    const createRes = await fetch(`${BASE_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': mockUserId },
      body: JSON.stringify({ url: 'https://example.com', scanMode: 'quick' })
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    assert.strictEqual(createData.success, true);
    assert.strictEqual(createData.status, 'queued');
    assert.strictEqual(createData.scanMode, 'quick');
    const scanId = createData.scanId;
    console.log(`   ✅ Quick Scan initiated with ID: ${scanId}`);

    // 5. Duplicate Active Scan Prevention
    console.log('🔹 5. Testing Duplicate Active Scan Prevention (409 Conflict)...');
    const dupRes = await fetch(`${BASE_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': mockUserId },
      body: JSON.stringify({ url: 'https://example.com', scanMode: 'quick' })
    });
    assert.strictEqual(dupRes.status, 409);
    const dupData = await dupRes.json();
    assert.strictEqual(dupData.success, false);
    console.log('   ✅ Duplicate scan correctly rejected (409 Conflict).');

    // 6. Monitor Honest Progress & Lifecycle until Completion
    console.log('🔹 6. Polling Live Scan Progress (validating -> crawling -> scanning -> scoring -> completed)...');
    let scanDoc = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 800));
      const pollRes = await fetch(`${BASE_URL}/scans/${scanId}`);
      assert.strictEqual(pollRes.status, 200);
      const pollData = await pollRes.json();
      scanDoc = pollData.scan;
      console.log(`   [Attempt ${attempts + 1}] Status: ${scanDoc.status} | Progress: ${scanDoc.progress.percent}% | Step: ${scanDoc.progress.currentStep}`);

      if (['completed', 'completed_with_warnings', 'failed'].includes(scanDoc.status)) {
        break;
      }
      attempts++;
    }

    assert(scanDoc, 'Scan document should exist');
    assert(['completed', 'completed_with_warnings'].includes(scanDoc.status), `Scan should complete successfully, got: ${scanDoc.status}`);
    assert.strictEqual(scanDoc.progress.percent, 100);
    assert.strictEqual(scanDoc.progress.maxPages, 1);
    assert(scanDoc.scores.overall > 0, 'Overall score should be calculated');
    console.log(`   ✅ Scan finished with Overall Health Score: ${scanDoc.scores.overall}/100`);

    // 7. Inspect Scan Results & Findings
    console.log('🔹 7. Testing GET /api/scans/:id/results (Stored Pages & Findings)...');
    const resultsRes = await fetch(`${BASE_URL}/scans/${scanId}/results`);
    assert.strictEqual(resultsRes.status, 200);
    const resultsData = await resultsRes.json();
    assert.strictEqual(resultsData.success, true);
    assert.strictEqual(resultsData.pagesCount, 1);
    assert(resultsData.findingsCount > 0, 'Should have evaluated findings');

    const firstFinding = resultsData.findings[0];
    assert(firstFinding.ruleId, 'Finding must have a ruleId');
    assert(firstFinding.severity, 'Finding must have a severity');
    assert(firstFinding.recommendation, 'Finding must include recommendations');
    console.log(`   ✅ ${resultsData.findingsCount} findings retrieved. Sample finding: [${firstFinding.severity.toUpperCase()}] ${firstFinding.title}`);

    // 8. Cancellation Flow Test
    console.log('🔹 8. Testing POST /api/scans/:id/cancel...');
    // Create a new scan
    const cancelTarget = `https://example.org`;
    await Scan.deleteMany({ normalized_domain: 'example.org' });
    const cancelRes = await fetch(`${BASE_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': mockUserId },
      body: JSON.stringify({ url: cancelTarget, scanMode: 'full' })
    });
    const cancelData = await cancelRes.json();
    const cancelScanId = cancelData.scanId;

    // Immediately trigger cancel
    const doCancelRes = await fetch(`${BASE_URL}/scans/${cancelScanId}/cancel`, {
      method: 'POST'
    });
    assert.strictEqual(doCancelRes.status, 200);
    const doCancelData = await doCancelRes.json();
    assert.strictEqual(doCancelData.success, true);

    const checkCancelRes = await fetch(`${BASE_URL}/scans/${cancelScanId}`);
    const checkCancelData = await checkCancelRes.json();
    assert.strictEqual(checkCancelData.scan.status, 'cancelled');
    console.log('   ✅ Scan cancellation verified.');

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL PHASE 2 SCAN TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('🎉 ========================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await disconnectDb();
  }
}

runScanTests().catch((err) => {
  console.error('❌ Scan test failed:', err);
  process.exit(1);
});
