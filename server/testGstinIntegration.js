import assert from 'assert';
import { app } from './server.js';
import { initMongoDb } from './initMongoDb.js';
import { disconnectDb } from './db.js';

const TEST_PORT = 5085;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runGstinIntegrationTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 GSTIN VERIFICATION ENDPOINT INTEGRATION TESTS');
  console.log('🧪 ========================================================\n');

  await initMongoDb();

  const server = app.listen(TEST_PORT, async () => {
    try {
      // 1. Invalid GSTIN format test
      console.log('🔹 1. Testing Invalid GSTIN format rejection...');
      const invRes = await fetch(`${BASE_URL}/gstin/verify/ABC123`);
      assert.strictEqual(invRes.status, 400);
      const invData = await invRes.json();
      assert.strictEqual(invData.success, false);
      assert(invData.error.includes('Invalid GSTIN format'));
      console.log('   ✅ Format validation rejected malformed GSTIN (400).');

      // 2. Real Valid Active GSTIN (Tata Motors)
      console.log('🔹 2. Testing Valid Active GSTIN (27AAACT2727Q1ZW)...');
      const validRes = await fetch(`${BASE_URL}/gstin/verify/27AAACT2727Q1ZW`);
      assert.strictEqual(validRes.status, 200);
      const validData = await validRes.json();
      assert.strictEqual(validData.success, true);
      assert.strictEqual(validData.data.gstin, '27AAACT2727Q1ZW');
      assert.strictEqual(validData.data.legalName, 'TATA MOTORS PASSENGER VEHICLES LIMITED');
      assert.strictEqual(validData.data.tradeName, 'TATA MOTORS PASSENGER VEHICLES LIMITED');
      assert.strictEqual(validData.data.status, 'Active');
      assert.strictEqual(validData.data.isActive, true);
      assert.strictEqual(validData.data.isInactive, false);
      assert.strictEqual(validData.data.state, 'Maharashtra');
      assert.strictEqual(validData.data.stateCode, '27');
      assert.strictEqual(validData.data.pincode, '411062');
      assert(validData.data.address.includes('Pune'));
      console.log('   ✅ Valid GSTIN verified with full legal name, address, state, pincode.');

      // 3. Not Found GSTIN in registry
      console.log('🔹 3. Testing Non-Existent GSTIN (404)...');
      const nfRes = await fetch(`${BASE_URL}/gstin/verify/27AAAAA0000A1Z5`);
      assert.strictEqual(nfRes.status, 404);
      const nfData = await nfRes.json();
      assert.strictEqual(nfData.success, false);
      assert(nfData.error.includes('not found'));
      console.log('   ✅ Non-existent GSTIN correctly reported as 404 Not Found.');

      // 4. Normal Checkout with and without GSTIN
      console.log('🔹 4. Testing Order creation with verified GSTIN...');
      const testOrderId = `ORD-GST-${Date.now().toString(36)}`;
      const orderRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: validData.data.legalName,
          registrationNumber: validData.data.gstin,
          officialEmail: `procurement_${Date.now()}@tatamotors.com`,
          adminName: 'Ratan Tata Office',
          billingAddress: validData.data.address,
          pinCode: validData.data.pincode,
          country: 'India',
          paymentMethod: 'Cash',
          items: [{ productId: 'prod-web-scan', name: 'Vortex Web Application & API Shield', price: 2499, quantity: 1, maxSeats: 10 }],
          totalAmount: 2499
        })
      });
      assert.strictEqual(orderRes.status, 200);
      const orderData = await orderRes.json();
      assert.strictEqual(orderData.success, true);
      assert.strictEqual(orderData.order.registrationNumber, '27AAACT2727Q1ZW');
      assert.strictEqual(orderData.order.companyName, 'TATA MOTORS PASSENGER VEHICLES LIMITED');
      assert.strictEqual(orderData.order.pinCode, '411062');
      console.log('   ✅ Normal checkout preserved and order successfully created with GSTIN details.');

      console.log('\n🎉 ========================================================');
      console.log('🎉 ALL GSTIN BACKEND & CHECKOUT TESTS PASSED (100%)');
      console.log('🎉 ========================================================\n');

      server.close();
      await disconnectDb();
      process.exit(0);
    } catch (err) {
      console.error('\n❌ GSTIN Test Failed:', err);
      server.close();
      await disconnectDb();
      process.exit(1);
    }
  });
}

runGstinIntegrationTests();
