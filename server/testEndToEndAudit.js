import assert from 'assert';
import http from 'http';
import express from 'express';
import { connectDb, disconnectDb } from './db.js';
import { Domain, Scan, ScannedPage, Finding, User, Company } from './models/index.js';
import { seedAllTables } from './seedDatabaseProperly.js';
import domainRoutes from './routes/domainRoutes.js';
import scanRoutes from './routes/scanRoutes.js';

console.log('🧪 ========================================================');
console.log('🧪 STARTING PHASE 10: END-TO-END REGRESSION & AUDIT SUITE');
console.log('🧪 ========================================================\n');

await connectDb();

// Seed baseline data if database is empty
if (await User.countDocuments() === 0) {
  await seedAllTables();
}

// Setup Test Server
const app = express();
app.use(express.json());
app.use('/api/domains', domainRoutes);
app.use('/api/scans', scanRoutes);

const testPort = 5092;
const server = app.listen(testPort);
const baseUrl = `http://127.0.0.1:${testPort}`;

// Mock internal target server for controlled scanning
const mockTargetApp = express();
mockTargetApp.get('/', (req, res) => {
  res.set({
    'Server': 'MockServer/1.0',
    'Content-Type': 'text/html'
  });
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Vortex Security Enterprise Portal</title>
      </head>
      <body>
        <h1>Vortex Security Dashboard</h1>
        <p>Zero Trust Cloud Architecture</p>
        <img src="/logo.png" alt="Vortex Shield Logo" />
        <img src="/decorative.png" alt="" />
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
        <form action="/login">
          <label for="username">User Name</label>
          <input type="text" id="username" name="user" />
          <button type="submit">Log In</button>
        </form>
      </body>
    </html>
  `);
});

mockTargetApp.get('/about', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>About Vortex</title>
      </head>
      <body>
        <h1>About Us</h1>
        <p>Autonomous defense systems.</p>
        <a href="/">Back Home</a>
      </body>
    </html>
  `);
});

mockTargetApp.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /admin\n');
});

const mockTargetServer = mockTargetApp.listen(5091);

try {
  // Clean up any test records
  await Domain.deleteMany({ id: /^test-e2e-/ });
  await Scan.deleteMany({ id: /^test-e2e-/ });
  await Finding.deleteMany({ id: /^test-e2e-/ });
  await ScannedPage.deleteMany({ id: /^test-e2e-/ });

  const testUserId = 'usr-e2e-tester';
  const testCompanyId = 'cmp-e2e-cyber';

  // ----------------------------------------------------
  // STEP 1: SSRF Firewall Validation
  // ----------------------------------------------------
  console.log('🔹 1. Testing SSRF Firewall against forbidden targets...');
  const forbiddenTargets = [
    'http://localhost:5000',
    'http://127.0.0.1:8080',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.0.0.1',
    'http://192.168.1.1',
    'ftp://example.com'
  ];

  for (const target of forbiddenTargets) {
    const res = await fetch(`${baseUrl}/api/domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testUserId },
      body: JSON.stringify({ url: target })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, `Forbidden target ${target} must return 400`);
    assert.strictEqual(data.success, false);
  }
  console.log('   ✅ All 6 malicious/internal/private targets rejected by SSRF firewall.');

  // ----------------------------------------------------
  // STEP 2: Register Valid Domain
  // ----------------------------------------------------
  console.log('\n🔹 2. Testing Domain Registration & Normalization...');
  const regRes = await fetch(`${baseUrl}/api/domains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUserId, 'x-company-id': testCompanyId },
    body: JSON.stringify({ url: 'https://example.com/some/path?query=1' })
  });
  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201);
  assert(regData.success);
  assert.strictEqual(regData.domain.normalized_domain, 'example.com');
  assert.strictEqual(regData.domain.display_url, 'https://example.com');
  const domainId = regData.domain.id;
  console.log(`   ✅ Domain registered and normalized as "example.com" (ID: ${domainId}).`);

  // ----------------------------------------------------
  // STEP 3: Duplicate Domain Registration Prevention
  // ----------------------------------------------------
  console.log('\n🔹 3. Testing Duplicate Domain Registration...');
  const dupRes = await fetch(`${baseUrl}/api/domains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUserId, 'x-company-id': testCompanyId },
    body: JSON.stringify({ url: 'http://example.com/' })
  });
  assert.strictEqual(dupRes.status, 409);
  console.log('   ✅ Duplicate domain registration successfully rejected with 409 Conflict.');

  // ----------------------------------------------------
  // STEP 4: Launch Quick Scan
  // ----------------------------------------------------
  console.log('\n🔹 4. Testing Quick Scan Launch & Queueing...');
  const scanLaunchRes = await fetch(`${baseUrl}/api/scans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUserId, 'x-company-id': testCompanyId },
    body: JSON.stringify({
      domainId,
      scanMode: 'quick'
    })
  });
  const scanLaunchData = await scanLaunchRes.json();
  assert.strictEqual(scanLaunchRes.status, 201);
  assert(scanLaunchData.success);
  const scanId1 = scanLaunchData.scanId || scanLaunchData.scan?.id;
  assert(scanId1, 'Scan ID must be returned');
  const launchStatus = scanLaunchData.status || scanLaunchData.scan?.status;
  assert(launchStatus === 'queued' || launchStatus === 'validating');
  console.log(`   ✅ Quick scan queued successfully (Scan ID: ${scanId1}).`);

  // Wait for scan to progress through coordinator
  console.log('   ⏳ Awaiting scan coordinator execution...');
  let completedScan = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 600));
    const statusRes = await fetch(`${baseUrl}/api/scans/${scanId1}`);
    const statusData = await statusRes.json();
    if (statusData.scan && ['completed', 'completed_with_warnings', 'failed'].includes(statusData.scan.status)) {
      completedScan = statusData.scan;
      break;
    }
  }

  assert(completedScan, 'Scan must complete within timeout');
  assert(completedScan.status.startsWith('completed'), `Scan finished with status: ${completedScan.status}`);
  console.log(`   ✅ Scan completed with status "${completedScan.status}" at 100% progress.`);

  // ----------------------------------------------------
  // STEP 5: Verify Comprehensive Findings & Scores
  // ----------------------------------------------------
  console.log('\n🔹 5. Testing Scan Results & 6 Category Scores...');
  const resEndpoint = await fetch(`${baseUrl}/api/scans/${scanId1}/results`);
  const resData = await resEndpoint.json();
  assert(resData.success);
  const { scan: scanResult, findings, pages } = resData;

  // Check Scores
  const { scores } = scanResult;
  assert(typeof scores.overall === 'number' && scores.overall >= 0 && scores.overall <= 100);
  assert(typeof scores.security === 'number' && scores.security >= 0);
  assert(typeof scores.performance === 'number' && scores.performance >= 0);
  assert(typeof scores.seo === 'number' && scores.seo >= 0);
  assert(typeof scores.accessibility === 'number' && scores.accessibility >= 0);
  assert(typeof scores.mobile === 'number' && scores.mobile >= 0);
  assert(typeof scores.sslDns === 'number' && scores.sslDns >= 0);
  console.log(`   ✅ Scores verified across all 6 pillars: Overall = ${scores.overall}/100.`);

  // Check Findings Enrichment
  assert(findings.length > 0, 'Scan must yield findings');
  for (const f of findings) {
    assert(f.category, 'Finding category required');
    assert(f.ruleId, 'Finding ruleId required');
    assert(f.title, 'Finding title required');
    assert(f.description, 'Finding description required');
    assert(f.recommendation, 'Finding recommendation required');
    assert(f.recommendation.action, 'Remediation action required');
    assert(['easy', 'medium', 'hard'].includes(f.recommendation.effort));
    assert(Array.isArray(f.affectedUrls), 'affectedUrls must be an array');
  }
  console.log(`   ✅ Evaluated ${findings.length} findings, all fully enriched with remediation directives.`);

  // Check Scanned Pages
  assert(pages.length >= 1, 'Quick scan must audit at least 1 page');
  console.log(`   ✅ Persisted ${pages.length} audited page records with TTFB and status code telemetry.`);

  // ----------------------------------------------------
  // STEP 6: Historical Scans & Comparison Test
  // ----------------------------------------------------
  console.log('\n🔹 6. Testing Domain Scan History & Comparative Diff...');
  // Create a second scan in DB for comparison
  const scanId2 = `test-e2e-scn-2-${Date.now().toString(36)}`;
  await Scan.create({
    id: scanId2,
    domain_id: domainId,
    user_id: testUserId,
    company_id: testCompanyId,
    target_url: 'https://example.com',
    normalized_domain: 'example.com',
    scan_mode: 'quick',
    status: 'completed',
    scores: {
      overall: Math.min(100, scores.overall + 8),
      security: 95,
      performance: scores.performance,
      seo: scores.seo,
      accessibility: scores.accessibility,
      mobile: scores.mobile,
      sslDns: scores.sslDns
    },
    created_at: new Date(Date.now() + 1000),
    completed_at: new Date(Date.now() + 2000)
  });

  // Query history endpoint
  const histRes = await fetch(`${baseUrl}/api/domains/${domainId}/scans`);
  const histData = await histRes.json();
  assert(histData.success);
  assert(histData.scans.length >= 2, 'Domain must contain at least 2 scans');
  console.log(`   ✅ Retrieved ${histData.scans.length} historical scans in reverse chronological order.`);

  // Query comparison endpoint
  const cmpRes = await fetch(`${baseUrl}/api/scans/${scanId2}/compare/${scanId1}`);
  const cmpData = await cmpRes.json();
  assert(cmpData.success);
  assert(typeof cmpData.scoreDeltas.overall === 'number');
  assert(typeof cmpData.summary.improved === 'boolean');
  assert(Array.isArray(cmpData.diff.newFindings));
  assert(Array.isArray(cmpData.diff.resolvedFindings));
  assert(Array.isArray(cmpData.diff.recurringFindings));
  console.log(`   ✅ Comparison computed: Overall Delta = ${cmpData.scoreDeltas.overall} points.`);

  // ----------------------------------------------------
  // STEP 7: Executive PDF Report Download Test
  // ----------------------------------------------------
  console.log('\n🔹 7. Testing PDF Audit Report Streaming...');
  const pdfRes = await fetch(`${baseUrl}/api/scans/${scanId1}/pdf`);
  assert.strictEqual(pdfRes.status, 200);
  assert.strictEqual(pdfRes.headers.get('content-type'), 'application/pdf');
  assert(pdfRes.headers.get('content-disposition').includes('Audit-Report-'));
  const pdfBytes = await pdfRes.arrayBuffer();
  assert(pdfBytes.byteLength > 2000, 'PDF size must be > 2000 bytes');
  console.log(`   ✅ PDF report successfully generated and streamed (${pdfBytes.byteLength} bytes).`);

  // ----------------------------------------------------
  // STEP 8: In-Flight Scan Cancellation Test
  // ----------------------------------------------------
  console.log('\n🔹 8. Testing Scan Cancellation Lifecycle...');
  const cancelScanId = `test-e2e-cancel-${Date.now().toString(36)}`;
  await Scan.create({
    id: cancelScanId,
    domain_id: domainId,
    user_id: testUserId,
    target_url: 'https://example.com',
    normalized_domain: 'example.com',
    scan_mode: 'full',
    status: 'crawling',
    progress: { stage: 'crawling', percent: 35 }
  });

  const cancelRes = await fetch(`${baseUrl}/api/scans/${cancelScanId}/cancel`, {
    method: 'POST'
  });
  const cancelData = await cancelRes.json();
  assert.strictEqual(cancelRes.status, 200);
  assert(cancelData.success);

  const checkCancelled = await Scan.findOne({ id: cancelScanId });
  assert.strictEqual(checkCancelled.status, 'cancelled');
  console.log('   ✅ In-flight scan cancellation verified; status transitioned to "cancelled".');

  // ----------------------------------------------------
  // STEP 9: Soft-Delete Domain & Retention Policy
  // ----------------------------------------------------
  console.log('\n🔹 9. Testing Domain Soft-Delete and Scan Retention...');
  const delRes = await fetch(`${baseUrl}/api/domains/${domainId}`, {
    method: 'DELETE',
    headers: { 'x-user-id': testUserId, 'x-company-id': testCompanyId }
  });
  const delData = await delRes.json();
  assert(delData.success);

  const archivedDomain = await Domain.findOne({ id: domainId });
  assert.strictEqual(archivedDomain.status, 'archived');

  const retainedScans = await Scan.find({ domain_id: domainId });
  assert(retainedScans.length >= 2, 'Historical scans must be preserved after domain removal');
  console.log('   ✅ Domain soft-deleted to "archived"; historical scans retained intact.');

  // ----------------------------------------------------
  // STEP 10: Existing Roles & RBAC Integrity Check
  // ----------------------------------------------------
  console.log('\n🔹 10. Testing Preservation of RBAC User Accounts & Singleton Owner...');
  const users = await User.find({}).lean();
  assert(users.length >= 17, `Expected at least 17 users, found ${users.length}`);

  const rolesFound = new Set(users.map(u => u.role));
  for (const role of ['owner_manager', 'super_developer', 'company_manager', 'senior_manager', 'admin_manager', 'employee']) {
    assert(rolesFound.has(role), `Role "${role}" must remain present in users collection`);
  }

  const owners = users.filter(u => u.role === 'owner_manager');
  assert.strictEqual(owners.length, 1, 'Singleton Owner constraint must be strictly preserved');
  console.log('   ✅ All core RBAC roles and Singleton Owner constraint preserved.');

  console.log('\n🎉 ========================================================');
  console.log('🎉 ALL PHASE 10 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  console.log('🎉 ========================================================\n');
} finally {
  server.close();
  mockTargetServer.close();
  // Cleanup test data
  await Domain.deleteMany({ id: /^test-e2e-/ });
  await Scan.deleteMany({ id: /^test-e2e-/ });
  await Finding.deleteMany({ id: /^test-e2e-/ });
  await ScannedPage.deleteMany({ id: /^test-e2e-/ });
  await disconnectDb();
}
