import { connectDb } from './db.js';
import {
  Company,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  ProductAllocation
} from './models/index.js';
import { migratePostgresToMongo } from './migrateData.js';

export async function initMongoDb() {
  try {
    console.log('🔗 Connecting to MongoDB and verifying collections & indexes...');
    await connectDb();

    // Ensure all schema indexes are synced
    await Promise.all([
      Company.syncIndexes(),
      User.syncIndexes(),
      Category.syncIndexes(),
      Product.syncIndexes(),
      Order.syncIndexes(),
      OrderItem.syncIndexes(),
      ProductAllocation.syncIndexes()
    ]);
    console.log('✅ MongoDB collections & indexes verified!');

    // Check if users collection is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 MongoDB is empty. Checking for PostgreSQL dump to restore...');
      await migratePostgresToMongo();
    } else {
      console.log(`ℹ️ MongoDB already initialized (${userCount} users present).`);
    }

    return true;
  } catch (err) {
    console.error('❌ MongoDB initDb error:', err);
    throw err;
  }
}

export default initMongoDb;

if (process.argv[1]?.endsWith('initMongoDb.js')) {
  initMongoDb()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
