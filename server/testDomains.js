import assert from 'assert';
import { app } from './server.js';
import { initMongoDb } from './initMongoDb.js';
import { disconnectDb } from './db.js';
import { Domain } from './models/index.js';

const TEST_PORT = 5098;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runDomainTests() {
  console.log('🌐 ========================================================');
  console.log('🌐 TESTING PHASE 1: DOMAIN MANAGEMENT & SSRF SAFEGUARD');
  console.log('🌐 ========================================================\n');

  let server;
  try {
    await initMongoDb();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`📡 Domain test server running on port ${TEST_PORT}`);
        resolve();
      });
    });

    const mockUserId = 'usr-test-dev';
    const mockCompanyId = 'comp-apex';

    // 1. SSRF check: localhost rejection
    console.log('🔹 1. Testing SSRF Rejection: localhost...');
    const localRes = await fetch(`${BASE_URL}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': mockUserId,
        'x-company-id': mockCompanyId
      },
      body: JSON.stringify({ url: 'http://localhost:8080' })
    });
    assert.strictEqual(localRes.status, 400);
    const localData = await localRes.json();
    assert.strictEqual(localData.success, false);
    console.log('   ✅ Localhost blocked successfully:', localData.error);

    // 2. SSRF check: Private IP 127.0.0.1 rejection
    console.log('🔹 2. Testing SSRF Rejection: 127.0.0.1...');
    const ipRes = await fetch(`${BASE_URL}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': mockUserId,
        'x-company-id': mockCompanyId
      },
      body: JSON.stringify({ url: 'http://127.0.0.1/admin' })
    });
    assert.strictEqual(ipRes.status, 400);
    const ipData = await ipRes.json();
    assert.strictEqual(ipData.success, false);
    console.log('   ✅ 127.0.0.1 blocked successfully:', ipData.error);

    // 3. SSRF check: Cloud metadata 169.254.169.254 rejection
    console.log('🔹 3. Testing SSRF Rejection: 169.254.169.254 (Cloud Metadata)...');
    const metaRes = await fetch(`${BASE_URL}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': mockUserId,
        'x-company-id': mockCompanyId
      },
      body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data/' })
    });
    assert.strictEqual(metaRes.status, 400);
    const metaData = await metaRes.json();
    assert.strictEqual(metaData.success, false);
    console.log('   ✅ Cloud metadata blocked successfully:', metaData.error);

    // 4. Invalid protocol rejection (e.g., file:// or ftp://)
    console.log('🔹 4. Testing Protocol Validation: ftp://...');
    const ftpRes = await fetch(`${BASE_URL}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': mockUserId
      },
      body: JSON.stringify({ url: 'ftp://example.com' })
    });
    assert.strictEqual(ftpRes.status, 400);
    const ftpData = await ftpRes.json();
    assert.strictEqual(ftpData.success, false);
    console.log('   ✅ Non-HTTP/HTTPS protocol rejected.');

    // 5. Add valid domain with automatic normalization
    console.log('🔹 5. Testing Domain Creation & Normalization: "example.com"...');
    // Clean up test domain if exists
    await Domain.deleteMany({ normalized_domain: 'example.com' });

    const addRes = await fetch(`${BASE_URL}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': mockUserId,
        'x-company-id': mockCompanyId
      },
      body: JSON.stringify({ url: 'https://example.com/some/path?query=1' })
    });
    assert.strictEqual(addRes.status, 201);
    const addData = await addRes.json();
    assert.strictEqual(addData.success, true);
    assert.strictEqual(addData.domain.normalized_domain, 'example.com');
    assert.strictEqual(addData.domain.display_url, 'https://example.com');
    const createdDomainId = addData.domain.id;
    console.log('   ✅ Valid domain added & normalized:', addData.domain.id, addData.domain.normalized_domain);

    // 6. Duplicate domain rejection within same workspace
    console.log('🔹 6. Testing Duplicate Domain Prevention...');
    const dupRes = await fetch(`${BASE_URL}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': mockUserId,
        'x-company-id': mockCompanyId
      },
      body: JSON.stringify({ url: 'http://example.com' })
    });
    assert.strictEqual(dupRes.status, 409);
    const dupData = await dupRes.json();
    assert.strictEqual(dupData.success, false);
    console.log('   ✅ Duplicate entry prevented (409 Conflict):', dupData.error);

    // 7. List domains
    console.log('🔹 7. Testing GET /api/domains...');
    const listRes = await fetch(`${BASE_URL}/domains`, {
      headers: {
        'x-company-id': mockCompanyId
      }
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.strictEqual(listData.success, true);
    assert(listData.domains.some(d => d.id === createdDomainId));
    console.log(`   ✅ Domains retrieved (${listData.count} active domains).`);

    // 8. Get domain detail
    console.log('🔹 8. Testing GET /api/domains/:id...');
    const detailRes = await fetch(`${BASE_URL}/domains/${createdDomainId}`);
    assert.strictEqual(detailRes.status, 200);
    const detailData = await detailRes.json();
    assert.strictEqual(detailData.domain.normalizedDomain, 'example.com');
    console.log('   ✅ Domain detail verified.');

    // 9. Soft-delete domain (Archive)
    console.log('🔹 9. Testing DELETE /api/domains/:id (Soft-delete & scan preservation)...');
    const delRes = await fetch(`${BASE_URL}/domains/${createdDomainId}`, {
      method: 'DELETE',
      headers: {
        'x-company-id': mockCompanyId
      }
    });
    assert.strictEqual(delRes.status, 200);
    const delData = await delRes.json();
    assert.strictEqual(delData.success, true);

    // Verify it is archived in MongoDB
    const archivedDoc = await Domain.findOne({ id: createdDomainId });
    assert.strictEqual(archivedDoc.status, 'archived');
    console.log('   ✅ Domain soft-deleted to "archived" state (retains scan history).');

    // Verify it no longer appears in active list
    const afterListRes = await fetch(`${BASE_URL}/domains`, {
      headers: { 'x-company-id': mockCompanyId }
    });
    const afterListData = await afterListRes.json();
    assert(!afterListData.domains.some(d => d.id === createdDomainId));
    console.log('   ✅ Archived domain successfully excluded from active inventory.');

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL PHASE 1 DOMAIN TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('🎉 ========================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await disconnectDb();
  }
}

runDomainTests().catch((err) => {
  console.error('❌ Domain test failed:', err);
  process.exit(1);
});
