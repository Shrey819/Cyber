# CyberShield (Vortex Cyber Defense) – Comprehensive Project Summary

> **Document Type:** Project Architecture, Implementation Review & Mid-Term Evaluation Reference  
> **Repository:** `d:\cybersecurity`  
> **Tech Stack:** React 19, Vite 6, Tailwind CSS v4, Express 5, Node.js, MongoDB (Mongoose), Cheerio, PDFKit  
> **Verification Status:** 11/11 Automated Test Suites Passing (100%), Production Build Clean  

---

## Table of Contents
1. [Project Overview and Objectives](#1-project-overview-and-objectives)
2. [Technologies and Tools Used](#2-technologies-and-tools-used)
3. [Frontend Architecture: Pages, Components & Interactivity](#3-frontend-architecture-pages-components--interactivity)
4. [Backend APIs, Routes, Controllers & Authentication](#4-backend-apis-routes-controllers--authentication)
5. [Database Architecture: MongoDB Collections & Schemas](#5-database-architecture-mongodb-collections--schemas)
6. [Feature Verification: Working vs. Partial vs. UI Simulation](#6-feature-verification-working-vs-partial-vs-ui-simulation)
7. [End-to-End Application Workflow](#7-end-to-end-application-workflow)
8. [Setup, Execution & Evaluator Demo Instructions](#8-setup-execution--evaluator-demo-instructions)
9. [Known Limitations, Constraints & Edge Cases](#9-known-limitations-constraints--edge-cases)
10. [Future Scope & Roadmap](#10-future-scope--roadmap)
11. [Recommended Slide Structure for College Mid-Term PPT](#11-recommended-slide-structure-for-college-mid-term-ppt)

---

## 1. Project Overview and Objectives

**CyberShield (Vortex Cyber Defense)** is an enterprise-grade Cybersecurity & Website Auditing SaaS platform. It combines automated, non-intrusive website technical and security health auditing with a multi-role B2B cyber defense management portal.

### Core Objectives:
1. **Automated Passive Website Auditing:** Provide zero-configuration security, accessibility, performance, SEO, mobile responsiveness, and SSL/DNS audits for any public web domain.
2. **SSRF-Defended Scanner Architecture:** Enable safe public scanning by strictly blocking access to internal networks, loopback (`localhost`, `127.0.0.1`), private IP ranges (RFC 1918), and cloud metadata endpoints (`169.254.169.254`).
3. **Deterministic Remediation Engine:** Move beyond vague error codes by giving developers and security officers actionable, step-by-step remediation advice, configuration snippets, fix-effort ratings, and verification instructions.
4. **Audit History & Comparative Tracking:** Allow organizations to track their domain’s compliance over time, computing exact score deltas and isolating new regressions versus resolved vulnerabilities.
5. **Multi-Tenant B2B Management:** Provide 6 distinct role-based dashboards (RBAC) supporting seat allocations, license management, GSTIN-compliant Indian tax checkout, and automated PDF reporting.

---

## 2. Technologies and Tools Used

### Frontend:
- **Framework & Runtime:** React 19, Vite 6 (ESM production bundler)
- **Styling:** Tailwind CSS v4, custom cyber-dark glassmorphism theme
- **Icons & Visuals:** `lucide-react`
- **Animations & Interactivity:** `framer-motion`
- **Client-Side Utilities:** DOMPurify, custom canvas utilities

### Backend:
- **Runtime:** Node.js (v20+ / v24.x, ES Modules `type: module`)
- **Server Framework:** Express 5 (`express@^5.3.0`)
- **HTML Parsing & DOM Analysis:** `cheerio` (v1.2.0, pure-JS fast server-side DOM parser)
- **PDF Generation:** `pdfkit` (v0.20.2, streaming vector A4 PDF generation)
- **Networking & Cryptography:** Native Node.js `tls`, `https`, `http`, `dns.promises`, `crypto`
- **Payment Processing:** `razorpay` SDK (with automatic local dev fallback)

### Database:
- **ODM:** Mongoose (`mongoose@^9.12.2`)
- **Database Engine:** MongoDB (standalone connection with automatic fallback to embedded `mongodb-memory-server` for zero-setup development and CI/CD testing)

---

## 3. Frontend Architecture: Pages, Components & Interactivity

The frontend uses single-page hash routing (`#page`, `#scan/:id`, `#checkout/success/:id`) synchronized with browser history.

### Public Marketing & Store Pages:
1. **`HomePage.jsx` (`/` or `#home`):**
   - Cyber-themed hero section with live "Instant Audit" input bar.
   - Triggers the real-time `ScanMonitor` modal without requiring login.
   - Core pillar showcases, customer testimonials, and live security statistics.
2. **`ServicesPage.jsx` (`#services`):**
   - B2B product catalog filtered by security categories (Cloud Defense, Endpoint Protection, VAPT, Incident Response).
   - "Add to Cart" and "Buy Now" workflows with dynamic pricing calculations.
3. **`AboutPage.jsx`, `TeamPage.jsx`, `ContactPage.jsx`:**
   - Company background, CERT-In compliance certifications, leadership profiles, and emergency incident intake forms.
4. **`SearchResultsPage.jsx` (`#search?q=...`):**
   - Live multi-term query filtering across products, modules, and threat advisories.
5. **`CheckoutPage.jsx` & `OrderSuccessPage.jsx`:**
   - Multi-step checkout with real-time Indian GSTIN verification (calculating 18% GST).
   - Razorpay payment modal with fallback sandbox handling.
   - Generates and downloads GST-compliant PDF Tax Invoices.

### Scanner Components & Dedicated Report Page:
1. **`DomainManager.jsx` (Target Domains Management):**
   - Registered domain inventory with status badges, health score pill, and last scan timestamp.
   - "Add Domain" modal with instant SSRF syntax and protocol pre-validation.
   - Soft-delete domain action (archives domain while retaining historical scan data).
   - One-click "Audit" action opening the scan configurator and monitor.
   - One-click "Report" button linking directly to the latest scan report.
2. **`ScanMonitor.jsx` (Real-Time Scan Coordinator Modal):**
   - Mode selector: Quick Audit (Homepage only) vs. Full Website Scan (Crawl capped at 25 pages).
   - Stage progression tracker: `validating` → `crawling` → `scanning` → `scoring` → `completed`.
   - Live progress bar, audited page counter, and in-flight cancellation trigger.
   - Category score cards for all 6 pillars upon completion.
   - "View Detailed Findings" CTA transitioning directly to `#scan/:id`.
3. **`ScanReportPage.jsx` (`#scan/:id`):**
   - **Executive Header:** Target URL, scan mode, unique audit ID, date, and "Download PDF Report" button.
   - **Overall Health Gauge:** Circular color-coded score card (Grade A, B, C, F) with rating labels.
   - **6 Category Cards:** Individual health dials for Security, Performance, SEO, Accessibility, Mobile, and SSL/DNS.
   - **Historical Comparison View:** Interactive dropdown to compare the current audit against any previous scan of the same domain. Computes score deltas (+/-) and isolates New Issues, Resolved Issues, and Recurring Issues.
   - **Multi-Axis Filter Bar:** Filter by category, severity (Critical, High, Medium, Low), status (Violations vs Passed), and text search.
   - **Remediation Accordions:** Expandable cards displaying:
     - Severity and Category badges.
     - "Why It Matters" business/risk explanations.
     - Step-by-step remediation sequences.
     - Monospace code snippets with 1-click clipboard copy.
     - Affected URL drawer with sample violation elements.
     - Fix-effort ratings (`easy`, `medium`, `hard`) and official W3C/MDN doc links.
   - **Audited Pages Drawer:** Table listing all crawled pages with HTTP status codes, TTFB latency (ms), page size (KB), and discovered link counts.

### Role-Based Dashboard (`DashboardPage.jsx`):
Dynamically mounts role-tailored dashboards based on user role:
- **`AdminManagerDashboard.jsx` (`owner_manager`, `admin_manager`):** Company metrics, billing, seat utilization, company-wide audit controls.
- **`SuperDevDashboard.jsx` (`super_developer`):** Platform telemetry, server health, system error logs, global crawler statistics.
- **`SeniorManagerDashboard.jsx` (`senior_manager`, `company_manager`):** Team member management, license allocation, order history.
- **`CompanyDevDashboard.jsx` (`company_developer`):** Technical security console with the embedded **Target Domains** tab (`DomainManager`).
- **`EmployeeDashboard.jsx` (`employee`):** Individual seat access, assigned security tools, employee training status.

---

## 4. Backend APIs, Routes, Controllers & Authentication

### 1. Website Audit Scanner APIs (`server/routes/scanRoutes.js`):
- `POST /api/scans`: Initiates a quick or full scan. Performs SSRF verification, prevents duplicate active runs, creates scan records, and enqueues the scan in `ScanCoordinator`.
- `GET /api/scans/:id`: Returns live status, stage name, percent completion, current step, and score summary.
- `POST /api/scans/:id/cancel`: Requests immediate cooperative cancellation of an in-flight crawl or analysis.
- `GET /api/scans/:id/results`: Returns the complete audit payload: scan record, all audited pages, and deduplicated findings enriched with remediation metadata.
- `GET /api/scans/:id/compare/:otherScanId`: Compares two scans. Calculates score deltas across all 6 categories and classifies finding diffs into `newFindings`, `resolvedFindings`, and `recurringFindings`.
- `GET /api/scans/:id/pdf`: Streams a downloadable multi-page executive PDF audit report.

### 2. Domain Management APIs (`server/routes/domainRoutes.js`):
- `GET /api/domains`: Lists active registered domains for the authenticated user/company.
- `POST /api/domains`: Registers a domain after URL normalization and DNS SSRF verification.
- `GET /api/domains/:id`: Retrieves domain details and latest scan reference.
- `GET /api/domains/:id/scans`: Retrieves chronological historical scans for the domain.
- `DELETE /api/domains/:id`: Soft-deletes (archives) domain while preserving historical scan records.

### 3. Core Enterprise & Authentication APIs (`server/server.js`):
- `POST /api/auth/login`: Authenticates user by email, ID, or role alias (`owner`, `adminmgr`, `superdev`, `seniormgr`, `companydev`). Enforces the platform's Singleton Owner constraint.
- `GET /api/users`: Lists users filtered by company and hierarchy.
- `GET /api/products` & `GET /api/categories`: Returns catalog items and security software SKUs.
- `POST /api/orders`: Creates orders, validates items, provisions seat licenses, and records tax.
- `GET /api/orders/:id/invoice-pdf`: Generates and streams GST-compliant tax invoices via PDFKit.
- `POST /api/gstin/verify`: Validates 15-character Indian GSTIN checksums and formats.
- `GET /api/health`: Health-check endpoint reporting database status and driver connectivity.

---

## 5. Database Architecture: MongoDB Collections & Schemas

Managed through Mongoose in `server/models/index.js`:

| Collection | Schema Key Fields | Purpose |
| :--- | :--- | :--- |
| **`domains`** | `id`, `user_id`, `company_id`, `normalized_domain`, `display_url`, `status` (`active`/`archived`), `latest_score`, `latest_scan_id`, `last_scan_at` | Stores user-registered target domains for ongoing auditing. |
| **`scans`** | `id`, `domain_id`, `user_id`, `company_id`, `target_url`, `normalized_domain`, `scan_mode` (`quick`/`full`), `status` (`queued`/`crawling`/`scanning`/`scoring`/`completed`/`cancelled`), `progress` (`stage`, `percent`, `currentStep`, `pagesAudited`, `maxPages`), `scores` (`overall`, `security`, `performance`, `seo`, `accessibility`, `mobile`, `sslDns`), `summary`, `started_at`, `completed_at` | Tracks individual audit runs, progress state, and category scores. |
| **`scanned_pages`** | `id`, `scan_id`, `url`, `normalized_url`, `status_code`, `content_type`, `response_time_ms`, `page_title`, `page_size_bytes`, `links_discovered`, `error` | Records technical telemetry for every page fetched by the crawler. |
| **`findings`** | `id`, `scan_id`, `domain_id`, `rule_id`, `category`, `title`, `description`, `status` (`passed`/`failed`), `severity` (`critical`/`high`/`medium`/`low`/`info`), `confidence`, `affected_urls`, `evidence`, `recommendation` (`action`, `whyItMatters`, `stepByStep`, `codeSnippet`, `effort`, `docUrl`, `verificationSteps`) | Stores deduplicated, enriched audit findings and vulnerabilities. |
| **`users`** | `id`, `company_id`, `name`, `email`, `password_hash`, `role` (`owner_manager`, `admin_manager`, `senior_manager`, `company_developer`, `employee`, `super_developer`), `role_label`, `status` | User accounts, credentials, and access roles. |
| **`companies`** | `id`, `name`, `domain`, `registration_number` (GSTIN), `pin_code`, `tier`, `seats_total`, `active_seats`, `compliance_score` | Tenant company profiles and licensing limits. |
| **`products`** | `id`, `category_id`, `name`, `sku`, `price`, `billing_cycle`, `features` | Cyber defense software licenses and packages. |
| **`orders` & `order_items`** | `id`, `company_id`, `total_amount`, `gst_amount`, `payment_status`, `payment_method` | Financial records and B2B orders. |
| **`product_allocations`** | `id`, `order_id`, `product_id`, `user_id`, `seat_number`, `status` | Individual seat provisioning per employee. |

---

## 6. Feature Verification: Working vs. Partial vs. UI Simulation

### A. Fully Working (Production-Ready & 100% Tested):
1. **SSRF Boundary Firewall:** URL normalization, IPv4/IPv6 private block detection, loopback rejection, cloud metadata (`169.254.169.254`) blocking, and async DNS pre-flight checking.
2. **Deterministic Crawler:** Same-origin HTML link extractor respecting `robots.txt`, deduplicating links, supporting single-page Quick mode, and capping crawls strictly at 25 pages.
3. **Accessibility Auditing Engine:** 9 automated WCAG 2.1 AA DOM rules evaluated via Cheerio.
4. **Mobile Responsiveness Engine:** Viewport meta checking, zoom-lock detection, fixed-width overflow (`> 390px`), fluid images, unwrapped tables, and `< 12px` font detection.
5. **SSL/TLS & DNS Engine:** Direct socket inspection on port 443 via Node `tls.connect` (CA trust, expiration, SAN wildcard matching), 301/308 redirect checks, and DNS queries for A, AAAA, MX, TXT, NS, SPF, and DMARC.
6. **Recommendation Engine & Deduplication:** 32-rule catalogue providing why-it-matters explanations, step-by-step guides, configuration snippets, and multi-page URL consolidation.
7. **Scoring Formula:** Weighted arithmetic calculation across all 6 pillars:
   $$\text{Score} = 0.20(\text{Security}) + 0.20(\text{Performance}) + 0.15(\text{SEO}) + 0.15(\text{A11y}) + 0.15(\text{Mobile}) + 0.15(\text{SSL/DNS})$$
8. **Scan History & Comparative Diff:** Historical scan retrieval and calculation of score deltas, new bugs, resolved bugs, and recurring bugs.
9. **Streaming PDF Generation:** Full multi-page executive PDF report generation via PDFKit.
10. **Interactive Report Page:** Complete frontend report viewer with filtering, code copying, comparison diff banner, and crawled page inventory.
11. **Database Resilience:** In-memory MongoDB automatic fallback with PostgreSQL dump auto-migration.

### B. Partially Implemented:
1. **Razorpay Gateway Integration:** Code initializes the real Razorpay SDK if valid credentials exist in `.env`; otherwise, it smoothly falls back to a sandbox payment mock so users can complete checkout without real credit cards.
2. **Crawler Concurrency:** Crawling runs sequentially with politeness delays; headless browser JavaScript rendering (Puppeteer/Playwright) is not used (audits evaluate raw SSR/HTML response).

### C. UI Visual Simulations (Simulated for Demo):
1. **SIEM / Live Threat Operations Map:** Visual cyber-attack animation map on the Super Developer dashboard.
2. **Terminal Console Simulation:** Interactive CLI widget on the developer dashboard simulating firewall commands.

---

## 7. End-to-End Application Workflow

```
1. User / Admin onboards target domain
   └─► Enters "example.com" in Domain Manager or Homepage
   └─► Backend runs urlValidator.js (SSRF firewall blocks private IPs/localhost)
   └─► Public DNS is validated and domain is saved to MongoDB

2. User triggers Scan (Quick or Full)
   └─► POST /api/scans registers scan as 'queued'
   └─► ScanCoordinator picks up scan and updates status to 'crawling'
   └─► crawler.js reads robots.txt, crawls in-scope pages (capped at 25)

3. Multi-Pillar Analysis executes
   └─► Security Engine inspects HTTP response headers (HSTS, CSP, XFO, etc.)
   └─► Performance Engine evaluates TTFB response latency and compression
   └─► SEO Engine checks document <title> and meta descriptions
   └─► Accessibility Engine inspects DOM for WCAG 2.1 compliance via Cheerio
   └─► Mobile Engine evaluates viewport tags, horizontal overflow, and image sizing
   └─► SSL/DNS Engine connects to TLS socket on port 443 and queries DNS records

4. Evidence Consolidation & Remediation Enrichment
   └─► Repeated findings across pages are grouped by rule_id into affected_urls[]
   └─► Each finding is mapped to the 32-rule RECOMMENDATION_CATALOGUE
   └─► Weights are calculated and final scores (0-100) are persisted to MongoDB

5. Review, Comparison, and Export
   └─► ScanMonitor notifies user and displays category scores
   └─► User opens ScanReportPage (#scan/:id) to view interactive findings
   └─► User compares audit with past scans to view delta metrics (+/- points)
   └─► User clicks "Download PDF Report" to stream a branded multi-page PDF
```

---

## 8. Setup, Execution & Evaluator Demo Instructions

### Prerequisites:
- Node.js v18+ (tested on Node v20/v24)
- No external MongoDB or PostgreSQL installation required (embedded memory database starts automatically)

### Running the Application:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Full Automated Verification Test Suite (11 Suites):**
   ```bash
   npm test
   ```
   *Expected Result:* All 11 test suites pass with a 100% success rate:
   - `testMigration.js` (MongoDB initialization & schema)
   - `testApiEndpoints.js` (Express REST routes)
   - `testGstinIntegration.js` (Indian tax & GSTIN engine)
   - `testDomains.js` (SSRF rejection & normalization)
   - `testScans.js` (Crawler & Scan coordinator)
   - `testAccessibility.js` (WCAG 2.1 AA engine)
   - `testMobile.js` (Mobile viewport & responsiveness)
   - `testSslDns.js` (TLS port 443 socket & DNS resolution)
   - `testRecommendations.js` (Remediation catalogue & deduplication)
   - `testComparisonAndPdf.js` (Historical diffs & PDF streaming)
   - `testEndToEndAudit.js` (Full lifecycle integration)

3. **Verify Frontend Production Build:**
   ```bash
   npm run build
   ```
   *Expected Result:* Vite builds `dist/` in ~6 seconds with zero errors.

4. **Launch Local Development Servers:**
   ```bash
   npm run dev
   ```
   - **Frontend:** `http://localhost:5173`
   - **Backend API:** `http://localhost:5000`

### Demonstration Steps for Evaluators:
1. **Public Homepage Audit:**
   - Go to `http://localhost:5173`.
   - Enter a public URL (e.g., `https://example.com`) and click **"Audit Now"**.
   - Watch the live progress stages (`validating` → `crawling` → `scanning` → `scoring` → `completed`).
   - Click **"View Detailed Findings"** to inspect the generated report.
2. **Interactive Report View (`#scan/:id`):**
   - Review overall health score and the 6 category scores.
   - Filter findings by category (e.g., *Accessibility* or *SSL & DNS*) and severity (*High* / *Medium*).
   - Expand an issue card to show the **Why It Matters** callout, step-by-step checklist, and click **"Copy Snippet"** on the code block.
   - Click **"Download PDF Report"** to view the multi-page PDF output.
3. **Domain Management & History Comparison:**
   - Log in using shortcut `companydev` (or email `david.dev@apextech.com`, password `dev123`).
   - Navigate to the **Target Domains** tab.
   - Add a new domain or click **"Audit"** on an existing domain.
   - Open a scan report and use the **"Historical Scan Comparison"** dropdown to select a previous audit, highlighting the score delta (+/- points) and diff pills (*+N New Issues*, *N Resolved*).
4. **SSRF Security Demo:**
   - Attempt to add `http://localhost:5000` or `http://169.254.169.254`.
   - Verify that the SSRF firewall blocks the request with a security error.

---

## 9. Known Limitations, Constraints & Edge Cases

1. **Raw HTML Parsing vs. Client-Side SPA Rendering:**
   - The crawler fetches raw HTML via HTTP GET. If a target website is a pure Client-Side Rendered (CSR) Single Page Application with an empty `<div id="root"></div>` that relies on client JavaScript to render content, Cheerio will only analyze the initial skeleton HTML.
2. **Passive vs. Active Penetration Testing:**
   - The platform strictly conducts non-invasive passive audits. It does not perform active vulnerability exploitation (such as SQL injection injection testing, directory fuzzing, or credential brute-forcing).
3. **Windows DNS Fallback:**
   - On certain local Windows environments where port 53 loopback is not active, Node's default `dns.promises.resolve` can experience `ECONNREFUSED`. This has been resolved by configuring a custom resolver pointing to `8.8.8.8` / `1.1.1.1` with native `lookup` fallback.
4. **Crawl Depth Limitation:**
   - Full crawls are strictly capped at 25 pages to avoid memory pressure and prevent accidental denial-of-service on scanned targets.

---

## 10. Future Scope & Roadmap

1. **Headless Browser Hybrid Mode:**
   - Add optional Chromium/Playwright containerization to render heavy Single-Page Applications before DOM parsing.
2. **Scheduled Automated Audits (Cron Monitoring):**
   - Allow enterprise users to schedule automated weekly or monthly scans with email alerts triggered on score regressions.
3. **Webhook & Slack/Discord Integration:**
   - Push real-time notification alerts when new critical vulnerabilities (such as expired SSL certificates) are detected.
4. **White-Label PDF Reports:**
   - Allow enterprise managers to upload their own corporate logo and branding colors for exported PDF audit reports.
5. **CI/CD GitHub Action / CLI:**
   - Package the auditing engine into a GitHub Action or CLI tool (`vortex audit https://staging.mysite.com --fail-under=80`) to block deployments that degrade security or accessibility compliance.

---

## 11. Recommended Slide Structure for College Mid-Term PPT

- **Slide 1: Title & Overview:** CyberShield – Enterprise Cybersecurity & Automated Website Health Auditing Platform.
- **Slide 2: Problem Statement:** Fragmented web audits, compliance liabilities (WCAG, OWASP), high risk of SSRF attacks, and developer frustration with non-actionable error reports.
- **Slide 3: System Architecture:** Client Layer (React 19, Tailwind v4) ↔ REST API (Express 5, Node.js) ↔ Persistent Storage (MongoDB/Mongoose) ↔ Scanner Coordinator (SSRF Guard, Crawler, Cheerio DOM Engine, TLS/DNS Socket Inspector).
- **Slide 4: Key Innovations:**
  - 6-Pillar Weighted Health Scoring
  - SSRF Boundary Firewall (Zero-Trust Target Intake)
  - 32-Rule Deterministic Remediation Catalogue (Copy-Paste Code Snippets)
  - Automated Comparative Diff Engine (Score Deltas, Regressions vs Fixes)
- **Slide 5: Live Demonstration:** Real-time crawl monitor, interactive filterable findings, copyable snippets, and streaming executive PDF report.
- **Slide 6: Verification & Quality Assurance:** 11 comprehensive automated test suites running via `npm test` with 100% pass rate.
- **Slide 7: Limitations & Future Roadmap:** Headless Chromium rendering for SPAs, scheduled cron audits, webhook notifications, and CI/CD quality gate plugins.
