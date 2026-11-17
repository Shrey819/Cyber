import assert from 'assert';
import { app } from './server.js';
import { initMongoDb } from './initMongoDb.js';
import { disconnectDb } from './db.js';

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runApiTests() {
  console.log('🌐 ========================================================');
  console.log('🌐 TESTING ALL EXPRESS API ROUTES WITH MONGODB BACKEND');
  console.log('🌐 ========================================================\n');

  let server;
  try {
    await initMongoDb();

    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`📡 Test server running on port ${TEST_PORT}`);
        resolve();
      });
    });

    // 1. Health check
    console.log('🔹 1. Testing GET /api/health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok');
    assert.strictEqual(healthData.driver, 'mongodb');
    console.log('   ✅ Health endpoint verified (driver: mongodb).');

    // 2. Auth Login with exact email
    console.log('🔹 2. Testing POST /api/auth/login (Owner email)...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'owner@vortex.internal', password: 'owner123' })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.strictEqual(loginData.success, true);
    assert.strictEqual(loginData.user.role, 'owner_manager');
    console.log('   ✅ Email login verified.');

    // 3. Auth Login with shortcut "admin" / "owner"
    console.log('🔹 3. Testing POST /api/auth/login (role shortcut "admin")...');
    const shortcutRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'owner123' })
    });
    assert.strictEqual(shortcutRes.status, 200);
    const shortcutData = await shortcutRes.json();
    assert.strictEqual(shortcutData.success, true);
    assert.strictEqual(shortcutData.user.role, 'owner_manager');
    console.log('   ✅ Role shortcut login verified.');

    // 4. Auth Login with incorrect password
    console.log('🔹 4. Testing POST /api/auth/login (Incorrect password rejection)...');
    const failRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'owner@vortex.internal', password: 'wrongPassword' })
    });
    assert.strictEqual(failRes.status, 401);
    const failData = await failRes.json();
    assert.strictEqual(failData.success, false);
    console.log('   ✅ Incorrect password rejected (401).');

    // 5. Auth Register
    console.log('🔹 5. Testing POST /api/auth/register...');
    const testEmail = `newuser_${Date.now()}@cybercorp.in`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dev Tester',
        email: testEmail,
        password: 'securePass123',
        role: 'company_manager',
        companyName: 'CyberCorp India',
        registrationNumber: 'CC998877',
        pinCode: '560001'
      })
    });
    assert.strictEqual(regRes.status, 200);
    const regData = await regRes.json();
    assert.strictEqual(regData.success, true);
    assert.strictEqual(regData.user.email, testEmail);
    console.log('   ✅ Registration verified.');

    // 6. Enforce Singleton Owner in Register
    console.log('🔹 6. Testing Singleton Owner constraint in registration...');
    const dupOwnerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fake Owner',
        email: 'fakeowner@cybercorp.in',
        password: 'password123',
        role: 'owner_manager'
      })
    });
    assert.strictEqual(dupOwnerRes.status, 403);
    console.log('   ✅ Singleton Owner constraint blocked duplicate owner (403).');

    // 7. Update Password
    console.log('🔹 7. Testing PUT /api/auth/password...');
    const passRes = await fetch(`${BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        newPassword: 'newSecurePassword123'
      })
    });
    assert.strictEqual(passRes.status, 200);
    const passData = await passRes.json();
    assert.strictEqual(passData.success, true);
    console.log('   ✅ Password update verified.');

    // 8. Users List
    console.log('🔹 8. Testing GET /api/users...');
    const usersRes = await fetch(`${BASE_URL}/users`);
    assert.strictEqual(usersRes.status, 200);
    const usersData = await usersRes.json();
    assert(Array.isArray(usersData) && usersData.length >= 17);
    console.log(`   ✅ Users retrieved (${usersData.length} records).`);

    // 9. Companies List
    console.log('🔹 9. Testing GET /api/companies...');
    const compRes = await fetch(`${BASE_URL}/companies`);
    assert.strictEqual(compRes.status, 200);
    const compData = await compRes.json();
    assert(Array.isArray(compData) && compData.length >= 7);
    console.log(`   ✅ Companies retrieved (${compData.length} records).`);

    // 10. Categories List
    console.log('🔹 10. Testing GET /api/categories...');
    const catRes = await fetch(`${BASE_URL}/categories`);
    assert.strictEqual(catRes.status, 200);
    const catData = await catRes.json();
    assert(Array.isArray(catData) && catData.length >= 5);
    console.log(`   ✅ Categories retrieved (${catData.length} records).`);

    // 11. Products List
    console.log('🔹 11. Testing GET /api/products...');
    const prodRes = await fetch(`${BASE_URL}/products`);
    assert.strictEqual(prodRes.status, 200);
    const prodData = await prodRes.json();
    assert(Array.isArray(prodData) && prodData.length >= 5);
    console.log(`   ✅ Products retrieved (${prodData.length} records).`);

    // 12. Orders List
    console.log('🔹 12. Testing GET /api/orders...');
    const ordRes = await fetch(`${BASE_URL}/orders`);
    assert.strictEqual(ordRes.status, 200);
    const ordData = await ordRes.json();
    assert(Array.isArray(ordData) && ordData.length >= 8);
    console.log(`   ✅ Orders retrieved (${ordData.length} records).`);

    // 13. Allocations List
    console.log('🔹 13. Testing GET /api/allocations...');
    const allocRes = await fetch(`${BASE_URL}/allocations`);
    assert.strictEqual(allocRes.status, 200);
    const allocData = await allocRes.json();
    assert(Array.isArray(allocData) && allocData.length >= 19);
    console.log(`   ✅ Allocations retrieved (${allocData.length} records).`);

    // 14. Team Member Invite
    console.log('🔹 14. Testing POST /api/team/invite...');
    const inviteEmail = `invite_${Date.now()}@apextech.com`;
    const inviteRes = await fetch(`${BASE_URL}/team/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: 'comp-apex',
        companyName: 'Apex CyberTech India Pvt Ltd',
        name: 'Invited Security Dev',
        email: inviteEmail,
        role: 'company_developer'
      })
    });
    assert.strictEqual(inviteRes.status, 200);
    const inviteData = await inviteRes.json();
    assert.strictEqual(inviteData.success, true);
    assert.strictEqual(inviteData.user.email, inviteEmail);
    console.log('   ✅ Team invitation verified.');

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL EXPRESS API ENDPOINTS PASSED WITH MONGODB!');
    console.log('🎉 ========================================================\n');

    server.close();
    await disconnectDb();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ API TEST FAILED:', err);
    if (server) server.close();
    await disconnectDb();
    process.exit(1);
  }
}

runApiTests();
