import assert from 'assert';
import { auditPageAccessibility, calculateAccessibilityScore } from './scanner/engines/accessibilityEngine.js';
import { app } from './server.js';
import { initMongoDb } from './initMongoDb.js';
import { disconnectDb } from './db.js';
import { Scan } from './models/index.js';

const TEST_PORT = 5096;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runAccessibilityTests() {
  console.log('🌐 ========================================================');
  console.log('🌐 TESTING PHASE 3: ACCESSIBILITY AUDITING ENGINE');
  console.log('🌐 ========================================================\n');

  // --- UNIT TESTS ---
  console.log('🔹 1. Testing Missing <html lang> Rule...');
  const htmlNoLang = '<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>';
  const findingsNoLang = auditPageAccessibility({ url: 'https://test.local', html: htmlNoLang });
  assert(findingsNoLang.some(f => f.rule_id === 'a11y-missing-html-lang' && f.status === 'failed'));
  console.log('   ✅ Missing <html lang> detected.');

  console.log('🔹 2. Testing Valid <html lang="en">...');
  const htmlWithLang = '<html lang="en"><head><title>Test</title></head><body><h1>Hello</h1></body></html>';
  const findingsWithLang = auditPageAccessibility({ url: 'https://test.local', html: htmlWithLang });
  assert(findingsWithLang.some(f => f.rule_id === 'a11y-missing-html-lang' && f.status === 'passed'));
  console.log('   ✅ Valid <html lang="en"> passed.');

  console.log('🔹 3. Testing Missing Image Alternative Text (<img>)...');
  const htmlBadImages = `
    <html lang="en">
      <body>
        <h1>Gallery</h1>
        <img src="/photo1.jpg"> <!-- missing alt -->
        <img src="/photo2.jpg" alt="image"> <!-- suspicious alt -->
        <img src="/dec.png" role="presentation"> <!-- decorative: exempt -->
      </body>
    </html>
  `;
  const findingsBadImages = auditPageAccessibility({ url: 'https://test.local', html: htmlBadImages });
  const imgFinding = findingsBadImages.find(f => f.rule_id === 'a11y-missing-image-alt');
  assert(imgFinding, 'Should detect bad images');
  assert.strictEqual(imgFinding.evidence.totalFailingImages, 2);
  console.log('   ✅ 2 failing images detected, decorative image properly exempted.');

  console.log('🔹 4. Testing Form Controls Missing Accessible Labels...');
  const htmlUnlabeledForms = `
    <html lang="en">
      <body>
        <h1>Login</h1>
        <form>
          <input type="text" placeholder="Enter username"> <!-- unlabeled -->
          <label for="pwd">Password</label>
          <input type="password" id="pwd"> <!-- labeled -->
          <input type="text" aria-label="Search Query"> <!-- labeled by ARIA -->
        </form>
      </body>
    </html>
  `;
  const findingsForms = auditPageAccessibility({ url: 'https://test.local', html: htmlUnlabeledForms });
  const formFinding = findingsForms.find(f => f.rule_id === 'a11y-missing-form-labels');
  assert(formFinding, 'Should detect unlabeled form input');
  assert.strictEqual(formFinding.evidence.unlabeledCount, 1);
  console.log('   ✅ Form label check verified (placeholder-only correctly flagged as failing).');

  console.log('🔹 5. Testing Buttons Lacking Accessible Names...');
  const htmlEmptyButtons = `
    <html lang="en">
      <body>
        <h1>Controls</h1>
        <button><svg><path d="M0 0"/></svg></button> <!-- icon button with no text or aria -->
        <button aria-label="Close modal"><svg><path d="M0 0"/></svg></button> <!-- accessible icon button -->
      </body>
    </html>
  `;
  const findingsButtons = auditPageAccessibility({ url: 'https://test.local', html: htmlEmptyButtons });
  const btnFinding = findingsButtons.find(f => f.rule_id === 'a11y-empty-interactive-names');
  assert(btnFinding, 'Should detect unlabelled icon button');
  assert.strictEqual(btnFinding.evidence.failingCount, 1);
  console.log('   ✅ Empty icon button detected.');

  console.log('🔹 6. Testing Heading Hierarchy Order & Skipped Levels...');
  const htmlBadHeadings = `
    <html lang="en">
      <body>
        <h1>Main Heading</h1>
        <h3>Skipped to H3 directly</h3> <!-- skips h2 -->
      </body>
    </html>
  `;
  const findingsHeadings = auditPageAccessibility({ url: 'https://test.local', html: htmlBadHeadings });
  const skipFinding = findingsHeadings.find(f => f.rule_id === 'a11y-skipped-heading-level');
  assert(skipFinding, 'Should detect skipped heading level');
  assert.strictEqual(skipFinding.evidence.skippedCount, 1);
  console.log('   ✅ Skipped heading level (H1 -> H3) detected.');

  console.log('🔹 7. Testing Duplicate Element IDs...');
  const htmlDupIds = `
    <html lang="en">
      <body>
        <h1>Dashboard</h1>
        <div id="sidebar">Sidebar 1</div>
        <div id="sidebar">Sidebar 2</div> <!-- duplicate -->
      </body>
    </html>
  `;
  const findingsDupIds = auditPageAccessibility({ url: 'https://test.local', html: htmlDupIds });
  const dupFinding = findingsDupIds.find(f => f.rule_id === 'a11y-duplicate-id');
  assert(dupFinding, 'Should detect duplicate ID');
  assert.strictEqual(dupFinding.evidence.duplicates[0].id, 'sidebar');
  console.log('   ✅ Duplicate ID ("sidebar") detected.');

  console.log('🔹 8. Testing Positive Tabindex and Viewport Scaling Lock...');
  const htmlTabindexZoom = `
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, user-scalable=no">
      </head>
      <body>
        <h1>Form</h1>
        <button tabindex="2">Save</button>
      </body>
    </html>
  `;
  const findingsTabZoom = auditPageAccessibility({ url: 'https://test.local', html: htmlTabindexZoom });
  assert(findingsTabZoom.some(f => f.rule_id === 'a11y-viewport-zoom-disabled'));
  assert(findingsTabZoom.some(f => f.rule_id === 'a11y-positive-tabindex'));
  console.log('   ✅ Viewport zoom-lock and positive tabindex detected.');

  console.log('🔹 9. Testing Accessibility Category Scoring Formula...');
  const scoreFlawless = calculateAccessibilityScore([
    { status: 'passed' },
    { status: 'passed' }
  ]);
  assert.strictEqual(scoreFlawless, 100);

  const scoreWithIssues = calculateAccessibilityScore([
    { status: 'failed', severity: 'critical' }, // -25
    { status: 'failed', severity: 'high' }     // -15
  ]);
  assert.strictEqual(scoreWithIssues, 60);
  console.log(`   ✅ Scoring formula verified: Flawless = ${scoreFlawless}/100, With Issues = ${scoreWithIssues}/100.`);

  // --- INTEGRATION TEST WITH FULL SCAN COORDINATOR ---
  console.log('🔹 10. Testing Live Scan Integration with Accessibility Engine...');
  let server;
  try {
    await initMongoDb();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`📡 Accessibility test server running on port ${TEST_PORT}`);
        resolve();
      });
    });

    await Scan.deleteMany({ normalized_domain: 'example.com' });

    const createRes = await fetch(`${BASE_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr-a11y-tester' },
      body: JSON.stringify({ url: 'https://example.com', scanMode: 'quick' })
    });
    const createData = await createRes.json();
    const scanId = createData.scanId;

    // Poll until completed
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
    assert(scanDoc.scores.accessibility !== null, 'Accessibility score should be populated in scan scores');
    console.log(`   ✅ Live scan produced Accessibility Score: ${scanDoc.scores.accessibility}/100.`);

    // Check findings endpoint includes category 'accessibility'
    const resultsRes = await fetch(`${BASE_URL}/scans/${scanId}/results`);
    const resultsData = await resultsRes.json();
    const a11yFindingsInDb = resultsData.findings.filter(f => f.category === 'accessibility');
    assert(a11yFindingsInDb.length > 0, 'Should have persisted accessibility findings in database');
    console.log(`   ✅ Persisted ${a11yFindingsInDb.length} accessibility findings in MongoDB.`);

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL PHASE 3 ACCESSIBILITY TESTS PASSED! (100%)');
    console.log('🎉 ========================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await disconnectDb();
  }
}

runAccessibilityTests().catch((err) => {
  console.error('❌ Accessibility test failed:', err);
  process.exit(1);
});
