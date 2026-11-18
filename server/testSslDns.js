import assert from 'assert';
import { 
  matchHostname, 
  inspectTlsCertificate, 
  checkHttpToHttpsRedirect, 
  queryDnsRecords, 
  auditSslAndDns, 
  calculateSslDnsScore 
} from './scanner/engines/sslDnsEngine.js';
import { app } from './server.js';
import { initMongoDb } from './initMongoDb.js';
import { disconnectDb } from './db.js';
import { Scan } from './models/index.js';

const TEST_PORT = 5094;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runSslDnsTests() {
  console.log('🌐 ========================================================');
  console.log('🌐 TESTING PHASE 5: SSL / TLS & DNS AUDITING ENGINE');
  console.log('🌐 ========================================================\n');

  // --- UNIT TESTS ---
  console.log('🔹 1. Testing Hostname SAN / Wildcard Matching...');
  assert.strictEqual(matchHostname('example.com', ['example.com'], 'example.com'), true);
  assert.strictEqual(matchHostname('sub.example.com', ['*.example.com'], 'example.com'), true);
  assert.strictEqual(matchHostname('deep.sub.example.com', ['*.example.com'], 'example.com'), false);
  assert.strictEqual(matchHostname('attacker.com', ['example.com'], 'example.com'), false);
  console.log('   ✅ Hostname exact match and wildcard SAN matching verified.');

  console.log('🔹 2. Testing Real TLS Certificate Extraction (port 443 on example.com)...');
  const tlsInfo = await inspectTlsCertificate('example.com');
  assert.strictEqual(tlsInfo.ok, true, 'TLS connection to example.com:443 should succeed');
  assert(tlsInfo.cert, 'Certificate details should be returned');
  assert(tlsInfo.cert.valid_to, 'Certificate must have valid_to expiration date');
  assert(tlsInfo.protocol?.startsWith('TLSv1.'), `Protocol should be TLS 1.2 or 1.3, got: ${tlsInfo.protocol}`);
  console.log(`   ✅ TLS connection established: Protocol = ${tlsInfo.protocol}, Issuer = ${tlsInfo.cert.issuer?.O || tlsInfo.cert.issuer?.CN}, Valid To = ${tlsInfo.cert.valid_to}`);

  console.log('🔹 3. Testing HTTP-to-HTTPS Redirection Behavior...');
  const redir = await checkHttpToHttpsRedirect('github.com');
  assert.strictEqual(redir.redirectsToHttps, true, 'github.com should redirect http to https');
  console.log(`   ✅ HTTP to HTTPS auto-redirect confirmed (${redir.statusCode} -> ${redir.location}).`);

  console.log('🔹 4. Testing DNS Record Resolution (A, AAAA, MX, TXT, NS)...');
  const dnsRecords = await queryDnsRecords('example.com');
  assert(dnsRecords.aRecords.length > 0, 'example.com should have at least one A record');
  console.log(`   ✅ DNS resolved ${dnsRecords.aRecords.length} A record(s) [${dnsRecords.aRecords.join(', ')}] and ${dnsRecords.txtRecords.length} TXT record(s).`);

  console.log('🔹 5. Testing Comprehensive auditSslAndDns Engine on example.com...');
  const findings = await auditSslAndDns({ hostname: 'example.com' });
  assert(findings.length > 0, 'Audit should return findings');

  const trustedCertFinding = findings.find(f => f.rule_id === 'ssl-cert-trusted');
  assert(trustedCertFinding, 'Should have trusted certificate finding');
  assert.strictEqual(trustedCertFinding.status, 'passed');

  const expiryFinding = findings.find(f => f.rule_id === 'ssl-cert-expiry-healthy');
  assert(expiryFinding, 'Should have healthy expiry finding');
  assert.strictEqual(expiryFinding.status, 'passed');

  const dnsIpFinding = findings.find(f => f.rule_id === 'dns-ip-resolution-healthy');
  assert(dnsIpFinding, 'Should have healthy IP resolution finding');
  console.log(`   ✅ ${findings.length} SSL/DNS findings evaluated for example.com.`);

  console.log('🔹 6. Testing SSL & DNS Scoring Formula...');
  const perfectScore = calculateSslDnsScore([{ status: 'passed' }]);
  assert.strictEqual(perfectScore, 100);

  const degradedScore = calculateSslDnsScore([
    { status: 'failed', severity: 'critical' }, // -35
    { status: 'failed', severity: 'high' }     // -15
  ]);
  assert.strictEqual(degradedScore, 50);
  console.log(`   ✅ Scoring formula verified: Perfect = ${perfectScore}/100, Degraded = ${degradedScore}/100.`);

  // --- INTEGRATION TEST WITH FULL SCAN COORDINATOR ---
  console.log('🔹 7. Testing Live Scan Integration with SSL/DNS Engine...');
  let server;
  try {
    await initMongoDb();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`📡 SSL/DNS test server running on port ${TEST_PORT}`);
        resolve();
      });
    });

    await Scan.deleteMany({ normalized_domain: 'example.com' });

    const createRes = await fetch(`${BASE_URL}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr-ssldns-tester' },
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
    assert(scanDoc.scores.sslDns !== null, 'SSL & DNS score must be dynamically computed');
    console.log(`   ✅ Live scan produced SSL & DNS Score: ${scanDoc.scores.sslDns}/100.`);

    // Check findings endpoint includes category 'ssl_dns'
    const resultsRes = await fetch(`${BASE_URL}/scans/${scanId}/results`);
    const resultsData = await resultsRes.json();
    const sslDnsFindingsInDb = resultsData.findings.filter(f => f.category === 'ssl_dns');
    assert(sslDnsFindingsInDb.length > 0, 'Should have persisted SSL/DNS findings in database');
    console.log(`   ✅ Persisted ${sslDnsFindingsInDb.length} SSL/DNS findings in MongoDB.`);

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL PHASE 5 SSL & DNS TESTS PASSED! (100%)');
    console.log('🎉 ========================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await disconnectDb();
  }
}

runSslDnsTests().catch((err) => {
  console.error('❌ SSL/DNS test failed:', err);
  process.exit(1);
});
