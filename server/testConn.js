import { connectDb, disconnectDb, mongoose } from './db.js';
import {
  Company,
  User,
  Category,
  Product,
  Order,
  ProductAllocation
} from './models/index.js';

async function test() {
  try {
    console.log('Testing MongoDB connection...');
    await connectDb();
    const db = mongoose.connection.db;
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    const port = mongoose.connection.port;

    console.log(`✅ MONGODB CONNECTED SUCCESSFULLY:`);
    console.log(`Database: ${dbName} | Host: ${host} | Port: ${port}`);

    const [compCount, userCount, catCount, prodCount, ordCount, allocCount] = await Promise.all([
      Company.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      ProductAllocation.countDocuments()
    ]);

    console.log('📊 Current Collection Counts:');
    console.log(`  - Companies: ${compCount}`);
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Categories: ${catCount}`);
    console.log(`  - Products: ${prodCount}`);
    console.log(`  - Orders: ${ordCount}`);
    console.log(`  - Product Allocations: ${allocCount}`);

    await disconnectDb();
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

test();
