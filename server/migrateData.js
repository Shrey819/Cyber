import fs from 'fs';
import path from 'path';
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

export async function migratePostgresToMongo() {
  console.log('🚀 Starting direct PostgreSQL to MongoDB data migration...');
  await connectDb();

  const dumpPath = path.resolve('server', 'postgres_dump.json');
  if (!fs.existsSync(dumpPath)) {
    console.warn(`⚠️ Dump file not found at ${dumpPath}. Skipping dump import.`);
    return false;
  }

  const rawData = fs.readFileSync(dumpPath, 'utf-8');
  const dump = JSON.parse(rawData);

  const stats = {
    companies: 0,
    categories: 0,
    products: 0,
    users: 0,
    orders: 0,
    order_items: 0,
    product_allocations: 0
  };

  // 1. Migrate Companies
  if (Array.isArray(dump.companies)) {
    console.log(`📦 Migrating ${dump.companies.length} companies...`);
    for (const c of dump.companies) {
      await Company.updateOne(
        { id: c.id },
        {
          $set: {
            id: c.id,
            name: c.name,
            domain: c.domain || '',
            registration_number: c.registration_number || '',
            pin_code: c.pin_code || '',
            address: c.address || '',
            industry: c.industry || 'Enterprise Security Client',
            tier: c.tier || 'Business Tier',
            seats_total: Number(c.seats_total) || 10,
            active_seats: Number(c.active_seats) || 1,
            compliance_score: Number(c.compliance_score) || 88,
            status: c.status || 'Active',
            created_at: c.created_at ? new Date(c.created_at) : new Date(),
            updated_at: c.updated_at ? new Date(c.updated_at) : new Date()
          }
        },
        { upsert: true }
      );
      stats.companies++;
    }
  }

  // 2. Migrate Categories
  if (Array.isArray(dump.categories)) {
    console.log(`📦 Migrating ${dump.categories.length} categories...`);
    for (const cat of dump.categories) {
      await Category.updateOne(
        { id: cat.id },
        {
          $set: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            icon_name: cat.icon_name || 'Shield',
            is_active: cat.is_active !== false,
            created_at: cat.created_at ? new Date(cat.created_at) : new Date(),
            updated_at: cat.updated_at ? new Date(cat.updated_at) : new Date()
          }
        },
        { upsert: true }
      );
      stats.categories++;
    }
  }

  // 3. Migrate Products
  if (Array.isArray(dump.products)) {
    console.log(`📦 Migrating ${dump.products.length} products...`);
    for (const p of dump.products) {
      let features = p.features;
      if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch (e) { features = []; }
      }
      await Product.updateOne(
        { id: p.id },
        {
          $set: {
            id: p.id,
            category_id: p.category_id || null,
            category_name: p.category_name || '',
            sku: p.sku || null,
            name: p.name,
            tagline: p.tagline || '',
            description: p.description || '',
            price: Number(p.price) || 0,
            billing_cycle: p.billing_cycle || 'Monthly',
            badge: p.badge || '',
            max_seats: Number(p.max_seats) || 10,
            assets_included: Number(p.assets_included) || 15,
            features: Array.isArray(features) ? features : [],
            feature_key: p.feature_key || null,
            is_hidden: Boolean(p.is_hidden),
            created_at: p.created_at ? new Date(p.created_at) : new Date(),
            updated_at: p.updated_at ? new Date(p.updated_at) : new Date()
          }
        },
        { upsert: true }
      );
      stats.products++;
    }
  }

  // 4. Migrate Users
  if (Array.isArray(dump.users)) {
    console.log(`📦 Migrating ${dump.users.length} users...`);
    for (const u of dump.users) {
      await User.updateOne(
        { email: u.email.toLowerCase() },
        {
          $set: {
            id: u.id,
            company_id: u.company_id || null,
            manager_id: u.manager_id || null,
            name: u.name,
            email: u.email.toLowerCase(),
            password_hash: u.password_hash,
            role: u.role,
            role_label: u.role_label || '',
            role_category: u.role_category || '',
            company_name: u.company_name || '',
            is_individual: Boolean(u.is_individual),
            status: u.status || 'offline',
            location: u.location || null,
            pin_code: u.pin_code || null,
            security_clearance: u.security_clearance || 'AUTHORIZED USER',
            designation: u.designation || null,
            phone: u.phone || null,
            is_active: u.is_active !== false,
            last_login_at: u.last_login_at ? new Date(u.last_login_at) : null,
            created_at: u.created_at ? new Date(u.created_at) : new Date(),
            updated_at: u.updated_at ? new Date(u.updated_at) : new Date()
          }
        },
        { upsert: true }
      );
      stats.users++;
    }
  }

  // 5. Migrate Orders
  if (Array.isArray(dump.orders)) {
    console.log(`📦 Migrating ${dump.orders.length} orders...`);
    for (const o of dump.orders) {
      let items = o.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { items = []; }
      }
      await Order.updateOne(
        { id: o.id },
        {
          $set: {
            id: o.id,
            company_id: o.company_id || null,
            company_name: o.company_name,
            registration_number: o.registration_number || '',
            customer_manager_name: o.customer_manager_name,
            customer_manager_email: (o.customer_manager_email || '').toLowerCase(),
            billing_address: o.billing_address,
            pin_code: o.pin_code,
            country: o.country || 'India',
            payment_method: o.payment_method,
            payment_status: o.payment_status || 'Pending',
            order_status: o.order_status || 'Processing',
            total_amount: Number(o.total_amount) || 0,
            items: items || [],
            razorpay_order_id: o.razorpay_order_id || null,
            razorpay_payment_id: o.razorpay_payment_id || null,
            razorpay_signature: o.razorpay_signature || null,
            created_at: o.created_at ? new Date(o.created_at) : new Date(),
            updated_at: o.updated_at ? new Date(o.updated_at) : new Date()
          }
        },
        { upsert: true }
      );
      stats.orders++;
    }
  }

  // 6. Migrate Order Items
  if (Array.isArray(dump.order_items)) {
    console.log(`📦 Migrating ${dump.order_items.length} order items...`);
    for (const oi of dump.order_items) {
      await OrderItem.updateOne(
        { id: String(oi.id) },
        {
          $set: {
            id: String(oi.id),
            order_id: oi.order_id,
            product_id: oi.product_id,
            quantity: Number(oi.quantity) || 1,
            unit_price: Number(oi.unit_price) || 0,
            subtotal: Number(oi.subtotal) || 0,
            allocated_seats: Number(oi.allocated_seats) || 1,
            created_at: oi.created_at ? new Date(oi.created_at) : new Date()
          }
        },
        { upsert: true }
      );
      stats.order_items++;
    }
  }

  // 7. Migrate Product Allocations
  if (Array.isArray(dump.product_allocations)) {
    console.log(`📦 Migrating ${dump.product_allocations.length} product allocations...`);
    for (const pa of dump.product_allocations) {
      await ProductAllocation.updateOne(
        {
          company_id: pa.company_id,
          product_id: pa.product_id,
          user_id: pa.user_id
        },
        {
          $set: {
            id: String(pa.id),
            company_id: pa.company_id,
            product_id: pa.product_id,
            user_id: pa.user_id,
            allocated_at: pa.created_at ? new Date(pa.created_at) : new Date(),
            created_at: pa.created_at ? new Date(pa.created_at) : new Date()
          }
        },
        { upsert: true }
      );
      stats.product_allocations++;
    }
  }

  console.log('✅ Migration to MongoDB Complete! Records successfully transferred:');
  console.table(stats);
  return stats;
}

if (process.argv[1]?.endsWith('migrateData.js')) {
  migratePostgresToMongo()
    .then(() => disconnectDb())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
