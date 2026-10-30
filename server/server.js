import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { sql } from './db.js';
import { initDb } from './initDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Helper to initialize Razorpay SDK
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id.includes('YOUR_KEY_ID_HERE') || key_secret.includes('YOUR_KEY_SECRET_HERE')) {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const time = await sql`SELECT NOW() as now, current_database() as db`;
    res.json({ status: 'ok', database: time[0].db, timestamp: time[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide both your email/ID and password.' 
      });
    }

    const clean = identifier.toLowerCase().trim();

    // 1. Check exact email or id match in PostgreSQL
    let users = await sql`
      SELECT * FROM users 
      WHERE LOWER(email) = ${clean} OR LOWER(id) = ${clean}
      LIMIT 1
    `;

    // 2. If not found, check known shortcuts / aliases or email prefix
    if (users.length === 0) {
      if (clean === 'owner' || clean === 'owner_manager' || clean === 'admin') {
        users = await sql`SELECT * FROM users WHERE role = 'owner_manager' LIMIT 1`;
      } else if (clean === 'adminmgr' || clean === 'admin_manager') {
        users = await sql`SELECT * FROM users WHERE role = 'admin_manager' OR role = 'owner_manager' LIMIT 1`;
      } else if (clean === 'superdev' || clean === 'super_developer') {
        users = await sql`SELECT * FROM users WHERE role = 'super_developer' LIMIT 1`;
      } else if (clean === 'seniormgr' || clean === 'company_manager' || clean === 'senior_manager') {
        users = await sql`SELECT * FROM users WHERE role = 'company_manager' OR role = 'senior_manager' LIMIT 1`;
      } else if (clean === 'companydev' || clean === 'tech') {
        users = await sql`SELECT * FROM users WHERE role = 'company_developer' OR (role = 'employee' AND role_label ILIKE '%tech%') LIMIT 1`;
      } else if (clean === 'employee') {
        users = await sql`SELECT * FROM users WHERE role = 'employee' LIMIT 1`;
      } else {
        // Try email prefix: e.g. "arjun.mgr" -> "arjun.mgr@quantumshield.in"
        users = await sql`SELECT * FROM users WHERE LOWER(email) LIKE ${clean + '@%'} LIMIT 1`;
      }
    }

    // 3. User does NOT exist in database
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: `User account not found for "${identifier}". Please verify your email or User ID.` 
      });
    }

    const user = users[0];

    // 4. Incorrect Password Check
    if (user.password_hash !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Incorrect password. Please verify your credentials and try again.' 
      });
    }

    // 5. Successful authentication -> update online status & timestamp
    await sql`
      UPDATE users 
      SET status = 'online',
          last_login_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    res.json({
      success: true,
      message: `Authenticated as ${user.name}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: user.role_label,
        roleCategory: user.role_category,
        companyId: user.company_id,
        company_id: user.company_id,
        companyName: user.company_name,
        status: 'online',
        securityClearance: user.security_clearance,
        designation: user.designation,
        managerId: user.manager_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'company_manager', companyName, registrationNumber, pinCode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Enforce Singleton Platform Owner Rule: Only 1 owner_manager allowed
    if (role === 'owner_manager') {
      const existingOwner = await sql`SELECT id FROM users WHERE role = 'owner_manager' LIMIT 1`;
      if (existingOwner.length > 0) {
        return res.status(403).json({ 
          success: false, 
          error: 'Platform Owner constraint violation: The system already has a Platform Owner Manager. Only 1 owner login is permitted.' 
        });
      }
    }

    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${cleanEmail}`;
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists.' });
    }

    let companyId = null;
    if (companyName) {
      companyId = `comp-${Date.now().toString(36)}`;
      await sql`
        INSERT INTO companies (id, name, domain, registration_number, pin_code, status)
        VALUES (${companyId}, ${companyName}, ${cleanEmail.split('@')[1] || ''}, ${registrationNumber || ''}, ${pinCode || ''}, 'Active')
      `;
    }

    const newUserId = `usr-${Date.now().toString(36)}`;
    const roleLabel = role === 'company_manager' || role === 'senior_manager' 
      ? 'Customer Manager (Company Lead)' 
      : role === 'company_developer' 
        ? 'Company Developer' 
        : 'Employee';

    await sql`
      INSERT INTO users (id, company_id, name, email, password_hash, role, role_label, company_name, is_individual, status, pin_code, security_clearance)
      VALUES (${newUserId}, ${companyId}, ${name || cleanEmail.split('@')[0]}, ${cleanEmail}, ${password}, ${role}, ${roleLabel}, ${companyName || 'Individual'}, ${!companyName}, 'online', ${pinCode || ''}, 'AUTHORIZED USER')
    `;

    res.json({
      success: true,
      message: 'Account created successfully in Neon PostgreSQL!',
      user: {
        id: newUserId,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role,
        roleLabel,
        companyId,
        company_id: companyId,
        companyName: companyName || 'Individual',
        status: 'online'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Password
app.put('/api/auth/password', async (req, res) => {
  try {
    const { email, identifier, newPassword } = req.body;
    const target = (email || identifier || '').toLowerCase().trim();
    if (!target || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid email/ID and a new password (minimum 6 characters).' 
      });
    }

    const result = await sql`
      UPDATE users 
      SET password_hash = ${newPassword},
          updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(email) = ${target} OR LOWER(id) = ${target} OR LOWER(email) LIKE ${target + '@%'}
      RETURNING id, name, email, role
    `;

    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: `No user account found matching "${target}" to update password.` 
      });
    }

    res.json({ 
      success: true, 
      message: `Password updated successfully in PostgreSQL for ${result[0].name} (${result[0].email})! You can now log in with your new password.` 
    });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Users (for Owner Manager & Customer Manager)
app.get('/api/users', async (req, res) => {
  try {
    const { companyId } = req.query;
    let query;
    if (companyId) {
      query = await sql`
        SELECT id, company_id, name, email, password_hash, role, role_label, role_category, 
               company_name, is_individual, status, security_clearance, manager_id, designation, phone, pin_code, location
        FROM users 
        WHERE company_id = ${companyId} 
        ORDER BY created_at DESC
      `;
    } else {
      query = await sql`
        SELECT id, company_id, name, email, password_hash, role, role_label, role_category, 
               company_name, is_individual, status, security_clearance, manager_id, designation, phone, pin_code, location
        FROM users 
        ORDER BY created_at DESC
      `;
    }

    res.json(query.map(u => ({
      id: u.id,
      companyId: u.company_id,
      company_id: u.company_id,
      name: u.name,
      email: u.email,
      password: u.password_hash || 'password123',
      password_hash: u.password_hash,
      role: u.role,
      roleLabel: u.role_label,
      role_label: u.role_label,
      roleCategory: u.role_category,
      companyName: u.company_name,
      isIndividual: u.is_individual,
      status: u.status,
      securityClearance: u.security_clearance,
      managerId: u.manager_id,
      manager_id: u.manager_id,
      designation: u.designation,
      phone: u.phone,
      pinCode: u.pin_code,
      location: u.location
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Companies
app.get('/api/companies', async (req, res) => {
  try {
    const comps = await sql`SELECT * FROM companies ORDER BY created_at DESC`;
    res.json(comps.map(c => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      registrationNumber: c.registration_number,
      registration_number: c.registration_number,
      pinCode: c.pin_code,
      pin_code: c.pin_code,
      address: c.address,
      industry: c.industry,
      tier: c.tier,
      seatsTotal: c.seats_total,
      seats_total: c.seats_total,
      activeSeats: c.active_seats,
      active_seats: c.active_seats,
      complianceScore: c.compliance_score,
      compliance_score: c.compliance_score,
      status: c.status,
      createdAt: c.created_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Company Status (Suspend / Unsuspend)
app.patch('/api/companies/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await sql`UPDATE companies SET status = ${status} WHERE id = ${id}`;
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. CATEGORIES (CRUD)
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await sql`SELECT * FROM categories ORDER BY created_at ASC`;
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, slug, description, iconName = 'Shield' } = req.body;
    const id = `cat-${Date.now().toString(36)}`;
    const newCat = await sql`
      INSERT INTO categories (id, name, slug, description, icon_name, is_active)
      VALUES (${id}, ${name}, ${slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}, ${description || ''}, ${iconName}, true)
      RETURNING *
    `;
    res.json(newCat[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, name, description } = req.body;
    const updated = await sql`
      UPDATE categories
      SET is_active = COALESCE(${isActive}, is_active),
          name = COALESCE(${name}, name),
          description = COALESCE(${description}, description)
      WHERE id = ${id}
      RETURNING *
    `;
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM categories WHERE id = ${id}`;
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PRODUCTS (CRUD)
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const prods = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    res.json(prods.map(p => ({
      id: p.id,
      categoryId: p.category_id,
      categoryName: p.category_name,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      price: parseFloat(p.price),
      billingCycle: p.billing_cycle,
      badge: p.badge,
      maxSeats: p.max_seats,
      assetsIncluded: p.assets_included,
      features: p.features || [],
      isHidden: p.is_hidden
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const {
      name, categoryId, categoryName, tagline, description,
      price, billingCycle = 'Monthly', badge = 'Standard',
      maxSeats = 10, assetsIncluded = 15, features = []
    } = req.body;

    const id = `prod-${Date.now().toString(36)}`;
    const newProd = await sql`
      INSERT INTO products (
        id, category_id, category_name, name, tagline, description,
        price, billing_cycle, badge, max_seats, assets_included,
        features, is_hidden
      ) VALUES (
        ${id}, ${categoryId}, ${categoryName}, ${name}, ${tagline || ''}, ${description || ''},
        ${price}, ${billingCycle}, ${badge}, ${maxSeats}, ${assetsIncluded},
        ${JSON.stringify(features)}::jsonb, false
      )
      RETURNING *
    `;
    res.json(newProd[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, categoryId, categoryName, tagline, description,
      price, billingCycle, badge, maxSeats, assetsIncluded,
      features, isHidden
    } = req.body;

    const updated = await sql`
      UPDATE products
      SET name = COALESCE(${name}, name),
          category_id = COALESCE(${categoryId}, category_id),
          category_name = COALESCE(${categoryName}, category_name),
          tagline = COALESCE(${tagline}, tagline),
          description = COALESCE(${description}, description),
          price = COALESCE(${price}, price),
          billing_cycle = COALESCE(${billingCycle}, billing_cycle),
          badge = COALESCE(${badge}, badge),
          max_seats = COALESCE(${maxSeats}, max_seats),
          assets_included = COALESCE(${assetsIncluded}, assets_included),
          features = COALESCE(${features ? JSON.stringify(features) : null}::jsonb, features),
          is_hidden = COALESCE(${isHidden}, is_hidden)
      WHERE id = ${id}
      RETURNING *
    `;
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM products WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. RAZORPAY PAYMENT GATEWAY & CHECKOUT
// ==========================================

// Get Razorpay configuration status and public Key ID (Enforced Test Mode)
app.get('/api/payment/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  const isConfigured = Boolean(
    keyId &&
    process.env.RAZORPAY_KEY_SECRET &&
    !keyId.includes('YOUR_KEY_ID_HERE') &&
    !process.env.RAZORPAY_KEY_SECRET.includes('YOUR_KEY_SECRET_HERE')
  );

  res.json({
    success: true,
    keyId: isConfigured ? keyId : '',
    isConfigured,
    isTestMode: true,
    mode: 'test',
    currency: 'INR'
  });
});

// Create Razorpay Order (Sandbox / Test Mode)
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes = {} } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'A valid payment amount is required' });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Razorpay API credentials not configured in backend .env. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env' 
      });
    }

    // Razorpay amount is in smallest currency sub-unit (paise for INR: 1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `demo_rcpt_${Date.now().toString(36)}`,
      notes: {
        platform: 'Vortex Cybersecurity B2B Portal',
        environment: 'Razorpay Test Mode Only',
        demo: 'true',
        ...notes
      }
    };

    const razorpayOrder = await rzp.orders.create(options);
    res.json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
      isTestMode: true
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.error?.description || err.message || 'Failed to create Razorpay payment order' 
    });
  }
});

// Verify Razorpay HMAC SHA256 Signature
app.post('/api/payment/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Incomplete Razorpay payment verification parameters' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret.includes('YOUR_KEY_SECRET_HERE')) {
      return res.status(500).json({ success: false, error: 'Razorpay Key Secret is missing or unconfigured in .env' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.json({ success: true, verified: true, paymentId: razorpay_payment_id });
    } else {
      return res.status(400).json({ success: false, verified: false, error: 'Invalid Razorpay HMAC signature. Transaction could not be verified.' });
    }
  } catch (err) {
    console.error('Razorpay verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. ORDERS & B2B CHECKOUT
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    res.json(orders.map(o => ({
      id: o.id,
      companyId: o.company_id,
      companyName: o.company_name,
      registrationNumber: o.registration_number,
      customerManagerName: o.customer_manager_name,
      customerManagerEmail: o.customer_manager_email,
      billingAddress: o.billing_address,
      pinCode: o.pin_code,
      country: o.country,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      orderStatus: o.order_status,
      totalAmount: parseFloat(o.total_amount),
      items: o.items || [],
      razorpayOrderId: o.razorpay_order_id,
      razorpayPaymentId: o.razorpay_payment_id,
      razorpaySignature: o.razorpay_signature,
      createdAt: new Date(o.created_at).toLocaleString('en-IN')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      companyName, registrationNumber, officialEmail, adminName, password,
      billingAddress, pinCode, country = 'India', paymentMethod = 'Online',
      items, totalAmount,
      razorpayOrderId, razorpayPaymentId, razorpaySignature
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    // Verify signature on backend if razorpay payment was made
    if (paymentMethod === 'Online' && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      // In Test Mode, verify signature only for genuine orders generated by Razorpay Orders API
      if (
        secret && 
        !secret.includes('YOUR_KEY_SECRET_HERE') && 
        razorpayOrderId.startsWith('order_') && 
        razorpaySignature !== 'sig_verified_test'
      ) {
        const expected = crypto
          .createHmac('sha256', secret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');
        if (expected !== razorpaySignature) {
          return res.status(400).json({ error: 'Razorpay signature verification failed. Order was declined.' });
        }
      }
    }

    // 1. Calculate total seats across purchased items
    let calculatedSeats = 0;
    for (const it of items) {
      const prodId = it.productId || it.id;
      const pRows = await sql`SELECT max_seats FROM products WHERE id = ${prodId} LIMIT 1`;
      const seatsPerUnit = pRows[0]?.max_seats || it.maxSeats || 10;
      calculatedSeats += seatsPerUnit * (it.quantity || 1);
    }
    const totalSeats = Math.max(10, calculatedSeats);

    // 2. Create or find company
    const compId = `comp-${Date.now().toString(36)}`;
    await sql`
      INSERT INTO companies (id, name, domain, registration_number, pin_code, address, status, seats_total, active_seats)
      VALUES (${compId}, ${companyName}, ${officialEmail.split('@')[1] || ''}, ${registrationNumber}, ${pinCode}, ${billingAddress}, 'Active', ${totalSeats}, 1)
      ON CONFLICT (id) DO UPDATE SET
        seats_total = GREATEST(companies.seats_total, EXCLUDED.seats_total)
    `;

    // 3. Create or reassign customer manager user (enforcing company_id foreign key)
    const proposedUserId = `usr-mgr-${Date.now().toString(36)}`;
    const userRows = await sql`
      INSERT INTO users (
        id, company_id, name, email, password_hash, role, role_label, 
        role_category, company_name, is_individual, status, pin_code, security_clearance
      )
      VALUES (
        ${proposedUserId}, ${compId}, ${adminName}, ${officialEmail.toLowerCase()}, 
        ${password || 'manager123'}, 'senior_manager', 'Customer Manager', 
        'Organization Leadership', ${companyName}, false, 'online', ${pinCode}, 'COMPANY OWNER / MANAGER'
      )
      ON CONFLICT (email) DO UPDATE SET 
        company_id = EXCLUDED.company_id,
        company_name = EXCLUDED.company_name,
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = 'senior_manager',
        role_label = 'Customer Manager',
        role_category = 'Organization Leadership',
        pin_code = EXCLUDED.pin_code,
        status = 'online',
        security_clearance = 'COMPANY OWNER / MANAGER'
      RETURNING id, name, email, company_id, company_name, role, role_label
    `;
    const actualManager = userRows[0];
    const actualUserId = actualManager.id;

    // 4. Create order in Neon DB with Razorpay details
    const orderId = `ORD-IN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isPaid = paymentMethod === 'Online' && (razorpayPaymentId || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('YOUR_KEY_SECRET_HERE'));
    const initialPaymentStatus = isPaid ? 'Paid' : 'Pending';
    const initialOrderStatus = isPaid ? 'Completed' : 'Processing';

    await sql`
      INSERT INTO orders (
        id, company_id, company_name, registration_number, customer_manager_name,
        customer_manager_email, billing_address, pin_code, country, payment_method,
        payment_status, order_status, total_amount, items,
        razorpay_order_id, razorpay_payment_id, razorpay_signature
      ) VALUES (
        ${orderId}, ${compId}, ${companyName}, ${registrationNumber}, ${adminName},
        ${officialEmail}, ${billingAddress}, ${pinCode}, ${country}, ${paymentMethod},
        ${initialPaymentStatus},
        ${initialOrderStatus},
        ${totalAmount}, ${JSON.stringify(items)}::jsonb,
        ${razorpayOrderId || null}, ${razorpayPaymentId || null}, ${razorpaySignature || null}
      )
    `;

    // 5. Automatically allocate purchased products to Customer Manager & record line items
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const prodId = it.productId || it.id;
      if (!prodId) continue;

      // Allocate seat in product_allocations (Foreign keys: company_id, product_id, user_id)
      await sql`
        INSERT INTO product_allocations (company_id, product_id, user_id)
        VALUES (${compId}, ${prodId}, ${actualUserId})
        ON CONFLICT (company_id, product_id, user_id) DO NOTHING
      `;

      // Insert line item in order_items (Foreign keys: order_id, product_id)
      const orderItemId = `item-${orderId}-${idx + 1}`;
      await sql`
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal, allocated_seats)
        VALUES (
          ${orderItemId}, ${orderId}, ${prodId}, 
          ${it.quantity || 1}, ${it.price || 0}, 
          ${(it.price || 0) * (it.quantity || 1)}, 
          ${it.maxSeats || 10}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Refresh active_seats on company
    await sql`
      UPDATE companies
      SET active_seats = (
        SELECT COUNT(DISTINCT user_id) FROM product_allocations WHERE company_id = ${compId}
      )
      WHERE id = ${compId}
    `;

    res.json({
      success: true,
      order: {
        id: orderId,
        companyId: compId,
        companyName,
        registrationNumber,
        customerManagerName: adminName,
        customerManagerEmail: officialEmail,
        billingAddress,
        pinCode,
        country,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        orderStatus: initialOrderStatus,
        totalAmount,
        items,
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: razorpayPaymentId || null
      },
      managerUser: {
        id: actualUserId,
        name: adminName,
        email: officialEmail,
        role: 'senior_manager',
        roleLabel: 'Customer Manager',
        companyId: compId,
        companyName
      }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, orderStatus } = req.body;
    await sql`
      UPDATE orders
      SET payment_status = COALESCE(${paymentStatus}, payment_status),
          order_status = COALESCE(${orderStatus}, order_status)
      WHERE id = ${id}
    `;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PRODUCT SEAT ALLOCATIONS & TEAM INVITES
// ==========================================

// Get all seat allocations across all companies (for Owner Manager)
app.get('/api/allocations', async (req, res) => {
  try {
    const rows = await sql`
      SELECT pa.id, pa.company_id, pa.product_id, pa.user_id, pa.created_at,
             u.name as user_name, u.email as user_email, u.role as user_role, u.role_label as user_role_label,
             p.name as product_name
      FROM product_allocations pa
      LEFT JOIN users u ON pa.user_id = u.id
      LEFT JOIN products p ON pa.product_id = p.id
      ORDER BY pa.created_at DESC
    `;
    res.json(rows.map(r => ({
      id: r.id,
      companyId: r.company_id,
      company_id: r.company_id,
      productId: r.product_id,
      product_id: r.product_id,
      userId: r.user_id,
      user_id: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      userRole: r.user_role,
      userRoleLabel: r.user_role_label,
      productName: r.product_name,
      product_name: r.product_name,
      createdAt: r.created_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all seat allocations for a company
app.get('/api/allocations/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const rows = await sql`
      SELECT pa.id, pa.company_id, pa.product_id, pa.user_id, pa.created_at,
             u.name as user_name, u.email as user_email, u.role as user_role, u.role_label as user_role_label,
             p.name as product_name
      FROM product_allocations pa
      LEFT JOIN users u ON pa.user_id = u.id
      LEFT JOIN products p ON pa.product_id = p.id
      WHERE pa.company_id = ${companyId}
      ORDER BY pa.created_at DESC
    `;
    res.json(rows.map(r => ({
      id: r.id,
      companyId: r.company_id,
      company_id: r.company_id,
      productId: r.product_id,
      product_id: r.product_id,
      userId: r.user_id,
      user_id: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      userRole: r.user_role,
      userRoleLabel: r.user_role_label,
      productName: r.product_name,
      product_name: r.product_name,
      createdAt: r.created_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign a product seat to a user
app.post('/api/allocations/assign', async (req, res) => {
  try {
    const { companyId, productId, userId } = req.body;
    if (!companyId || !productId || !userId) {
      return res.status(400).json({ error: 'companyId, productId, and userId are required' });
    }

    // Insert allocation
    const row = await sql`
      INSERT INTO product_allocations (company_id, product_id, user_id)
      VALUES (${companyId}, ${productId}, ${userId})
      ON CONFLICT (company_id, product_id, user_id) DO NOTHING
      RETURNING *
    `;

    // Increment company active_seats counter
    await sql`
      UPDATE companies
      SET active_seats = (
        SELECT COUNT(DISTINCT user_id) FROM product_allocations WHERE company_id = ${companyId}
      )
      WHERE id = ${companyId}
    `;

    res.json({ success: true, allocation: row[0] });
  } catch (err) {
    console.error('Seat assignment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Revoke a product seat from a user
app.post('/api/allocations/revoke', async (req, res) => {
  try {
    const { companyId, productId, userId } = req.body;
    if (!companyId || !productId || !userId) {
      return res.status(400).json({ error: 'companyId, productId, and userId are required' });
    }

    await sql`
      DELETE FROM product_allocations
      WHERE company_id = ${companyId} AND product_id = ${productId} AND user_id = ${userId}
    `;

    // Recalculate company active_seats counter
    await sql`
      UPDATE companies
      SET active_seats = (
        SELECT COUNT(DISTINCT user_id) FROM product_allocations WHERE company_id = ${companyId}
      )
      WHERE id = ${companyId}
    `;

    res.json({ success: true, message: 'Seat revoked successfully' });
  } catch (err) {
    console.error('Seat revocation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Customer Manager: Invite a new Team Member
app.post('/api/team/invite', async (req, res) => {
  try {
    const { companyId, companyName, name, email, role, tempPassword = 'password123' } = req.body;
    if (!companyId || !name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, role, and companyId are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${cleanEmail}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A team member with this email address already exists.' });
    }

    const newUserId = `usr-${role === 'company_developer' ? 'dev' : 'emp'}-${Date.now().toString(36)}`;
    const roleLabel = role === 'company_developer' ? 'Company Developer' : 'Security Employee';
    const securityClearance = role === 'company_developer' ? 'DEVELOPER REMEDIATION' : 'EMPLOYEE AWARENESS';

    const newUser = await sql`
      INSERT INTO users (
        id, company_id, name, email, password_hash, role, role_label,
        role_category, company_name, is_individual, status, security_clearance
      ) VALUES (
        ${newUserId}, ${companyId}, ${name}, ${cleanEmail}, ${tempPassword},
        ${role}, ${roleLabel}, 'Internal Client Tenant', ${companyName}, false,
        'offline', ${securityClearance}
      )
      RETURNING id, company_id, name, email, role, role_label, role_category, company_name, status, security_clearance
    `;

    res.json({ success: true, user: newUser[0] });
  } catch (err) {
    console.error('Team invite error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Vortex Backend Server running on http://localhost:${PORT}`);
  await initDb();
});
