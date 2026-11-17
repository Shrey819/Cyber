import { connectDb, disconnectDb } from './db.js';
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

export async function seedAllTables() {
  console.log('🚀 Connecting to MongoDB to populate all collections properly...');
  await connectDb();

  // If dump exists, prefer restoring complete state
  const res = await migratePostgresToMongo();
  if (res) {
    console.log('🎉 MongoDB seeding and migration complete!');
    return;
  }

  // Fallback defaults if no dump
  console.log('🏢 Seeding default companies...');
  await Company.updateOne(
    { id: 'comp-apex' },
    {
      $set: {
        id: 'comp-apex',
        name: 'Apex CyberTech India Pvt Ltd',
        domain: 'apextech.in',
        registration_number: '27AABCA1234F1Z5',
        pin_code: '411028',
        address: 'Tower 4, Cyber City, Magarpatta, Pune, Maharashtra',
        industry: 'Offensive Security & FinTech',
        tier: 'Enterprise Tier',
        seats_total: 25,
        active_seats: 2,
        compliance_score: 94,
        status: 'Active'
      }
    },
    { upsert: true }
  );

  console.log('👥 Seeding default users...');
  await User.updateOne(
    { email: 'owner@vortex.internal' },
    {
      $set: {
        id: 'usr-owner-root',
        name: 'Vikramaditya Singhania',
        email: 'owner@vortex.internal',
        password_hash: 'owner123',
        role: 'owner_manager',
        role_label: 'Platform Owner & Root Admin',
        role_category: 'Executive Platform Oversight',
        company_name: 'Vortex Global Security Infrastructure',
        is_individual: false,
        status: 'online',
        security_clearance: 'LEVEL-5 ROOT (ONLY ONE OWNER LOGIN)',
        designation: 'Founder & Global Administrator'
      }
    },
    { upsert: true }
  );

  console.log('🎉 Default seeding completed.');
}

if (process.argv[1]?.endsWith('seedDatabaseProperly.js')) {
  seedAllTables()
    .then(() => disconnectDb())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
