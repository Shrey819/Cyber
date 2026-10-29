import { sql } from './db.js';

async function seedAllTables() {
  console.log('🚀 Connecting to Neon PostgreSQL to populate all 6 tables properly...');

  // =========================================================================
  // 1. POPULATE COMPANIES
  // =========================================================================
  console.log('🏢 1. Populating companies...');
  await sql`
    INSERT INTO companies (id, name, domain, registration_number, pin_code, address, industry, tier, seats_total, active_seats, compliance_score, status)
    VALUES 
    ('comp-apex', 'Apex CyberTech India Pvt Ltd', 'apextech.in', '27AABCA1234F1Z5', '411028', 'Tower 4, Cyber City, Magarpatta, Pune, Maharashtra', 'Offensive Security & FinTech', 'Enterprise Tier', 25, 2, 94, 'Active'),
    ('comp-zenith', 'Zenith Financial Cloud Labs Ltd', 'zenithcloud.in', '33AAACZ9876K1ZQ', '560100', 'Plot 12, Electronic City Phase 1, Bengaluru, Karnataka', 'Banking & Cloud Infrastructure', 'Business Tier', 20, 1, 89, 'Active')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      domain = EXCLUDED.domain,
      registration_number = EXCLUDED.registration_number,
      pin_code = EXCLUDED.pin_code,
      address = EXCLUDED.address,
      industry = EXCLUDED.industry,
      tier = EXCLUDED.tier,
      seats_total = EXCLUDED.seats_total,
      active_seats = EXCLUDED.active_seats,
      compliance_score = EXCLUDED.compliance_score,
      status = EXCLUDED.status;
  `;

  // =========================================================================
  // 2. POPULATE USERS (WITH 1 OWNER MANAGER, COMPANY MANAGERS, EMPLOYEES)
  // =========================================================================
  console.log('👥 2. Populating users (Owner Manager [SINGLE LOGIN], Company Managers, Employees)...');

  // Enforce single owner index if not already present
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_owner_manager 
    ON users (role) 
    WHERE role = 'owner_manager';
  `;

  // A. SINGLE PLATFORM OWNER MANAGER (Singleton login in entire database)
  await sql`
    INSERT INTO users (
      id, company_id, name, email, password_hash, role, role_label, role_category, 
      company_name, is_individual, status, security_clearance, designation
    ) VALUES (
      'usr-owner-root', NULL, 'Vikramaditya Singhania', 'owner@vortex.internal', 'owner123',
      'owner_manager', 'Platform Owner & Root Admin', 'Executive Platform Oversight',
      'Vortex Global Security Infrastructure', false, 'online', 'LEVEL-5 ROOT (ONLY ONE OWNER LOGIN)', 'Founder & Global Administrator'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      role_label = EXCLUDED.role_label,
      role_category = EXCLUDED.role_category,
      security_clearance = EXCLUDED.security_clearance;
  `;

  // B. COMPANY 1: Customer Manager (Marcus Vance) & Employee (Rohan Sharma & Shrey)
  await sql`
    INSERT INTO users (
      id, company_id, name, email, password_hash, role, role_label, role_category, 
      company_name, is_individual, status, pin_code, location, security_clearance, designation
    ) VALUES (
      'usr-senior-mgr-apex', 'comp-apex', 'Marcus Vance', 'marcus.mgr@apextech.com', 'manager123',
      'company_manager', 'Customer Manager (Company Lead)', 'Organization Leadership',
      'Apex CyberTech India Pvt Ltd', false, 'online', '411028', 'Pune, MH', 'COMPANY OWNER / MANAGER', 'Chief Information Security Officer'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      role_label = EXCLUDED.role_label,
      company_id = EXCLUDED.company_id,
      company_name = EXCLUDED.company_name;
  `;

  await sql`
    INSERT INTO users (
      id, company_id, name, email, password_hash, role, role_label, role_category, 
      company_name, is_individual, status, pin_code, location, security_clearance, designation, manager_id
    ) VALUES (
      'usr-emp-rohan', 'comp-apex', 'Rohan Sharma', 'rohan.sec@apextech.com', 'employee123',
      'employee', 'Security Operations Analyst', 'Technical Security Staff',
      'Apex CyberTech India Pvt Ltd', false, 'online', '411028', 'Pune, MH', 'OPERATIONAL TIER-2', 'SecOps Engineer', 'usr-senior-mgr-apex'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      role_label = EXCLUDED.role_label,
      company_id = EXCLUDED.company_id,
      manager_id = EXCLUDED.manager_id;
  `;

  // Keep existing user 'shrey' as employee under Apex
  await sql`
    UPDATE users 
    SET company_id = 'comp-apex',
        company_name = 'Apex CyberTech India Pvt Ltd',
        role = 'employee',
        role_label = 'Security Developer',
        role_category = 'Technical Security Staff',
        manager_id = 'usr-senior-mgr-apex'
    WHERE email = 's@s.com';
  `;

  // C. COMPANY 2: Customer Manager (Priya Nair) & Employee (Kavita Patel)
  await sql`
    INSERT INTO users (
      id, company_id, name, email, password_hash, role, role_label, role_category, 
      company_name, is_individual, status, pin_code, location, security_clearance, designation
    ) VALUES (
      'usr-mgr-zenith', 'comp-zenith', 'Priya Nair', 'priya.mgr@zenithcloud.in', 'manager123',
      'company_manager', 'Customer Manager (Company Lead)', 'Organization Leadership',
      'Zenith Financial Cloud Labs Ltd', false, 'online', '560100', 'Bengaluru, KA', 'COMPANY OWNER / MANAGER', 'VP of Cloud Engineering'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      role_label = EXCLUDED.role_label,
      company_id = EXCLUDED.company_id;
  `;

  await sql`
    INSERT INTO users (
      id, company_id, name, email, password_hash, role, role_label, role_category, 
      company_name, is_individual, status, pin_code, location, security_clearance, designation, manager_id
    ) VALUES (
      'usr-emp-kavita', 'comp-zenith', 'Kavita Patel', 'kavita.dev@zenithcloud.in', 'employee123',
      'employee', 'Cloud Security Engineer', 'Technical Security Staff',
      'Zenith Financial Cloud Labs Ltd', false, 'online', '560100', 'Bengaluru, KA', 'OPERATIONAL TIER-2', 'DevSecOps Specialist', 'usr-mgr-zenith'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      role_label = EXCLUDED.role_label,
      company_id = EXCLUDED.company_id,
      manager_id = EXCLUDED.manager_id;
  `;

  // =========================================================================
  // 3. POPULATE CATEGORIES
  // =========================================================================
  console.log('🏷️ 3. Populating categories...');
  await sql`
    INSERT INTO categories (id, name, slug, description, icon_name, is_active) VALUES
    ('cat-vapt', 'Vulnerability Assessment & Penetration Testing (VAPT)', 'vapt', 'Offensive security assessments, automated web application scanners, and deep API vulnerability discovery.', 'Terminal', true),
    ('cat-cspm', 'Cloud Security Posture (CSPM & CI/CD)', 'cloud-security', 'Infrastructure-as-code security linting, multi-cloud IAM audits, and container image shielding.', 'Cloud', true),
    ('cat-siem', 'Continuous 24/7 SOC & MDR Telemetry', 'monitoring-soc', 'Continuous endpoint threat hunting, Indian CERT-In compliant logging, and real-time intrusion defense.', 'Activity', true),
    ('cat-compliance', 'Compliance & Audit Readiness (ISO / SOC 2 / RBI)', 'compliance-audit', 'ISO 27001, SOC 2 Type II, DPDP Act 2023, and RBI cybersecurity framework audit preparation.', 'FileCheck', true),
    ('cat-awareness', 'Workforce Phishing Defense & Security Academy', 'workforce-training', 'Simulated adversary phishing campaigns, QR code scams, and employee cyber hygiene certifications.', 'ShieldAlert', true)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      description = EXCLUDED.description,
      icon_name = EXCLUDED.icon_name,
      is_active = EXCLUDED.is_active;
  `;

  // =========================================================================
  // 4. POPULATE PRODUCTS
  // =========================================================================
  console.log('📦 4. Populating products...');
  await sql`
    INSERT INTO products (id, category_id, category_name, name, tagline, description, price, billing_cycle, badge, max_seats, assets_included, features, is_hidden) VALUES
    ('prod-web-scan', 'cat-vapt', 'VAPT', 'Vortex Web Application & API Shield', 'Automated DAST & continuous API vulnerability scanner', 'Deep automated scanning for OWASP Top 10 vulnerabilities, broken object authorization, secret leaks, and SQLi on web apps and REST/GraphQL APIs.', 39999, 'Monthly', 'Popular', 10, 15, '["Automated weekly vulnerability & port scans", "OWASP Top 10 + API Top 10 automated test suites", "Assigned developer vulnerability triage board", "Detailed PDF remediation reports for compliance", "Up to 10 team seats (Developers & SecOps)"]'::jsonb, false),
    ('prod-red-team', 'cat-vapt', 'VAPT', 'Full-Scope Red Team Adversary Simulation', 'Simulated cyberattack by certified Indian ethical hackers', 'Comprehensive physical, digital, and social engineering red team assessment replicating nation-state threat tactics with executive remediation debrief.', 285000, 'One-Time Project', 'Enterprise', 25, 50, '["Nation-state APT adversary simulation", "Custom spear-phishing & MFA fatigue tests", "External + Internal network lateral pivoting", "Live zero-day remediation workshop for developers", "Executive board presentation & compliance sign-off"]'::jsonb, false),
    ('prod-cloud-guard', 'cat-cspm', 'Cloud Security', 'Cloud Armor & Kubernetes DevSecOps', 'Real-time multi-cloud IAM, posture, and container defense', 'Connect AWS, GCP, and Azure accounts to continuously detect misconfigurations, open S3 buckets, exposed secrets, and unpatched Kubernetes pods.', 64999, 'Monthly', 'High Value', 15, 30, '["Multi-cloud CSPM for AWS, Azure, and Google Cloud", "CI/CD pipeline automated secret & container image gates", "Kubernetes cluster runtime security & policy drift alerts", "Automated least-privilege IAM suggestions", "Direct Slack, Jira, and GitHub integrations"]'::jsonb, false),
    ('prod-247-soc', 'cat-siem', 'Continuous Monitoring', '24/7 Managed SOC & MDR Response Unit', 'Elite analysts backed by autonomous sub-50ms containment', 'Enterprise 24/7 Security Operations Center monitoring all endpoints, cloud logs, and identity providers with guaranteed 15-minute SLA on active threats.', 159999, 'Monthly', 'Critical Defense', 50, 100, '["24/7/365 active eyes-on-glass threat hunting", "Automated endpoint micro-isolation upon breach detection", "CERT-In 6-hour incident reporting readiness", "Dedicated Slack incident war-room channel with CISSP leads", "Up to 50 team member seats with customized alerting"]'::jsonb, false),
    ('prod-compliance-hub', 'cat-compliance', 'Compliance & Audit', 'Automated ISO 27001 & DPDP Audit Readiness', 'Continuous evidence gathering and audit checklist engine', 'Turn months of manual spreadsheet audit prep into automated evidence collection. Generates auditor-ready packets for ISO 27001, SOC 2, and India DPDP Act 2023.', 52999, 'Monthly', 'Audit Ready', 15, 20, '["Continuous compliance telemetry against ISO 27001 & DPDP", "Pre-built security policy templates and employee sign-offs", "Auditor collaboration portal with read-only evidence access", "Vendor risk assessments and third-party questionnaires", "Readiness gap analysis and scoring dashboard"]'::jsonb, false)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      price = EXCLUDED.price,
      max_seats = EXCLUDED.max_seats,
      features = EXCLUDED.features;
  `;

  // =========================================================================
  // 5. POPULATE ORDERS (CURRENTLY EMPTY - CRITICAL TO FILL)
  // =========================================================================
  console.log('💳 5. Populating orders for Companies placed by their Company Managers...');
  
  // Clear any partial orders for clean seeding
  await sql`DELETE FROM orders`;

  await sql`
    INSERT INTO orders (
      id, company_id, company_name, registration_number, customer_manager_name,
      customer_manager_email, billing_address, pin_code, country, payment_method,
      payment_status, order_status, total_amount, items
    ) VALUES 
    (
      'ORD-IN-2026-8491',
      'comp-apex',
      'Apex CyberTech India Pvt Ltd',
      '27AABCA1234F1Z5',
      'Marcus Vance',
      'marcus.mgr@apextech.com',
      'Tower 4, Cyber City, Magarpatta, Pune, Maharashtra',
      '411028',
      'India',
      'Corporate Net Banking (HDFC Bank)',
      'Paid',
      'Completed',
      104998.00,
      '[
        {
          "id": "prod-web-scan",
          "name": "Vortex Web Application & API Shield",
          "price": 39999,
          "quantity": 1,
          "maxSeats": 10,
          "billingCycle": "Monthly"
        },
        {
          "id": "prod-cloud-guard",
          "name": "Cloud Armor & Kubernetes DevSecOps",
          "price": 64999,
          "quantity": 1,
          "maxSeats": 15,
          "billingCycle": "Monthly"
        }
      ]'::jsonb
    ),
    (
      'ORD-IN-2026-9214',
      'comp-apex',
      'Apex CyberTech India Pvt Ltd',
      '27AABCA1234F1Z5',
      'Marcus Vance',
      'marcus.mgr@apextech.com',
      'Tower 4, Cyber City, Magarpatta, Pune, Maharashtra',
      '411028',
      'India',
      'RTGS / Wire Transfer',
      'Paid',
      'Processing',
      159999.00,
      '[
        {
          "id": "prod-247-soc",
          "name": "24/7 Managed SOC & MDR Response Unit",
          "price": 159999,
          "quantity": 1,
          "maxSeats": 50,
          "billingCycle": "Monthly"
        }
      ]'::jsonb
    ),
    (
      'ORD-IN-2026-5120',
      'comp-zenith',
      'Zenith Financial Cloud Labs Ltd',
      '33AAACZ9876K1ZQ',
      'Priya Nair',
      'priya.mgr@zenithcloud.in',
      'Plot 12, Electronic City Phase 1, Bengaluru, Karnataka',
      '560100',
      'India',
      'Corporate Credit Card',
      'Paid',
      'Completed',
      52999.00,
      '[
        {
          "id": "prod-compliance-hub",
          "name": "Automated ISO 27001 & DPDP Audit Readiness",
          "price": 52999,
          "quantity": 1,
          "maxSeats": 15,
          "billingCycle": "Monthly"
        }
      ]'::jsonb
    );
  `;

  // =========================================================================
  // 6. POPULATE PRODUCT ALLOCATIONS (CONNECTING PRODUCTS TO EMPLOYEES)
  // =========================================================================
  console.log('🎯 6. Populating product allocations (Assigning purchased product seats to employees)...');
  
  await sql`DELETE FROM product_allocations`;

  await sql`
    INSERT INTO product_allocations (company_id, product_id, user_id)
    VALUES 
    -- Apex Manager Marcus allocates Web Shield & Cloud Armor seats to employee Rohan Sharma
    ('comp-apex', 'prod-web-scan', 'usr-emp-rohan'),
    ('comp-apex', 'prod-cloud-guard', 'usr-emp-rohan'),
    -- Apex Manager Marcus also allocates Web Shield seat to developer/employee Shrey
    ('comp-apex', 'prod-web-scan', 'usr-emp-mvtwoyj2'),
    -- Zenith Manager Priya allocates Compliance Hub seat to employee Kavita Patel
    ('comp-zenith', 'prod-compliance-hub', 'usr-emp-kavita');
  `;

  // Update active_seats counter on companies
  await sql`
    UPDATE companies
    SET active_seats = (
      SELECT COUNT(DISTINCT user_id) FROM product_allocations WHERE product_allocations.company_id = companies.id
    );
  `;

  console.log('\n======================================================');
  console.log('✅ ALL 6 TABLES HAVE BEEN FILLED PROPERLY IN NEON DB!');
  console.log('======================================================\n');

  // Verify and display counts
  const u = await sql`SELECT count(*) FROM users`;
  const c = await sql`SELECT count(*) FROM companies`;
  const cat = await sql`SELECT count(*) FROM categories`;
  const p = await sql`SELECT count(*) FROM products`;
  const o = await sql`SELECT count(*) FROM orders`;
  const a = await sql`SELECT count(*) FROM product_allocations`;

  console.log('📊 FINAL ROW COUNTS IN NEON POSTGRESQL:');
  console.table([
    { Table: 'categories', Rows: cat[0].count, Purpose: 'Product Classifications' },
    { Table: 'companies', Rows: c[0].count, Purpose: 'Tenant Organizations' },
    { Table: 'users', Rows: u[0].count, Purpose: '1 Owner Manager, Company Managers, Employees' },
    { Table: 'products', Rows: p[0].count, Purpose: 'Catalog with INR Pricing & Max Seats' },
    { Table: 'orders', Rows: o[0].count, Purpose: 'Purchases placed by Company Managers' },
    { Table: 'product_allocations', Rows: a[0].count, Purpose: 'Seats assigned to Employees' },
  ]);

  process.exit(0);
}

seedAllTables().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
