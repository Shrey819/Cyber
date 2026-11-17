import assert from 'assert';
import { connectDb, disconnectDb, mongoose } from './db.js';
import { initMongoDb } from './initMongoDb.js';
import {
  Company,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  ProductAllocation
} from './models/index.js';

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE MONGODB MIGRATION VERIFICATION TEST');
  console.log('🧪 ========================================================\n');

  try {
    // 1. Connection & Initialization
    console.log('🔹 1. Testing Database Connection & Initialization...');
    await initMongoDb();
    assert.strictEqual(mongoose.connection.readyState, 1, 'MongoDB connection state should be 1 (connected)');
    console.log('   ✅ Database connected & schema indexes verified.');

    // 2. Data Integrity Checks
    console.log('🔹 2. Testing Data Integrity & Record Counts...');
    const userCount = await User.countDocuments();
    const companyCount = await Company.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const allocCount = await ProductAllocation.countDocuments();

    console.log(`   - Users: ${userCount}`);
    console.log(`   - Companies: ${companyCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Orders: ${orderCount}`);
    console.log(`   - Allocations: ${allocCount}`);

    assert(userCount >= 17, `Expected at least 17 users, got ${userCount}`);
    assert(companyCount >= 7, `Expected at least 7 companies, got ${companyCount}`);
    assert(categoryCount >= 5, `Expected at least 5 categories, got ${categoryCount}`);
    assert(productCount >= 5, `Expected at least 5 products, got ${productCount}`);
    assert(orderCount >= 8, `Expected at least 8 orders, got ${orderCount}`);
    assert(allocCount >= 19, `Expected at least 19 allocations, got ${allocCount}`);
    console.log('   ✅ All records successfully verified in MongoDB.');

    // 3. User Authentication & Singleton Owner Constraint
    console.log('🔹 3. Testing Authentication & User Query Logic...');
    
    // Exact email match
    const owner = await User.findOne({ email: 'owner@vortex.internal' });
    assert(owner, 'Platform owner should exist');
    assert.strictEqual(owner.role, 'owner_manager');
    assert.strictEqual(owner.password_hash, 'owner123');

    // Role shortcut check
    const superdev = await User.findOne({ role: 'super_developer' });
    assert(superdev, 'Super developer should exist');
    assert.strictEqual(superdev.email, 'alex.dev@vortex.internal');

    // Customer manager check
    const mgr = await User.findOne({ email: 'marcus.mgr@apextech.com' });
    assert(mgr, 'Marcus Vance manager should exist');
    assert.strictEqual(mgr.role, 'company_manager');

    // Singleton Owner Constraint check
    const ownersCount = await User.countDocuments({ role: 'owner_manager' });
    assert.strictEqual(ownersCount, 1, 'Strictly ONLY 1 owner_manager allowed in MongoDB');
    console.log('   ✅ User lookup, roles, and Singleton Owner rule verified.');

    // 4. Category CRUD Operations
    console.log('🔹 4. Testing Category CRUD Operations...');
    const testCatId = `cat-test-${Date.now().toString(36)}`;
    const createdCat = await Category.create({
      id: testCatId,
      name: 'Zero-Trust Network Access',
      slug: `ztna-${Date.now().toString(36)}`,
      description: 'Zero-Trust Architecture',
      icon_name: 'Lock',
      is_active: true
    });
    assert.strictEqual(createdCat.id, testCatId);

    // Update Category
    await Category.updateOne({ id: testCatId }, { $set: { description: 'Updated ZTNA Description' } });
    const updatedCat = await Category.findOne({ id: testCatId });
    assert.strictEqual(updatedCat.description, 'Updated ZTNA Description');

    // Delete Category
    await Category.deleteOne({ id: testCatId });
    const deletedCat = await Category.findOne({ id: testCatId });
    assert.strictEqual(deletedCat, null);
    console.log('   ✅ Category Create, Read, Update, Delete working properly.');

    // 5. Product CRUD Operations
    console.log('🔹 5. Testing Product CRUD Operations...');
    const testProdId = `prod-test-${Date.now().toString(36)}`;
    const createdProd = await Product.create({
      id: testProdId,
      category_id: 'cat-vapt',
      category_name: 'VAPT',
      name: 'Autonomous Pentest Bot',
      tagline: 'AI Penetration Testing',
      description: 'Continuous simulated cyberattacks',
      price: 19999,
      billing_cycle: 'Monthly',
      badge: 'New',
      max_seats: 12,
      assets_included: 25,
      features: ['Automated zero-day hunting', 'Live triage'],
      is_hidden: false
    });
    assert.strictEqual(createdProd.id, testProdId);

    // Update Product
    await Product.updateOne({ id: testProdId }, { $set: { price: 21999 } });
    const updatedProd = await Product.findOne({ id: testProdId });
    assert.strictEqual(updatedProd.price, 21999);

    // Delete Product
    await Product.deleteOne({ id: testProdId });
    const deletedProd = await Product.findOne({ id: testProdId });
    assert.strictEqual(deletedProd, null);
    console.log('   ✅ Product Create, Read, Update, Delete working properly.');

    // 6. Orders and Line Items
    console.log('🔹 6. Testing Orders & Line Items...');
    const sampleOrder = await Order.findOne({ id: 'ORD-IN-2026-1610' });
    assert(sampleOrder, 'Existing order ORD-IN-2026-1610 should exist');
    assert(Array.isArray(sampleOrder.items) && sampleOrder.items.length >= 1, 'Order should have items');

    const sampleItem = await OrderItem.findOne({ order_id: 'ORD-IN-2026-1610' });
    assert(sampleItem, 'Line items should exist in order_items collection');
    assert.strictEqual(sampleItem.order_id, 'ORD-IN-2026-1610');
    console.log('   ✅ Order querying and line item normalization verified.');

    // 7. Product Seat Allocations
    console.log('🔹 7. Testing Product Seat Allocations & Aggregation...');
    const allocations = await ProductAllocation.find({ company_id: 'comp-apex' }).lean();
    assert(allocations.length > 0, 'comp-apex should have active allocations');

    // Unique compound index test
    let duplicateRejected = false;
    try {
      await ProductAllocation.create({
        id: `alloc-dup-test`,
        company_id: allocations[0].company_id,
        product_id: allocations[0].product_id,
        user_id: allocations[0].user_id
      });
    } catch (dupErr) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Duplicate seat allocation MUST be rejected by compound unique index');
    console.log('   ✅ Product allocations & unique constraint verified.');

    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL MONGODB VERIFICATION TESTS PASSED SUCCESSFULLY! 100%');
    console.log('🎉 ========================================================\n');

    await disconnectDb();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    await disconnectDb();
    process.exit(1);
  }
}

runTests();
