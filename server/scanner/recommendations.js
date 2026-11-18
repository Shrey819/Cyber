/**
 * Deterministic Recommendation Catalogue
 * Maps every scanner ruleId to detailed, evidence-based remediation advice,
 * configuration snippets, effort estimates, and verification steps.
 */
export const RECOMMENDATION_CATALOGUE = {
  // ==========================================
  // SECURITY FINDINGS
  // ==========================================
  'sec-missing-hsts': {
    ruleId: 'sec-missing-hsts',
    category: 'security',
    title: 'HTTP Strict Transport Security (HSTS)',
    action: 'Enable HTTP Strict Transport Security with a minimum 1-year max-age',
    whyItMatters: 'Without HSTS, attackers on the same network (e.g. public Wi-Fi) can execute man-in-the-middle SSL-stripping attacks, downgrading HTTPS connections to plaintext HTTP.',
    stepByStep: [
      '1. Verify all subdomains and endpoints support HTTPS without certificate errors.',
      '2. Add the Strict-Transport-Security header to your reverse proxy or web server configuration.',
      '3. Set max-age to at least 31536000 seconds (1 year) and includeSubDomains.',
      '4. Once verified in production, submit your domain to the Chrome HSTS Preload list.'
    ],
    codeSnippet: '# Nginx Configuration\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n\n# Apache Configuration\nHeader always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\n\n# Express.js (helmet)\napp.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));',
    effort: 'easy',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
    verificationSteps: 'Execute `curl -s -D - https://yourdomain.com -o /dev/null | grep -i strict-transport` and verify header is present.'
  },

  'sec-missing-csp': {
    ruleId: 'sec-missing-csp',
    category: 'security',
    title: 'Content Security Policy (CSP)',
    action: 'Deploy a Content-Security-Policy header restricting script execution',
    whyItMatters: 'CSP is the most effective defense against Cross-Site Scripting (XSS), malicious inline script injection, and unauthorized third-party tracking scripts.',
    stepByStep: [
      '1. Inventory all legitimate external domains your site loads scripts, styles, and fonts from.',
      '2. Start by testing in report-only mode: `Content-Security-Policy-Report-Only`.',
      '3. Review browser console reports and whitelist required origin domains.',
      '4. Enforce the policy by changing the header to `Content-Security-Policy`.'
    ],
    codeSnippet: "# Baseline Secure CSP Header\nContent-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; object-src 'none'; frame-ancestors 'none'; base-uri 'self';",
    effort: 'medium',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
    verificationSteps: 'Inspect HTTP response headers in browser DevTools Network tab or run `curl -I https://yourdomain.com | grep -i content-security-policy`.'
  },

  'sec-missing-xfo': {
    ruleId: 'sec-missing-xfo',
    category: 'security',
    title: 'Clickjacking Protection (X-Frame-Options)',
    action: 'Set X-Frame-Options to DENY or SAMEORIGIN',
    whyItMatters: 'Without frame protection, malicious websites can embed your site in a transparent <iframe> and trick authenticated users into clicking buttons or submitting unauthorized actions (Clickjacking).',
    stepByStep: [
      '1. Determine if your application needs to be framed by other pages under your domain.',
      '2. If framing is never allowed, set `X-Frame-Options: DENY`.',
      '3. If only your own origin may frame it, set `X-Frame-Options: SAMEORIGIN`.'
    ],
    codeSnippet: '# Nginx\nadd_header X-Frame-Options "SAMEORIGIN" always;\n\n# Apache\nHeader always set X-Frame-Options "SAMEORIGIN"\n\n# Express.js\nres.setHeader("X-Frame-Options", "SAMEORIGIN");',
    effort: 'easy',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options',
    verificationSteps: 'Attempt to embed `https://yourdomain.com` inside an iframe on an external site; the browser should refuse to display it.'
  },

  'sec-missing-xcto': {
    ruleId: 'sec-missing-xcto',
    category: 'security',
    title: 'MIME-Type Sniffing Protection (X-Content-Type-Options)',
    action: 'Set X-Content-Type-Options: nosniff',
    whyItMatters: 'Prevents browsers from attempting to guess (sniff) MIME types of files that differ from the declared Content-Type header, mitigating drive-by script execution via user-uploaded images or text files.',
    stepByStep: [
      '1. Ensure web server serves correct Content-Type headers for all static files (.css, .js, .svg).',
      '2. Add `X-Content-Type-Options: nosniff` header across all responses.'
    ],
    codeSnippet: '# Nginx\nadd_header X-Content-Type-Options "nosniff" always;\n\n# Express.js\napp.use((req, res, next) => { res.setHeader("X-Content-Type-Options", "nosniff"); next(); });',
    effort: 'easy',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
    verificationSteps: 'Run `curl -I https://yourdomain.com` and verify `X-Content-Type-Options: nosniff` is returned.'
  },

  'sec-missing-referrer-policy': {
    ruleId: 'sec-missing-referrer-policy',
    category: 'security',
    title: 'Referrer Information Leakage (Referrer-Policy)',
    action: 'Set Referrer-Policy to strict-origin-when-cross-origin',
    whyItMatters: 'Without a Referrer-Policy, sensitive URL tokens, search queries, or internal path hierarchies in URLs may leak to external third-party sites when users click outbound links.',
    stepByStep: [
      '1. Add the Referrer-Policy header to HTTP responses.',
      '2. Recommended value: `strict-origin-when-cross-origin`.'
    ],
    codeSnippet: '# Nginx\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\n# HTML Meta Tag fallback\n<meta name="referrer" content="strict-origin-when-cross-origin">',
    effort: 'easy',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
    verificationSteps: 'Click an outbound link and inspect the Referer header sent to the external destination; only the origin should appear.'
  },

  'sec-server-header-leak': {
    ruleId: 'sec-server-header-leak',
    category: 'security',
    title: 'Server & Technology Banner Disclosure',
    action: 'Suppress or mask the Server and X-Powered-By response headers',
    whyItMatters: 'Broadcasting exact server versions (e.g. `nginx/1.18.0`, `Express`, `PHP/8.1`) assists automated exploit scanners in identifying unpatched CVE vulnerabilities.',
    stepByStep: [
      '1. In Nginx: set `server_tokens off;`.',
      '2. In Express.js: disable with `app.disable("x-powered-by");`.',
      '3. In Apache: set `ServerTokens Prod` and `ServerSignature Off`.'
    ],
    codeSnippet: '# Nginx\nserver_tokens off;\n\n# Express.js\napp.disable("x-powered-by");',
    effort: 'easy',
    docUrl: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server',
    verificationSteps: 'Run `curl -I https://yourdomain.com` and confirm `Server` header does not reveal exact software versions and `X-Powered-By` is omitted.'
  },

  // ==========================================
  // PERFORMANCE FINDINGS
  // ==========================================
  'perf-slow-ttfb': {
    ruleId: 'perf-slow-ttfb',
    category: 'performance',
    title: 'High Server Response Latency (TTFB)',
    action: 'Optimize database queries, enable server-side caching, and utilize a CDN',
    whyItMatters: 'Time to First Byte (TTFB) directly impacts Core Web Vitals and user bounce rates. Google search ranking algorithms penalize websites with slow response times.',
    stepByStep: [
      '1. Profile slow backend endpoints and add database indexes for slow queries.',
      '2. Implement Redis or in-memory caching for repetitive database reads.',
      '3. Place your application behind a global edge CDN (e.g. Cloudflare, CloudFront) to cache static HTML and assets close to users.'
    ],
    codeSnippet: '# Nginx FastCGI / Microcache example\nfastcgi_cache_path /tmp/nginx_cache levels=1:2 keys_zone=MICROCACHE:10m inactive=60m;\nfastcgi_cache MICROCACHE;\nfastcgi_cache_valid 200 60s;',
    effort: 'medium',
    docUrl: 'https://web.dev/articles/ttfb',
    verificationSteps: 'Use Chrome DevTools Network tab or `curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\\n" https://yourdomain.com` to verify TTFB < 600ms.'
  },

  'perf-uncompressed-assets': {
    ruleId: 'perf-uncompressed-assets',
    category: 'performance',
    title: 'Uncompressed Text Transfer (Missing gzip/brotli)',
    action: 'Enable gzip or Brotli HTTP compression for text, HTML, CSS, and JS',
    whyItMatters: 'Compressing text assets reduces transferred payload size by 60% to 80%, substantially cutting initial page load times on mobile networks.',
    stepByStep: [
      '1. Enable `gzip` and `brotli` modules on your web server or CDN.',
      '2. Configure compression for MIME types: `text/html`, `text/css`, `application/javascript`, `application/json`, `image/svg+xml`.'
    ],
    codeSnippet: '# Nginx Compression Configuration\ngzip on;\ngzip_vary on;\ngzip_min_length 1024;\ngzip_types text/plain text/css text/xml application/javascript application/json image/svg+xml;',
    effort: 'easy',
    docUrl: 'https://web.dev/articles/optimizing-content-efficiency-compression',
    verificationSteps: 'Run `curl -H "Accept-Encoding: gzip, br" -I https://yourdomain.com` and verify `Content-Encoding: gzip` or `Content-Encoding: br` is returned.'
  },

  // ==========================================
  // TECHNICAL SEO FINDINGS
  // ==========================================
  'seo-missing-title': {
    ruleId: 'seo-missing-title',
    category: 'seo',
    title: 'Missing Document Title Element (<title>)',
    action: 'Add a concise, descriptive <title> tag between 50 and 60 characters',
    whyItMatters: 'The `<title>` tag is the most prominent headline displayed in search engine results and social media shares. Pages without titles suffer significant SEO penalties.',
    stepByStep: [
      '1. Ensure every page has a unique `<title>` within the `<head>` element.',
      '2. Include your primary keyword followed by brand name.'
    ],
    codeSnippet: '<head>\n  <title>Cybersecurity SaaS Platform | Vortex Defense</title>\n</head>',
    effort: 'easy',
    docUrl: 'https://developers.google.com/search/docs/appearance/title-link',
    verificationSteps: 'View page source and verify `<title>` tag exists with descriptive text.'
  },

  'seo-missing-description': {
    ruleId: 'seo-missing-description',
    category: 'seo',
    title: 'Missing Meta Description',
    action: 'Add a compelling meta description tag between 120 and 160 characters',
    whyItMatters: 'Meta descriptions provide search engines with a summary snippet for search results, directly impacting organic click-through rates (CTR).',
    stepByStep: [
      '1. Add a `<meta name="description" content="...">` tag to the `<head>` of the page.',
      '2. Write an informative 1-2 sentence summary containing primary target keywords.'
    ],
    codeSnippet: '<meta name="description" content="Automated website auditing, passive security checks, mobile responsiveness, and SEO health scanner for modern web applications.">',
    effort: 'easy',
    docUrl: 'https://developers.google.com/search/docs/appearance/snippets',
    verificationSteps: 'Inspect `<head>` tag in HTML source and verify meta description is populated.'
  },

  // ==========================================
  // ACCESSIBILITY FINDINGS
  // ==========================================
  'a11y-missing-html-lang': {
    ruleId: 'a11y-missing-html-lang',
    category: 'accessibility',
    title: 'Missing Document Language (<html lang>)',
    action: 'Specify the primary document language via <html lang="en">',
    whyItMatters: 'Screen readers use the lang attribute to load the correct speech synthesizer voice and pronunciation dictionary.',
    stepByStep: [
      '1. Open root HTML layout file.',
      '2. Add the appropriate IETF language tag (e.g. `en`, `es`, `de`, `fr`) to the `<html>` tag.'
    ],
    codeSnippet: '<html lang="en">',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
    verificationSteps: 'Inspect `document.documentElement.lang` in browser console; should return valid language code.'
  },

  'a11y-missing-image-alt': {
    ruleId: 'a11y-missing-image-alt',
    category: 'accessibility',
    title: 'Images Missing Meaningful Alternative Text',
    action: 'Provide descriptive alt attributes on all informative images',
    whyItMatters: 'Vision-impaired users rely on screen readers to vocalize image alt text. Empty or missing alt text leaves non-sighted users unaware of page graphics.',
    stepByStep: [
      '1. For informative images (charts, diagrams, photos): write concise text describing the image content.',
      '2. For purely decorative graphics: set `alt=""` or `aria-hidden="true"` so screen readers ignore them.'
    ],
    codeSnippet: '<!-- Informative Image -->\n<img src="quarterly-growth.png" alt="Bar chart showing 34% increase in user acquisition during Q3" />\n\n<!-- Purely Decorative Graphic -->\n<img src="divider-wave.svg" alt="" aria-hidden="true" />',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/tutorials/images/',
    verificationSteps: 'Run an accessibility checker or test page using Chrome Lighthouse / Screen Reader.'
  },

  'a11y-missing-form-labels': {
    ruleId: 'a11y-missing-form-labels',
    category: 'accessibility',
    title: 'Form Inputs Missing Accessible Labels',
    action: 'Pair every input element with a visible <label for="..."> or aria-label',
    whyItMatters: 'Placeholder text is temporary and often disappears on focus. Screen reader users need explicit labels to understand what input is expected.',
    stepByStep: [
      '1. Assign an `id` to each `<input>`, `<select>`, and `<textarea>`.',
      '2. Create a `<label for="inputId">` element with descriptive label text.',
      '3. For icon-only search bars, use `aria-label="Search"`. '
    ],
    codeSnippet: '<label for="company-email">Corporate Email Address</label>\n<input type="email" id="company-email" name="email" required />',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/',
    verificationSteps: 'Click the label text with your mouse; the corresponding input should automatically receive focus.'
  },

  'a11y-empty-interactive-names': {
    ruleId: 'a11y-empty-interactive-names',
    category: 'accessibility',
    title: 'Buttons or Links Lacking Accessible Names',
    action: 'Add descriptive text or aria-label to icon buttons and links',
    whyItMatters: 'Buttons with only an SVG or icon are announced as "button" with no purpose to screen readers.',
    stepByStep: [
      '1. Locate icon-only `<button>` and `<a>` elements.',
      '2. Add an `aria-label` attribute describing the exact action (e.g. `aria-label="Close dialog"`).'
    ],
    codeSnippet: '<button type="button" aria-label="Close dialog">\n  <svg ... />\n</button>',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
    verificationSteps: 'Check element in Chrome DevTools Accessibility tree; verify "Accessible Name" is displayed.'
  },

  'a11y-skipped-heading-level': {
    ruleId: 'a11y-skipped-heading-level',
    category: 'accessibility',
    title: 'Skipped Heading Levels in Document Hierarchy',
    action: 'Structure heading tags sequentially without skipping levels',
    whyItMatters: 'Screen reader users navigate via heading shortcuts (e.g. jumping between H2s). Skipping from H1 directly to H3 breaks cognitive page structure.',
    stepByStep: [
      '1. Review heading order across the page: H1 -> H2 -> H3.',
      '2. Do not choose heading tags for visual styling; use CSS classes for font size instead.'
    ],
    codeSnippet: '<!-- Correct hierarchy -->\n<h1>Product Catalog</h1>\n  <h2>Enterprise Solutions</h2>\n    <h3>Cloud Infrastructure</h3>',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
    verificationSteps: 'Inspect headings using heading outline extensions or DevTools.'
  },

  'a11y-duplicate-id': {
    ruleId: 'a11y-duplicate-id',
    category: 'accessibility',
    title: 'Duplicate Element IDs Detected',
    action: 'Ensure all HTML id attributes are globally unique within the document',
    whyItMatters: 'Duplicate IDs break `<label for="id">` bindings, `aria-labelledby`, and JavaScript `document.getElementById` calls.',
    stepByStep: [
      '1. Search template components for hardcoded `id` values in looped lists.',
      '2. Append unique indexes or UUIDs to dynamically generated elements.'
    ],
    codeSnippet: '// React component example\n{items.map((item, idx) => (\n  <div key={item.id} id={`item-${item.id}`}>\n    ...\n  </div>\n))}',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/general/G108',
    verificationSteps: 'Execute `document.querySelectorAll("#" + duplicateId).length` in console; result must be 1.'
  },

  // ==========================================
  // MOBILE VIEWPORT FINDINGS
  // ==========================================
  'a11y-missing-h1': {
    ruleId: 'a11y-missing-h1',
    category: 'accessibility',
    title: 'Missing Top-Level Heading (<h1>)',
    action: 'Provide a single descriptive <h1> element on every page',
    whyItMatters: 'The <h1> heading communicates the primary subject of the page to screen reader users and search engines.',
    stepByStep: [
      '1. Ensure each page has exactly one <h1> heading near the top of main content.',
      '2. Make the text match or relate directly to the document <title>.'
    ],
    codeSnippet: '<h1>Welcome to Vortex Platform</h1>',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
    verificationSteps: 'Run `document.querySelectorAll("h1").length` in DevTools; should return 1.'
  },

  'a11y-positive-tabindex': {
    ruleId: 'a11y-positive-tabindex',
    category: 'accessibility',
    title: 'Disruptive Positive tabindex Attribute',
    action: 'Replace positive tabindex values (> 0) with tabindex="0" or tabindex="-1"',
    whyItMatters: 'Positive tabindex disrupts natural document tab order, confusing keyboard navigation users.',
    stepByStep: [
      '1. Remove tabindex="1", tabindex="2", etc.',
      '2. Allow DOM source order to govern tab sequence.'
    ],
    codeSnippet: '<button tabindex="0">Interactive Button</button>',
    effort: 'easy',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex',
    verificationSteps: 'Search HTML source for `tabindex="[1-9]"` and confirm none remain.'
  },

  'a11y-viewport-zoom-disabled': {
    ruleId: 'a11y-viewport-zoom-disabled',
    category: 'accessibility',
    title: 'Viewport Pinch-to-Zoom Disabled',
    action: 'Allow user zooming by removing user-scalable=no or maximum-scale=1',
    whyItMatters: 'Disabling zoom prevents visually impaired users from enlarging text and controls on mobile devices, violating WCAG 1.4.4.',
    stepByStep: [
      '1. Locate <meta name="viewport">.',
      '2. Remove user-scalable=no and ensure maximum-scale is at least 2.0 or omitted.'
    ],
    codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    effort: 'easy',
    docUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html',
    verificationSteps: 'Inspect viewport meta tag in head.'
  },

  'mobile-missing-viewport': {
    ruleId: 'mobile-missing-viewport',
    category: 'mobile',
    title: 'Missing Viewport Meta Tag',
    action: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>',
    whyItMatters: 'Mobile devices default to desktop viewport widths (~980px) and scale down content, making text illegible and interactive links too small to tap.',
    stepByStep: [
      '1. Locate your main HTML template or `index.html`.',
      '2. Add the responsive viewport meta tag inside the `<head>`.'
    ],
    codeSnippet: '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n</head>',
    effort: 'easy',
    docUrl: 'https://web.dev/responsive-web-design-basics/#viewport',
    verificationSteps: 'Open site in Chrome DevTools Device Mode (Toggle Device Toolbar); page should render at 1:1 scale.'
  },

  'mobile-fixed-width-overflow': {
    ruleId: 'mobile-fixed-width-overflow',
    category: 'mobile',
    title: 'Elements With Fixed Widths Exceeding Mobile Screen',
    action: 'Replace hardcoded pixel widths with fluid CSS max-width and percentage widths',
    whyItMatters: 'Fixed widths > 390px break out of mobile screen boundaries, creating unwanted horizontal scrolling and cut-off content.',
    stepByStep: [
      '1. Inspect flagged elements in the audit report.',
      '2. Change fixed `width: 1000px` to `width: 100%; max-width: 1000px;`.'
    ],
    codeSnippet: '/* CSS */\n.container {\n  width: 100%;\n  max-width: 1200px;\n  box-sizing: border-box;\n  padding: 0 1rem;\n}',
    effort: 'medium',
    docUrl: 'https://web.dev/articles/responsive-web-design-basics',
    verificationSteps: 'Simulate mobile viewport (390px) in browser and verify no horizontal scrollbar appears.'
  },

  'mobile-non-responsive-images': {
    ruleId: 'mobile-non-responsive-images',
    category: 'mobile',
    title: 'Images Lacking Fluid Responsive Sizing',
    action: 'Add max-width: 100% and height: auto to global image CSS',
    whyItMatters: 'Oversized images with hardcoded width attributes push past the viewport width on mobile screens.',
    stepByStep: [
      '1. Add global responsive reset in your CSS stylesheet.',
      '2. Ensure parent containers have `box-sizing: border-box`.'
    ],
    codeSnippet: '/* Global CSS reset */\nimg, picture, video, canvas, svg {\n  display: block;\n  max-width: 100%;\n  height: auto;\n}',
    effort: 'easy',
    docUrl: 'https://web.dev/learn/design/responsive-images/',
    verificationSteps: 'View image on a mobile screen width; image should scale down without extending outside viewport.'
  },

  'mobile-malformed-viewport': {
    ruleId: 'mobile-malformed-viewport',
    category: 'mobile',
    title: 'Suboptimal Viewport Meta Configuration',
    action: 'Configure standard responsive viewport parameters',
    whyItMatters: 'Missing width=device-width or initial-scale=1 causes mobile browsers to render in desktop emulation or letterbox mode.',
    stepByStep: [
      '1. Update <meta name="viewport">.',
      '2. Set `content="width=device-width, initial-scale=1"`.'
    ],
    codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    effort: 'easy',
    docUrl: 'https://web.dev/responsive-web-design-basics/#viewport',
    verificationSteps: 'Inspect viewport tag in HTML source.'
  },

  'mobile-zoom-restricted': {
    ruleId: 'mobile-zoom-restricted',
    category: 'mobile',
    title: 'Mobile Pinch-to-Zoom Disabled in Viewport',
    action: 'Remove user-scalable=no from viewport meta tag',
    whyItMatters: 'Touch screen users must be able to pinch-to-zoom to enlarge text and buttons.',
    stepByStep: [
      '1. Edit <meta name="viewport"> content.',
      '2. Remove `user-scalable=no` or `maximum-scale=1`.'
    ],
    codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    effort: 'easy',
    docUrl: 'https://web.dev/responsive-web-design-basics/#viewport',
    verificationSteps: 'Verify pinch-to-zoom functions in mobile browser.'
  },

  'mobile-unwrapped-tables': {
    ruleId: 'mobile-unwrapped-tables',
    category: 'mobile',
    title: 'Data Tables Lacking Responsive Overflow Wrapper',
    action: 'Wrap tabular data in an overflow-x: auto container',
    whyItMatters: 'HTML tables cannot naturally shrink below their column contents, causing horizontal page blowout on mobile screens.',
    stepByStep: [
      '1. Wrap <table> elements inside a `<div class="table-container">`.',
      '2. Apply `overflow-x: auto; -webkit-overflow-scrolling: touch;`.'
    ],
    codeSnippet: '/* CSS */\n.table-wrapper {\n  width: 100%;\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n}',
    effort: 'easy',
    docUrl: 'https://css-tricks.com/responsive-data-tables/',
    verificationSteps: 'View page on 390px mobile viewport; table scrolls horizontally within container without expanding page width.'
  },

  'mobile-tiny-font-size': {
    ruleId: 'mobile-tiny-font-size',
    category: 'mobile',
    title: 'Legibility Issue: Font Size Below 12px',
    action: 'Set minimum body and paragraph font size to at least 14px-16px',
    whyItMatters: 'Tiny fonts (< 12px) force mobile users to strain or zoom in to read content.',
    stepByStep: [
      '1. Inspect elements flagged with tiny font sizes.',
      '2. Update CSS font-size property to a minimum of 0.875rem (14px) or 1rem (16px).'
    ],
    codeSnippet: 'body {\n  font-size: 16px;\n  line-height: 1.5;\n}',
    effort: 'easy',
    docUrl: 'https://web.dev/accessible-tap-targets/',
    verificationSteps: 'Inspect computed font-size in Chrome DevTools Elements panel.'
  },

  // ==========================================
  // SSL & DNS FINDINGS
  // ==========================================
  'ssl-cert-expired': {
    ruleId: 'ssl-cert-expired',
    category: 'ssl_dns',
    title: 'SSL/TLS Certificate Has Expired',
    action: 'Renew and install an active SSL/TLS certificate immediately',
    whyItMatters: 'Web browsers immediately display full-screen warning barriers ("Your connection is not private") preventing visitors from accessing the website.',
    stepByStep: [
      '1. Log into your certificate authority (Let\'s Encrypt, Cloudflare, DigiCert) or web host.',
      '2. Issue and bind a new SSL certificate to port 443.',
      '3. Set up automated renewal via Certbot or ACME daemon.'
    ],
    codeSnippet: '# Automated Certbot renewal\nsudo certbot renew --dry-run',
    effort: 'easy',
    docUrl: 'https://letsencrypt.org/docs/',
    verificationSteps: 'Visit `https://yourdomain.com` in a browser and verify padlock icon is secure with future expiration.'
  },

  'ssl-cert-expiring-soon': {
    ruleId: 'ssl-cert-expiring-soon',
    category: 'ssl_dns',
    title: 'SSL/TLS Certificate Expiring Soon (< 30 Days)',
    action: 'Renew SSL certificate before expiration',
    whyItMatters: 'Certificates that expire cause immediate site-wide outages and scary browser warning pages.',
    stepByStep: [
      '1. Trigger SSL renewal with your host or Let\'s Encrypt.',
      '2. Ensure automated cron or ACME renewal is active.'
    ],
    codeSnippet: 'sudo certbot renew',
    effort: 'easy',
    docUrl: 'https://letsencrypt.org/docs/',
    verificationSteps: 'Check certificate valid days remaining via `openssl s_client -connect yourdomain.com:443 -servername yourdomain.com`.'
  },

  'ssl-hostname-mismatch': {
    ruleId: 'ssl-hostname-mismatch',
    category: 'ssl_dns',
    title: 'SSL Certificate Subject Alternative Name (SAN) Mismatch',
    action: 'Reissue SSL certificate including all active domain names and subdomains',
    whyItMatters: 'Browsers reject TLS connections where the connected hostname does not match the CN or SAN entries on the certificate.',
    stepByStep: [
      '1. Identify all hostnames visitors use (e.g. `domain.com` and `www.domain.com`).',
      '2. Reissue certificate with multi-domain SAN coverage or wildcard `*.domain.com`.'
    ],
    codeSnippet: 'sudo certbot certonly -d yourdomain.com -d www.yourdomain.com',
    effort: 'medium',
    docUrl: 'https://letsencrypt.org/docs/challenge-types/',
    verificationSteps: 'Verify connection using `curl -Iv https://yourdomain.com` without SSL hostname mismatch warnings.'
  },

  'ssl-missing-https-redirect': {
    ruleId: 'ssl-missing-https-redirect',
    category: 'ssl_dns',
    title: 'Missing Automatic HTTP-to-HTTPS Redirection',
    action: 'Configure a 301 Permanent Redirect from port 80 (HTTP) to port 443 (HTTPS)',
    whyItMatters: 'Visitors typing `example.com` without `https://` default to unencrypted HTTP, exposing sensitive login tokens and session cookies to network eavesdropping.',
    stepByStep: [
      '1. Open web server configuration file (Nginx, Apache, or Cloudflare Page Rules).',
      '2. Route all incoming traffic on port 80 to HTTPS with HTTP status 301.'
    ],
    codeSnippet: '# Nginx Configuration\nserver {\n  listen 80;\n  listen [::]:80;\n  server_name yourdomain.com www.yourdomain.com;\n  return 301 https://$host$request_uri;\n}',
    effort: 'easy',
    docUrl: 'https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/',
    verificationSteps: 'Run `curl -I http://yourdomain.com` and verify response is `HTTP/1.1 301 Moved Permanently` with `Location: https://...`.'
  },

  'dns-missing-spf': {
    ruleId: 'dns-missing-spf',
    category: 'ssl_dns',
    title: 'Missing SPF Email Authentication Record',
    action: 'Publish a TXT record defining authorized email sending servers (v=spf1)',
    whyItMatters: 'Without SPF, spammers can forge emails pretending to come from your domain, harming domain reputation and causing legitimate emails to be sent to spam.',
    stepByStep: [
      '1. Identify all servers and services that legitimately send email for your domain (e.g. Google Workspace, SendGrid, Microsoft 365).',
      '2. Add a DNS TXT record at `@` with the appropriate SPF inclusions.'
    ],
    codeSnippet: '# Google Workspace SPF\nv=spf1 include:_spf.google.com ~all\n\n# Generic mail server\nv=spf1 mx ~all',
    effort: 'easy',
    docUrl: 'https://support.google.com/a/answer/33786',
    verificationSteps: 'Run `dig TXT yourdomain.com +short` or `nslookup -type=TXT yourdomain.com` and verify `v=spf1` record appears.'
  },

  'dns-missing-dmarc': {
    ruleId: 'dns-missing-dmarc',
    category: 'ssl_dns',
    title: 'Missing DMARC Email Anti-Spoofing Policy',
    action: 'Publish a DMARC TXT record at _dmarc.yourdomain.com',
    whyItMatters: 'DMARC ties SPF and DKIM together to instruct receiving email servers how to handle spoofed emails (none, quarantine, or reject).',
    stepByStep: [
      '1. Ensure SPF and DKIM are configured for your sending servers.',
      '2. Add a DNS TXT record at host `_dmarc.yourdomain.com`.',
      '3. Start with `p=none` (monitoring mode) and review reports before moving to `p=quarantine` or `p=reject`.'
    ],
    codeSnippet: '# Host: _dmarc.yourdomain.com\nv=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com; aspf=r;',
    effort: 'easy',
    docUrl: 'https://dmarc.org/overview/',
    verificationSteps: 'Run `dig TXT _dmarc.yourdomain.com +short` and verify DMARC record is returned.'
  }
};

/**
 * Enriches an audit finding with complete recommendation catalogue metadata.
 * @param {Object} finding
 * @returns {Object} Enriched finding
 */
export function enrichFindingWithRecommendation(finding) {
  const catalogueEntry = RECOMMENDATION_CATALOGUE[finding.rule_id];
  if (catalogueEntry) {
    return {
      ...finding,
      recommendation: {
        action: catalogueEntry.action,
        whyItMatters: catalogueEntry.whyItMatters,
        stepByStep: catalogueEntry.stepByStep,
        codeSnippet: catalogueEntry.codeSnippet,
        effort: catalogueEntry.effort,
        docUrl: catalogueEntry.docUrl,
        verificationSteps: catalogueEntry.verificationSteps
      }
    };
  }

  // Fallback for custom or dynamic rules
  return {
    ...finding,
    recommendation: {
      action: finding.recommendation?.action || 'Review and address this finding according to security best practices.',
      whyItMatters: finding.recommendation?.whyItMatters || finding.description,
      stepByStep: finding.recommendation?.stepByStep || [],
      codeSnippet: finding.recommendation?.codeSnippet || '',
      effort: finding.recommendation?.effort || 'medium',
      docUrl: finding.recommendation?.docUrl || '',
      verificationSteps: finding.recommendation?.verificationSteps || ''
    }
  };
}

/**
 * Aggregates and consolidates raw page-level findings by rule_id across multi-page crawls.
 * Merges affected URLs, aggregates evidence, ensures deterministic recommendation enrichment,
 * and eliminates duplicate finding cards.
 * 
 * @param {Array<Object>} rawFindings
 * @param {string} scanId
 * @param {string} [domainId]
 * @returns {Array<Object>} Consolidated and enriched findings
 */
export function consolidateFindings(rawFindings, scanId, domainId) {
  if (!Array.isArray(rawFindings) || rawFindings.length === 0) return [];

  const grouped = new Map();

  for (const raw of rawFindings) {
    if (!raw || !raw.rule_id) continue;
    const key = raw.rule_id;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(raw);
  }

  const consolidated = [];

  for (const [ruleId, list] of grouped.entries()) {
    const failures = list.filter(f => f.status === 'failed');
    const isFailed = failures.length > 0;
    const representative = isFailed ? failures[0] : list[0];
    const sourceList = isFailed ? failures : list;

    // Aggregate unique affected URLs
    const urlSet = new Set();
    for (const item of sourceList) {
      if (Array.isArray(item.affected_urls)) {
        item.affected_urls.forEach(u => u && urlSet.add(u));
      } else if (item.affected_urls) {
        urlSet.add(item.affected_urls);
      }
    }
    const affectedUrls = Array.from(urlSet);

    // Merge evidence safely
    const mergedEvidence = { ...(representative.evidence || {}) };
    if (sourceList.length > 1) {
      mergedEvidence.affectedPagesCount = affectedUrls.length;

      const combinedElements = [];
      for (const item of sourceList) {
        const ev = item.evidence;
        if (!ev) continue;
        if (Array.isArray(ev.elements)) combinedElements.push(...ev.elements);
        else if (Array.isArray(ev.violations)) combinedElements.push(...ev.violations);
      }
      if (combinedElements.length > 0) {
        mergedEvidence.sampleViolations = combinedElements.slice(0, 25);
        mergedEvidence.totalViolations = combinedElements.length;
      }
    }

    // Informative description for multi-page occurrences
    let description = representative.description;
    if (isFailed && affectedUrls.length > 1) {
      description = `${representative.title} was detected across ${affectedUrls.length} audited page(s).`;
    }

    const finding = {
      id: representative.id || `fnd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      scan_id: scanId,
      domain_id: domainId || null,
      rule_id: ruleId,
      category: representative.category,
      title: representative.title,
      description,
      status: isFailed ? 'failed' : representative.status,
      severity: representative.severity,
      confidence: representative.confidence || 1.0,
      affected_urls: affectedUrls,
      evidence: mergedEvidence,
      recommendation: representative.recommendation || {}
    };

    consolidated.push(enrichFindingWithRecommendation(finding));
  }

  return consolidated;
}

export default {
  RECOMMENDATION_CATALOGUE,
  enrichFindingWithRecommendation,
  consolidateFindings
};
