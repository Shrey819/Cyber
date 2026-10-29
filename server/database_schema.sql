-- ============================================================================
-- ENTERPRISE RBAC, PRODUCT CATALOG & ORDER MANAGEMENT SYSTEM
-- Compatible with PostgreSQL / Neon Database
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & UTILITY FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. COMPANIES TABLE (Tenant Organizations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE, -- GSTIN / VAT / EIN
    domain VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    pin_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for companies
DROP TRIGGER IF EXISTS set_companies_timestamp ON companies;
CREATE TRIGGER set_companies_timestamp
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


-- ----------------------------------------------------------------------------
-- 3. USERS & RBAC LOGIN SYSTEM
-- Roles:
--   a) 'owner_manager'   -> System-wide Platform Owner (ONLY 1 LOGIN ALLOWED IN DB)
--   b) 'company_manager' -> Client Organization Lead (Manages orders & employees)
--   c) 'employee'        -> Client Staff (Assigned to products/licenses by manager)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) REFERENCES companies(id) ON DELETE SET NULL,
    manager_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL, -- Self-referencing FK (hierarchy)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('owner_manager', 'company_manager', 'employee')),
    designation VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🔒 HARD ENFORCEMENT: ONLY ONE OWNER MANAGER CAN EXIST IN THE ENTIRE DATABASE
-- Uses a PostgreSQL Partial Unique Index to enforce the Singleton Owner rule at the engine level
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_owner_manager 
ON users (role) 
WHERE role = 'owner_manager';

-- Trigger for users
DROP TRIGGER IF EXISTS set_users_timestamp ON users;
CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


-- ----------------------------------------------------------------------------
-- 4. PRODUCT CATALOG DOMAIN
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Shield',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES product_categories(id) ON DELETE SET NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    billing_cycle VARCHAR(30) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual', 'one_time', 'usage_based')),
    max_seats INT DEFAULT 5 CHECK (max_seats >= 1),
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for products
DROP TRIGGER IF EXISTS set_products_timestamp ON products;
CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


-- ----------------------------------------------------------------------------
-- 5. ORDER MANAGEMENT DOMAIN (Header + Normalized Line Items Pattern)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-friendly invoice reference (e.g. ORD-2026-001)
    company_id VARCHAR(50) NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    placed_by_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) DEFAULT 'invoice' CHECK (payment_method IN ('invoice', 'credit_card', 'net_banking', 'upi', 'wire_transfer')),
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status VARCHAR(30) DEFAULT 'processing' CHECK (order_status IN ('draft', 'processing', 'completed', 'cancelled')),
    billing_address TEXT NOT NULL,
    billing_pin_code VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for orders
DROP TRIGGER IF EXISTS set_orders_timestamp ON orders;
CREATE TRIGGER set_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Order Line Items (3NF normalization: preserves historical prices upon catalog price updates)
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    allocated_seats INT NOT NULL DEFAULT 1 CHECK (allocated_seats >= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ----------------------------------------------------------------------------
-- 6. PRODUCT ALLOCATIONS / ENTITLEMENTS (Bridging Orders -> Employees)
-- Company Managers assign purchased product seats to their Employees
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_allocations (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, product_id, employee_id) -- Prevents duplicate seat assignment
);


-- ----------------------------------------------------------------------------
-- 7. PERFORMANCE & RELATIONSHIP INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_placed_by ON orders(placed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_allocations_employee ON product_allocations(employee_id);
CREATE INDEX IF NOT EXISTS idx_allocations_company_prod ON product_allocations(company_id, product_id);


-- ----------------------------------------------------------------------------
-- 8. SAMPLE VERIFIED SEED DATA
-- Demonstrates 1 Owner Manager, 1 Company Manager, 1 Employee, Products & Orders
-- ----------------------------------------------------------------------------

-- Seed Company
INSERT INTO companies (id, name, tax_id, domain, address, city, pin_code, country, status)
VALUES 
('comp-apex-01', 'Apex CyberTech Solutions Pvt Ltd', '27AABCA1234F1Z5', 'apextech.in', 'Tech Park, Hinjewadi Phase 1', 'Pune', '411057', 'India', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Users (Covering all 3 distinct roles)
-- 1. OWNER MANAGER (Platform Root Owner - only 1 can exist due to partial unique index)
INSERT INTO users (id, company_id, manager_id, name, email, password_hash, role, designation)
VALUES 
('usr-owner-01', NULL, NULL, 'Vikram Malhotra', 'owner@cyberplatform.com', 'ownerSecurePassword#2026', 'owner_manager', 'Platform Owner & Founder')
ON CONFLICT (id) DO NOTHING;

-- 2. COMPANY MANAGER (Customer Enterprise Lead)
INSERT INTO users (id, company_id, manager_id, name, email, password_hash, role, designation)
VALUES 
('usr-mgr-apex', 'comp-apex-01', NULL, 'Marcus Vance', 'marcus.vance@apextech.in', 'mgrPassword#2026', 'company_manager', 'Chief Information Security Officer')
ON CONFLICT (id) DO NOTHING;

-- 3. EMPLOYEE (Works under the Company Manager)
INSERT INTO users (id, company_id, manager_id, name, email, password_hash, role, designation)
VALUES 
('usr-emp-01', 'comp-apex-01', 'usr-mgr-apex', 'Rohan Sharma', 'rohan.sharma@apextech.in', 'empPassword#2026', 'employee', 'SecOps Analyst')
ON CONFLICT (id) DO NOTHING;

-- Seed Product Categories
INSERT INTO product_categories (id, name, slug, description, icon)
VALUES 
('cat-sec-ops', 'Offensive Security & VAPT', 'vapt', 'Automated vulnerability scanning and API threat analysis', 'Terminal'),
('cat-cloud', 'Cloud Security & Compliance', 'cloud-sec', 'Multi-cloud IAM guardrails, CSPM, and SOC 2 / ISO compliance', 'Cloud')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, category_id, sku, name, tagline, description, price, billing_cycle, max_seats, features, is_active)
VALUES 
('prod-vapt-pro', 'cat-sec-ops', 'SKU-VAPT-001', 'Vortex VAPT Shield Enterprise', 'Autonomous API & DAST Scanner', 'Deep vulnerability scanning for OWASP Top 10 vulnerabilities, API token leaks, and SQL injection.', 39999.00, 'monthly', 10, '["Weekly automated vulnerability scans", "OWASP API Top 10 automated test suites", "Remediation PDF for compliance"]'::jsonb, true),
('prod-cloud-guard', 'cat-cloud', 'SKU-CSPM-002', 'Cloud Sentinel & Posture Defender', 'Continuous Multi-Cloud IAM & Drift Detection', 'Connect AWS, GCP, and Azure accounts to audit misconfigurations, open storage buckets, and identity leaks.', 64999.00, 'monthly', 15, '["Multi-cloud CSPM for AWS, Azure, GCP", "Real-time IAM posture alerts", "CIS benchmark reporting"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- Seed A Complete Order (Placed by Company Manager for their company)
INSERT INTO orders (id, order_number, company_id, placed_by_user_id, subtotal, tax_amount, total_amount, currency, payment_method, payment_status, order_status, billing_address, billing_pin_code, notes)
VALUES 
('ord-1001', 'ORD-2026-0001', 'comp-apex-01', 'usr-mgr-apex', 104998.00, 18899.64, 123897.64, 'INR', 'invoice', 'paid', 'completed', 'Tech Park, Hinjewadi Phase 1, Pune, MH', '411057', 'Corporate Annual Cybersecurity Subscription')
ON CONFLICT (id) DO NOTHING;

-- Seed Order Line Items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal, allocated_seats)
VALUES 
('item-1001-1', 'ord-1001', 'prod-vapt-pro', 1, 39999.00, 39999.00, 10),
('item-1001-2', 'ord-1001', 'prod-cloud-guard', 1, 64999.00, 64999.00, 15)
ON CONFLICT (id) DO NOTHING;

-- Seed Product Allocation (Manager assigns 1 seat of VAPT Shield to Employee Rohan)
INSERT INTO product_allocations (id, company_id, product_id, employee_id, assigned_by_id, status)
VALUES 
('alloc-01', 'comp-apex-01', 'prod-vapt-pro', 'usr-emp-01', 'usr-mgr-apex', 'active')
ON CONFLICT (id) DO NOTHING;
