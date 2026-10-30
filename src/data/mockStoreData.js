// Store and Order Initial Mock Data in INR (Indian Rupee)

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const INITIAL_CATEGORIES = [
  {
    id: 'cat-vapt',
    name: 'Vulnerability Assessment & Penetration Testing (VAPT)',
    slug: 'vapt',
    description: 'Offensive security assessments, automated web application scanners, and deep API vulnerability discovery.',
    iconName: 'Terminal',
    isActive: true,
    itemCount: 4
  },
  {
    id: 'cat-cspm',
    name: 'Cloud Security Posture (CSPM & CI/CD)',
    slug: 'cloud-security',
    description: 'Infrastructure-as-code security linting, multi-cloud IAM audits, and container image shielding.',
    iconName: 'Cloud',
    isActive: true,
    itemCount: 3
  },
  {
    id: 'cat-siem',
    name: 'Continuous 24/7 SOC & MDR Telemetry',
    slug: 'monitoring-soc',
    description: 'Continuous endpoint threat hunting, Indian CERT-In compliant logging, and real-time intrusion defense.',
    iconName: 'Activity',
    isActive: true,
    itemCount: 3
  },
  {
    id: 'cat-compliance',
    name: 'Compliance & Audit Readiness (ISO / SOC 2 / RBI)',
    slug: 'compliance-audit',
    description: 'ISO 27001, SOC 2 Type II, DPDP Act 2023, and RBI cybersecurity framework audit preparation.',
    iconName: 'FileCheck',
    isActive: true,
    itemCount: 2
  },
  {
    id: 'cat-awareness',
    name: 'Workforce Phishing Defense & Security Academy',
    slug: 'workforce-training',
    description: 'Simulated adversary phishing campaigns, QR code scams, and employee cyber hygiene certifications.',
    iconName: 'ShieldAlert',
    isActive: true,
    itemCount: 2
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-web-scan',
    categoryId: 'cat-vapt',
    categoryName: 'VAPT',
    name: 'Vortex Web Application & API Shield',
    tagline: 'Automated DAST & continuous API vulnerability scanner',
    description: 'Deep automated scanning for OWASP Top 10 vulnerabilities, broken object authorization, secret leaks, and SQLi on web apps and REST/GraphQL APIs.',
    price: 2499,
    billingCycle: 'Monthly',
    badge: 'Popular',
    maxSeats: 10,
    assetsIncluded: 15,
    features: [
      'Automated weekly vulnerability & port scans',
      'OWASP Top 10 + API Top 10 automated test suites',
      'Assigned developer vulnerability triage board',
      'Detailed PDF remediation reports for compliance',
      'Up to 10 team seats (Developers & SecOps)'
    ],
    featureKey: 'module_vapt_scanner',
    isHidden: false
  },
  {
    id: 'prod-red-team',
    categoryId: 'cat-vapt',
    categoryName: 'VAPT',
    name: 'Full-Scope Red Team Adversary Simulation',
    tagline: 'Simulated cyberattack by certified Indian ethical hackers',
    description: 'Comprehensive physical, digital, and social engineering red team assessment replicating nation-state threat tactics with executive remediation debrief.',
    price: 4999,
    billingCycle: 'One-Time Project',
    badge: 'Enterprise',
    maxSeats: 25,
    assetsIncluded: 50,
    features: [
      'Nation-state APT adversary simulation',
      'Custom spear-phishing & MFA fatigue tests',
      'External + Internal network lateral pivoting',
      'Live zero-day remediation workshop for developers',
      'Executive board presentation & compliance sign-off'
    ],
    featureKey: 'module_red_team',
    isHidden: false
  },
  {
    id: 'prod-cloud-guard',
    categoryId: 'cat-cspm',
    categoryName: 'Cloud Security',
    name: 'Cloud Armor & Kubernetes DevSecOps',
    tagline: 'Real-time multi-cloud IAM, posture, and container defense',
    description: 'Connect AWS, GCP, and Azure accounts to continuously detect misconfigurations, open S3 buckets, exposed secrets, and unpatched Kubernetes pods.',
    price: 3499,
    billingCycle: 'Monthly',
    badge: 'High Value',
    maxSeats: 15,
    assetsIncluded: 30,
    features: [
      'Multi-cloud CSPM for AWS, Azure, and Google Cloud',
      'CI/CD pipeline automated secret & container image gates',
      'Kubernetes cluster runtime security & policy drift alerts',
      'Automated least-privilege IAM suggestions',
      'Direct Slack, Jira, and GitHub integrations'
    ],
    featureKey: 'module_cloud_posture',
    isHidden: false
  },
  {
    id: 'prod-247-soc',
    categoryId: 'cat-siem',
    categoryName: 'Continuous Monitoring',
    name: '24/7 Managed SOC & MDR Response Unit',
    tagline: 'Elite analysts backed by autonomous sub-50ms containment',
    description: 'Enterprise 24/7 Security Operations Center monitoring all endpoints, cloud logs, and identity providers with guaranteed 15-minute SLA on active threats.',
    price: 4499,
    billingCycle: 'Monthly',
    badge: 'Critical Defense',
    maxSeats: 50,
    assetsIncluded: 100,
    features: [
      '24/7/365 active eyes-on-glass threat hunting',
      'Automated endpoint micro-isolation upon breach detection',
      'CERT-In 6-hour incident reporting readiness',
      'Dedicated Slack incident war-room channel with CISSP leads',
      'Up to 50 team member seats with customized alerting'
    ],
    featureKey: 'module_soc_monitoring',
    isHidden: false
  },
  {
    id: 'prod-compliance-hub',
    categoryId: 'cat-compliance',
    categoryName: 'Compliance & Audit',
    name: 'Automated ISO 27001 & DPDP Audit Readiness',
    tagline: 'Continuous evidence gathering and audit checklist engine',
    description: 'Turn months of manual spreadsheet audit prep into automated evidence collection. Generates auditor-ready packets for ISO 27001, SOC 2, and India DPDP Act 2023.',
    price: 1999,
    billingCycle: 'Monthly',
    badge: 'Audit Ready',
    maxSeats: 15,
    assetsIncluded: 20,
    features: [
      'Continuous compliance telemetry against ISO 27001 & DPDP',
      'Pre-built security policy templates and employee sign-offs',
      'Auditor collaboration portal with read-only evidence access',
      'Vendor risk assessments and third-party questionnaires',
      'Readiness gap analysis and scoring dashboard'
    ],
    featureKey: 'module_compliance',
    isHidden: false
  },
  {
    id: 'prod-phish-trainer',
    categoryId: 'cat-awareness',
    categoryName: 'Workforce Awareness',
    name: 'Enterprise Phishing Defense & Employee Academy',
    tagline: 'Simulated spear-phishing with automated micro-trainings',
    description: 'Train your workforce to detect modern AI spear-phishing, UPI/QR code scams, and invoice fraud with tailored weekly simulations.',
    price: 1299,
    billingCycle: 'Monthly',
    badge: 'Employee Security',
    maxSeats: 100,
    assetsIncluded: 5,
    features: [
      'Automated weekly adaptive phishing simulations',
      '1-click Outlook & Gmail threat report button',
      'High-risk employee identification scorecards',
      'Bite-sized 2-minute video micro-trainings',
      'Compliance certification tracking for HR & SecOps'
    ],
    featureKey: 'module_employee_training',
    isHidden: false
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-2026-9401',
    companyId: 'comp-apex',
    companyName: 'Apex CyberTech India Pvt Ltd',
    registrationNumber: '27AABCA1234F1Z5',
    customerManagerName: 'Marcus Vance',
    customerManagerEmail: 'marcus.mgr@apextech.com',
    billingAddress: 'Tower 4, Cyber City, Magarpatta, Pune, Maharashtra',
    pinCode: '411028',
    country: 'India',
    paymentMethod: 'Online',
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    createdAt: '2026-10-24 14:32:00',
    totalAmount: 2499,
    items: [
      {
        productId: 'prod-web-scan',
        name: 'Vortex Web Application & API Shield',
        price: 2499,
        quantity: 1,
        billingCycle: 'Monthly'
      }
    ]
  },
  {
    id: 'ORD-2026-8924',
    companyId: 'comp-nexus',
    companyName: 'Nexus FinSecure India Ltd',
    registrationNumber: '29AABCN5678G2Z1',
    customerManagerName: 'Elena Rostova',
    customerManagerEmail: 'elena.rostova@nexusfin.com',
    billingAddress: 'Prestige Tech Park, Marathahalli-Sarjapur Ring Rd, Bengaluru, Karnataka',
    pinCode: '560103',
    country: 'India',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    createdAt: '2026-10-22 09:15:00',
    totalAmount: 4499,
    items: [
      {
        productId: 'prod-247-soc',
        name: '24/7 Managed SOC & MDR Response Unit',
        price: 4499,
        quantity: 1,
        billingCycle: 'Monthly'
      }
    ]
  },
  {
    id: 'ORD-2026-7810',
    companyId: 'comp-quantum',
    companyName: 'Quantum Dynamics AI Technologies',
    registrationNumber: '27AAECQ9910H3Z8',
    customerManagerName: 'Dev Patel',
    customerManagerEmail: 'dev.patel@quantumai.io',
    billingAddress: 'Plot 42, Cyber Gateway, BKC Bandra East, Mumbai, Maharashtra',
    pinCode: '400051',
    country: 'India',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
    createdAt: '2026-10-27 16:45:00',
    totalAmount: 3499,
    items: [
      {
        productId: 'prod-cloud-guard',
        name: 'Cloud Armor & Kubernetes DevSecOps',
        price: 3499,
        quantity: 1,
        billingCycle: 'Monthly'
      }
    ]
  }
];
