import { sql } from './db.js';

export async function initDb() {
  try {
    console.log('🔗 Connecting to Neon PostgreSQL...');
    const check = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    console.log(`✅ Connected to Neon database: ${check[0].db_name} at ${check[0].current_time}`);

    // Create Tables
    await sql`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        registration_number VARCHAR(100),
        pin_code VARCHAR(10),
        address TEXT,
        industry VARCHAR(100) DEFAULT 'Enterprise Security Client',
        tier VARCHAR(100) DEFAULT 'Business Tier',
        seats_total INT DEFAULT 10,
        active_seats INT DEFAULT 1,
        compliance_score INT DEFAULT 88,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        role_label VARCHAR(100),
        role_category VARCHAR(100),
        company_name VARCHAR(255),
        is_individual BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'offline',
        location TEXT,
        pin_code VARCHAR(10),
        security_clearance VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        icon_name VARCHAR(50) DEFAULT 'Shield',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
        category_name VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        tagline TEXT,
        description TEXT,
        price NUMERIC(12, 2) NOT NULL,
        billing_cycle VARCHAR(50) DEFAULT 'Monthly',
        badge VARCHAR(50),
        max_seats INT DEFAULT 10,
        assets_included INT DEFAULT 15,
        features JSONB DEFAULT '[]'::jsonb,
        feature_key VARCHAR(100),
        is_hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
        company_name VARCHAR(255) NOT NULL,
        registration_number VARCHAR(100),
        customer_manager_name VARCHAR(255) NOT NULL,
        customer_manager_email VARCHAR(255) NOT NULL,
        billing_address TEXT NOT NULL,
        pin_code VARCHAR(10) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        order_status VARCHAR(50) DEFAULT 'Processing',
        total_amount NUMERIC(12, 2) NOT NULL,
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS product_allocations (
        id SERIAL PRIMARY KEY,
        company_id VARCHAR(50) REFERENCES companies(id) ON DELETE CASCADE,
        product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, product_id, user_id)
      );
    `;

    // Order Line Items (Normalized 3NF Architecture)
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(50) REFERENCES products(id) ON DELETE RESTRICT,
        quantity INT NOT NULL DEFAULT 1,
        unit_price NUMERIC(12, 2) NOT NULL,
        subtotal NUMERIC(12, 2) NOT NULL,
        allocated_seats INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 🔒 Singleton Owner Constraint: Strictly only 1 owner_manager allowed in database
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_owner_manager 
      ON users (role) 
      WHERE role = 'owner_manager';
    `;

    console.log('✅ Tables verified/created in Neon PostgreSQL!');

    // Seed default categories
    const catCheck = await sql`SELECT COUNT(*) as count FROM categories`;
    if (parseInt(catCheck[0].count) === 0) {
      console.log('🌱 Seeding initial categories into Neon...');
      await sql`
        INSERT INTO categories (id, name, slug, description, icon_name, is_active) VALUES
        ('cat-vapt', 'Vulnerability Assessment & Penetration Testing (VAPT)', 'vapt', 'Offensive security assessments, automated web application scanners, and deep API vulnerability discovery.', 'Terminal', true),
        ('cat-cspm', 'Cloud Security Posture (CSPM & CI/CD)', 'cloud-security', 'Infrastructure-as-code security linting, multi-cloud IAM audits, and container image shielding.', 'Cloud', true),
        ('cat-siem', 'Continuous 24/7 SOC & MDR Telemetry', 'monitoring-soc', 'Continuous endpoint threat hunting, Indian CERT-In compliant logging, and real-time intrusion defense.', 'Activity', true),
        ('cat-compliance', 'Compliance & Audit Readiness (ISO / SOC 2 / RBI)', 'compliance-audit', 'ISO 27001, SOC 2 Type II, DPDP Act 2023, and RBI cybersecurity framework audit preparation.', 'FileCheck', true),
        ('cat-awareness', 'Workforce Phishing Defense & Security Academy', 'workforce-training', 'Simulated adversary phishing campaigns, QR code scams, and employee cyber hygiene certifications.', 'ShieldAlert', true);
      `;
    }

    // Seed default products
    const prodCheck = await sql`SELECT COUNT(*) as count FROM products`;
    if (parseInt(prodCheck[0].count) === 0) {
      console.log('🌱 Seeding initial products in INR into Neon...');
      await sql`
        INSERT INTO products (id, category_id, category_name, name, tagline, description, price, billing_cycle, badge, max_seats, assets_included, features, is_hidden) VALUES
        ('prod-web-scan', 'cat-vapt', 'VAPT', 'Vortex Web Application & API Shield', 'Automated DAST & continuous API vulnerability scanner', 'Deep automated scanning for OWASP Top 10 vulnerabilities, broken object authorization, secret leaks, and SQLi on web apps and REST/GraphQL APIs.', 39999, 'Monthly', 'Popular', 10, 15, '["Automated weekly vulnerability & port scans", "OWASP Top 10 + API Top 10 automated test suites", "Assigned developer vulnerability triage board", "Detailed PDF remediation reports for compliance", "Up to 10 team seats (Developers & SecOps)"]'::jsonb, false),
        ('prod-red-team', 'cat-vapt', 'VAPT', 'Full-Scope Red Team Adversary Simulation', 'Simulated cyberattack by certified Indian ethical hackers', 'Comprehensive physical, digital, and social engineering red team assessment replicating nation-state threat tactics with executive remediation debrief.', 285000, 'One-Time Project', 'Enterprise', 25, 50, '["Nation-state APT adversary simulation", "Custom spear-phishing & MFA fatigue tests", "External + Internal network lateral pivoting", "Live zero-day remediation workshop for developers", "Executive board presentation & compliance sign-off"]'::jsonb, false),
        ('prod-cloud-guard', 'cat-cspm', 'Cloud Security', 'Cloud Armor & Kubernetes DevSecOps', 'Real-time multi-cloud IAM, posture, and container defense', 'Connect AWS, GCP, and Azure accounts to continuously detect misconfigurations, open S3 buckets, exposed secrets, and unpatched Kubernetes pods.', 64999, 'Monthly', 'High Value', 15, 30, '["Multi-cloud CSPM for AWS, Azure, and Google Cloud", "CI/CD pipeline automated secret & container image gates", "Kubernetes cluster runtime security & policy drift alerts", "Automated least-privilege IAM suggestions", "Direct Slack, Jira, and GitHub integrations"]'::jsonb, false),
        ('prod-247-soc', 'cat-siem', 'Continuous Monitoring', '24/7 Managed SOC & MDR Response Unit', 'Elite analysts backed by autonomous sub-50ms containment', 'Enterprise 24/7 Security Operations Center monitoring all endpoints, cloud logs, and identity providers with guaranteed 15-minute SLA on active threats.', 159999, 'Monthly', 'Critical Defense', 50, 100, '["24/7/365 active eyes-on-glass threat hunting", "Automated endpoint micro-isolation upon breach detection", "CERT-In 6-hour incident reporting readiness", "Dedicated Slack incident war-room channel with CISSP leads", "Up to 50 team member seats with customized alerting"]'::jsonb, false),
        ('prod-compliance-hub', 'cat-compliance', 'Compliance & Audit', 'Automated ISO 27001 & DPDP Audit Readiness', 'Continuous evidence gathering and audit checklist engine', 'Turn months of manual spreadsheet audit prep into automated evidence collection. Generates auditor-ready packets for ISO 27001, SOC 2, and India DPDP Act 2023.', 52999, 'Monthly', 'Audit Ready', 15, 20, '["Continuous compliance telemetry against ISO 27001 & DPDP", "Pre-built security policy templates and employee sign-offs", "Auditor collaboration portal with read-only evidence access", "Vendor risk assessments and third-party questionnaires", "Readiness gap analysis and scoring dashboard"]'::jsonb, false);
      `;
    }

    // Seed default users & company
    const userCheck = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(userCheck[0].count) === 0) {
      console.log('🌱 Seeding core initial users into Neon...');
      await sql`
        INSERT INTO companies (id, name, domain, registration_number, pin_code, address, status) VALUES
        ('comp-apex', 'Apex CyberTech India Pvt Ltd', 'apextech.in', '27AABCA1234F1Z5', '411028', 'Tower 4, Cyber City, Magarpatta, Pune, Maharashtra', 'Active')
        ON CONFLICT (id) DO NOTHING;
      `;

      await sql`
        INSERT INTO users (id, company_id, name, email, password_hash, role, role_label, role_category, company_name, is_individual, status, security_clearance) VALUES
        ('usr-owner-root', NULL, 'Platform Owner', 'owner@vortex.internal', 'owner123', 'owner_manager', 'Platform Owner & Root Admin', 'Executive Platform Oversight', 'Vortex Global Security Infrastructure', false, 'online', 'LEVEL-5 ROOT (ONLY ONE OWNER LOGIN)'),
        ('usr-senior-mgr-apex', 'comp-apex', 'Marcus Vance', 'marcus.mgr@apextech.com', 'manager123', 'company_manager', 'Customer Manager', 'Organization Leadership', 'Apex CyberTech India Pvt Ltd', false, 'online', 'COMPANY OWNER / MANAGER'),
        ('usr-emp-rohan', 'comp-apex', 'Rohan Sharma', 'rohan.sec@apextech.com', 'employee123', 'employee', 'SecOps Analyst', 'Technical Security Staff', 'Apex CyberTech India Pvt Ltd', false, 'online', 'OPERATIONAL TIER-2')
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // Seed default orders if empty
    const orderCheck = await sql`SELECT COUNT(*) as count FROM orders`;
    if (parseInt(orderCheck[0].count) === 0) {
      console.log('🌱 Seeding initial orders placed by company managers into Neon...');
      await sql`
        INSERT INTO orders (
          id, company_id, company_name, registration_number, customer_manager_name,
          customer_manager_email, billing_address, pin_code, country, payment_method,
          payment_status, order_status, total_amount, items
        ) VALUES (
          'ORD-IN-2026-8491', 'comp-apex', 'Apex CyberTech India Pvt Ltd', '27AABCA1234F1Z5',
          'Marcus Vance', 'marcus.mgr@apextech.com', 'Tower 4, Cyber City, Magarpatta, Pune, Maharashtra',
          '411028', 'India', 'Corporate Net Banking', 'Paid', 'Completed', 104998.00,
          '[{"id": "prod-web-scan", "name": "Vortex Web Application & API Shield", "price": 39999, "quantity": 1, "maxSeats": 10}, {"id": "prod-cloud-guard", "name": "Cloud Armor & Kubernetes DevSecOps", "price": 64999, "quantity": 1, "maxSeats": 15}]'::jsonb
        );
      `;
    }

    // Seed default product allocations if empty
    const allocCheck = await sql`SELECT COUNT(*) as count FROM product_allocations`;
    if (parseInt(allocCheck[0].count) === 0) {
      console.log('🌱 Seeding initial product allocations to employees into Neon...');
      await sql`
        INSERT INTO product_allocations (company_id, product_id, user_id) VALUES
        ('comp-apex', 'prod-web-scan', 'usr-emp-rohan'),
        ('comp-apex', 'prod-cloud-guard', 'usr-emp-rohan')
        ON CONFLICT (company_id, product_id, user_id) DO NOTHING;
      `;
    }

    console.log('🎉 Neon PostgreSQL initialization & seeding 100% complete!');
    return true;
  } catch (err) {
    console.error('❌ Neon initDb error:', err);
    throw err;
  }
}

if (process.argv[1]?.endsWith('initDb.js')) {
  initDb().then(() => process.exit(0)).catch(() => process.exit(1));
}
