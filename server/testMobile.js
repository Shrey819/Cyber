import assert from 'assert';
import { auditPageMobile, calculateMobileScore } from './scanner/engines/mobileEngine.js';
import { app } from './server.js';
import { initMongoDb } from './initMongoDb.js';
import { disconnectDb } from './db.js';
import { Scan } from './models/index.js';

const TEST_PORT = 5095;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runMobileTests() {
  console.log('🌐 ========================================================');
  console.log('🌐 TESTING PHASE 4: MOBILE VIEWPORT & RESPONSIVENESS AUDIT');
  console.log('🌐 ========================================================\n');

  // --- UNIT TESTS ---
  console.log('🔹 1. Testing Missing Viewport Meta Tag...');
  const htmlNoViewport = '<html><head><title>No Viewport</title></head><body><h1>Desktop Only</h1></body></html>';
  const findingsNoViewport = auditPageMobile({ url: 'https://test.local', html: htmlNoViewport });
  const missingViewportFinding = findingsNoViewport.find(f => f.rule_id === 'mobile-missing-viewport');
  assert(missingViewportFinding, 'Should detect missing viewport meta tag');
  assert.strictEqual(missingViewportFinding.severity, 'critical');
  console.log('   ✅ Missing viewport meta tag detected with critical severity.');

  console.log('🔹 2. Testing Valid Responsive Viewport Meta Tag...');
  const htmlValidViewport = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Mobile OK</h1></body></html>';
  const findingsValidViewport = auditPageMobile({ url: 'https://test.local', html: htmlValidViewport });
  assert(findingsValidViewport.some(f => f.rule_id === 'mobile-viewport-configured' && f.status === 'passed'));
  console.log('   ✅ Valid responsive viewport meta tag passed.');

  console.log('🔹 3. Testing Viewport Zoom Lock (user-scalable=no)...');
  const htmlZoomLock = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"></head><body></body></html>';
  const findingsZoomLock = auditPageMobile({ url: 'https://test.local', html: htmlZoomLock });
  assert(findingsZoomLock.some(f => f.rule_id === 'mobile-zoom-restricted'));
  console.log('   ✅ Viewport zoom-lock restriction detected.');

  console.log('🔹 4. Testing Fixed-Width Horizontal Overflow (> 390px)...');
  const htmlOverflow = `
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body>
        <div style="width: 1024px;">Desktop fixed container</div>
        <div style="width: 250px;">Safe narrow container</div>
      </body>
    </html>
  `;
  const findingsOverflow = auditPageMobile({ url: 'https://test.local', html: htmlOverflow });
  const overflowFinding = findingsOverflow.find(f => f.rule_id === 'mobile-fixed-width-overflow');
  assert(overflowFinding, 'Should detect fixed-width overflow element');
  assert.strictEqual(overflowFinding.evidence.overflowCount, 1);
  console.log('   ✅ Element with style="width: 1024px" flagged as mobile overflow.');

  console.log('🔹 5. Testing Non-Responsive Large Images...');
  const htmlImages = `
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body>
        <img src="banner.jpg" width="1200"> <!-- non-responsive large image -->
        <img src="banner2.jpg" width="1200" style="max-width: 100%;"> <!-- responsive style: exempt -->
      </body>
    </html>
  `;
  const findingsImages = auditPageMobile({ url: 'https://test.local', html: htmlImages });
  const imgFinding = findingsImages.find(f => f.rule_id === 'mobile-non-responsive-images');
  assert(imgFinding, 'Should detect non-responsive image');
  assert.strictEqual(imgFinding.evidence.count, 1);
  console.log('   ✅ Fixed 1200px image flagged; image with max-width: 100% exempted.');

  console.log('🔹 6. Testing Unwrapped Tables (Missing Overflow Container)...');
  const htmlTables = `
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body>
        <table><tr><td>Unwrapped table</td></tr></table>
        <div style="overflow-x: auto;">
          <table><tr><td>Wrapped table</td></tr></table>
        </div>
      </body>
    </html>
  `;
  const findingsTables = auditPageMobile({ url: 'https://test.local', html: htmlTables });
  const tableFinding = findingsTables.find(f => f.rule_id === 'mobile-unwrapped-tables');
  assert(tableFinding, 'Should detect unwrapped table');
  assert.strictEqual(tableFinding.evidence.unwrappedCount, 1);
  console.log('   ✅ Unwrapped data table detected.');

  console.log('🔹 7. Testing Tiny Font Sizes (< 12px)...');
  const htmlFonts = `
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body>
        <p style="font-size: 8px;">Microscopic terms</p>
        <p style="font-size: 16px;">Readable text</p>
      </body>
    </html>
  `;
  const findingsFonts = auditPageMobile({ url: 'https://test.local', html: htmlFonts });
  const fontFinding = findingsFonts.find(f => f.rule_id === 'mobile-small-fonts');
  assert(fontFinding, 'Should detect font size under 12px');
  assert.strictEqual(fontFinding.evidence.count, 1);
  console.log('   ✅ Illegible font size (8px) detected.');

  console.log('🔹 8. Testing Mobile Scoring Formula...');
  const perfectScore = calculateMobileScore([{ status: 'passed' }]);
  assert.strictEqual(perfectScore, 100);

  const flawedScore = calculateMobileScore([
    { status: 'failed', severity: 'critical' }, // -35
    { status: 'failed', severity: 'high' }     // -15
  ]);
  assert.strictEqual(flawedScore, 50);
  console.log(`   ✅ Scoring formula verified: Perfect = ${perfectScore}/100, Deducted = ${flawedScore}/100.`);

  // --- INTEGRATION TEST WITH FULL SCAN COORDINATOR ---
  console.log('🔹 9. Testing Live Scan Integration with Mobile Viewport Engine...');
  let server;
  try {
    await initMongoDb();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`📡 Mobile test server running on port ${TEST_PORT}`);
        resolve();
      });
    });

    await Scan.deleteMany({ normalized_domain: 'example.com' });

    const createRes = await fetch(`${BASE_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr-mobile-tester' },
      body: JSON.stringify({ url: 'https://example.com', scanMode: 'quick' })
    });
    const createData = await createRes.json();
    const scanId = createData.scanId;

    let scanDoc = null;
    let attempts = 0;
    while (attempts < 20) {
      await new Promise(r => setTimeout(r, 800));
      const pollRes = await fetch(`${BASE_URL}/scans/${scanId}`);
      const pollData = await pollRes.json();
      scanDoc = pollData.scan;
      if (['completed', 'completed_with_warnings', 'failed'].includes(scanDoc.status)) {
        break;
      }
      attempts++;
    }

    assert(scanDoc, 'Scan doc should exist');
    assert.strictEqual(scanDoc.status, 'completed');
    assert(scanDoc.scores.mobile !== null, 'Mobile score must be populated in scan scores');
    console.log(`   ✅ Live scan produced Mobile Score: ${scanDoc.scores.mobile}/100.`);

    // Check findings endpoint includes category 'mobile'
    const resultsRes = await fetch(`${BASE_URL}/scans/${scanId}/results`);
    const resultsData = await resultsRes.json();
    const mobFindingsInDb = resultsData.findings.filter(f => f.category === 'mobile');
    assert(mobFindingsInDb.length > 0, 'Should have persisted mobile findings in database');
    console.log(`   ✅ Persisted ${mobFindingsInDb.length} mobile findings in MongoDB.`);

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL PHASE 4 MOBILE TESTS PASSED! (100%)');
    console.log('🎉 ========================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await disconnectDb();
  }
}

runMobileTests().catch((err) => {
  console.error('❌ Mobile test failed:', err);
  process.exit(1);
});
