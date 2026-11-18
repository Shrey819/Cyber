import { URL } from 'url';
import { normalizeTargetUrl, validateSafeHostDns } from './urlValidator.js';

const USER_AGENT = 'VortexAuditBot/1.0 (+https://vortex.internal/bot; website health scanner)';
const MAX_FULL_PAGES = 25;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5 MB
const FETCH_TIMEOUT_MS = 10000;

// Common non-HTML static asset extensions to ignore during crawling
const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.css', '.js', '.map', '.json', '.xml', '.txt',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.mp3', '.mp4', '.avi', '.mov', '.webm', '.ogg',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'
]);

/**
 * Normalizes a URL for deduplication.
 * @param {string} rawUrl
 * @param {string} baseUrl
 * @returns {string|null}
 */
export function normalizeCrawlUrl(rawUrl, baseUrl) {
  try {
    const parsed = new URL(rawUrl, baseUrl);
    // Ignore non-http(s) protocols (mailto, tel, javascript)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;

    // Remove hash/fragment
    parsed.hash = '';

    // Remove standard tracking query params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach(p => parsed.searchParams.delete(p));

    // Normalize path trailing slash
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;

    // Check extension
    const extIndex = pathname.lastIndexOf('.');
    if (extIndex !== -1) {
      const ext = pathname.slice(extIndex).toLowerCase();
      if (IGNORED_EXTENSIONS.has(ext)) return null;
    }

    return parsed.href;
  } catch (e) {
    return null;
  }
}

/**
 * Parses simple robots.txt file to determine disallowed path prefixes.
 * @param {string} robotsTxt
 * @returns {string[]} Disallowed path prefixes
 */
export function parseRobotsTxt(robotsTxt) {
  if (!robotsTxt || typeof robotsTxt !== 'string') return [];
  const lines = robotsTxt.split(/\r?\n/);
  const disallowed = [];
  let isTargetAgent = false;

  for (const rawLine of lines) {
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;

    const [directive, ...valParts] = line.split(':');
    if (!directive || valParts.length === 0) continue;

    const key = directive.trim().toLowerCase();
    const value = valParts.join(':').trim();

    if (key === 'user-agent') {
      const agent = value.toLowerCase();
      isTargetAgent = (agent === '*' || agent.includes('vortex') || agent.includes('bot'));
    } else if (isTargetAgent && key === 'disallow') {
      if (value) {
        disallowed.push(value);
      }
    }
  }

  return disallowed;
}

/**
 * Fetches robots.txt from target origin.
 * @param {string} origin
 * @returns {Promise<string[]>}
 */
async function fetchRobotsDisallowed(origin) {
  try {
    const robotsUrl = `${origin}/robots.txt`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(robotsUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT }
    });
    clearTimeout(timer);

    if (res.ok) {
      const text = await res.text();
      return parseRobotsTxt(text);
    }
  } catch (e) {
    // robots.txt missing or timed out is non-fatal; proceed with crawl
  }
  return [];
}

/**
 * Extracts in-scope same-origin links from HTML body.
 * @param {string} html
 * @param {string} baseUrl
 * @param {string} origin
 * @returns {string[]}
 */
export function extractLinks(html, baseUrl, origin) {
  if (!html) return [];
  const links = new Set();
  const linkRegex = /<a\s+[^>]*?href=["']([^"']+)["'][^>]*?>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

    const normalized = normalizeCrawlUrl(href, baseUrl);
    if (normalized) {
      try {
        const linkOrigin = new URL(normalized).origin;
        if (linkOrigin === origin) {
          links.add(normalized);
        }
      } catch (e) {}
    }
  }

  return Array.from(links);
}

/**
 * Extracts <title> text from HTML body.
 * @param {string} html
 * @returns {string}
 */
export function extractTitle(html) {
  if (!html) return '';
  const match = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  return match ? match[1].trim() : '';
}

/**
 * Safely fetches a single URL with timeouts and response size limits.
 * @param {string} pageUrl
 * @returns {Promise<{ ok: boolean, status: number, contentType: string, responseTimeMs: number, html: string, headers: Record<string, string>, error?: string }>}
 */
export async function fetchPageSafely(pageUrl) {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      redirect: 'follow'
    });
    clearTimeout(timeoutId);

    const responseTimeMs = Date.now() - startTime;
    const contentType = res.headers.get('content-type') || '';

    // Only process text / HTML content
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return {
        ok: false,
        status: res.status,
        contentType,
        responseTimeMs,
        html: '',
        headers: Object.fromEntries(res.headers.entries()),
        error: `Skipped non-HTML content type (${contentType})`
      };
    }

    const html = await res.text();
    const truncatedHtml = html.length > MAX_BODY_BYTES ? html.slice(0, MAX_BODY_BYTES) : html;

    return {
      ok: res.ok,
      status: res.status,
      contentType,
      responseTimeMs,
      html: truncatedHtml,
      headers: Object.fromEntries(res.headers.entries())
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      status: 0,
      contentType: '',
      responseTimeMs: Date.now() - startTime,
      html: '',
      headers: {},
      error: err.name === 'AbortError' ? 'Request timed out (10s)' : err.message
    };
  }
}

/**
 * Main Crawler Runner
 * Supports Quick Homepage Scan (1 page) and Full Website Scan (max 25 in-scope pages).
 *
 * @param {Object} options
 * @param {string} options.targetUrl - Starting homepage URL
 * @param {'quick'|'full'} options.scanMode - Scan mode
 * @param {Function} [options.onProgress] - Stage progress reporter
 * @param {Function} [options.isCancelled] - Cancellation checker
 * @returns {Promise<{ pages: Array<Object>, crawlCapped: boolean, robotsDisallowedCount: number }>}
 */
export async function crawlWebsite({ targetUrl, scanMode = 'quick', onProgress = () => {}, isCancelled = () => false }) {
  const { normalizedDomain, displayUrl } = normalizeTargetUrl(targetUrl);
  const origin = new URL(displayUrl).origin;
  const maxPages = scanMode === 'quick' ? 1 : MAX_FULL_PAGES;

  onProgress({
    stage: 'validating',
    percent: 5,
    currentStep: `Pre-flight DNS check on ${normalizedDomain}...`,
    pagesDiscovered: 1,
    pagesAudited: 0,
    maxPages
  });

  await validateSafeHostDns(normalizedDomain);

  onProgress({
    stage: 'crawling',
    percent: 10,
    currentStep: `Checking robots.txt at ${origin}...`,
    pagesDiscovered: 1,
    pagesAudited: 0,
    maxPages
  });

  // Fetch and parse robots.txt
  const disallowedPrefixes = await fetchRobotsDisallowed(origin);

  const isPathDisallowed = (urlStr) => {
    try {
      const pathname = new URL(urlStr).pathname;
      return disallowedPrefixes.some(prefix => pathname.startsWith(prefix));
    } catch (e) {
      return false;
    }
  };

  const pages = [];
  const queue = [displayUrl];
  const visited = new Set();
  let crawlCapped = false;

  while (queue.length > 0 && pages.length < maxPages) {
    if (isCancelled()) {
      throw new Error('Scan cancelled by user.');
    }

    const currentUrl = queue.shift();
    if (!currentUrl || visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    // Check robots.txt Disallow
    if (isPathDisallowed(currentUrl)) {
      continue;
    }

    const currentCount = pages.length + 1;
    const progressPercent = Math.min(85, Math.round(15 + (currentCount / maxPages) * 70));

    onProgress({
      stage: 'crawling',
      percent: progressPercent,
      currentStep: `Auditing page ${currentCount}/${maxPages}: ${currentUrl}`,
      pagesDiscovered: visited.size + queue.length,
      pagesAudited: pages.length,
      maxPages
    });

    const fetchResult = await fetchPageSafely(currentUrl);
    const title = extractTitle(fetchResult.html);

    let linksDiscovered = 0;
    if (scanMode === 'full' && fetchResult.ok && fetchResult.html) {
      const discoveredLinks = extractLinks(fetchResult.html, currentUrl, origin);
      linksDiscovered = discoveredLinks.length;

      for (const link of discoveredLinks) {
        if (!visited.has(link) && !queue.includes(link)) {
          if (visited.size + queue.length < maxPages) {
            queue.push(link);
          } else {
            crawlCapped = true;
          }
        }
      }
    }

    pages.push({
      url: currentUrl,
      normalizedUrl: currentUrl,
      statusCode: fetchResult.status,
      contentType: fetchResult.contentType,
      responseTimeMs: fetchResult.responseTimeMs,
      pageTitle: title,
      pageSizeBytes: Buffer.byteLength(fetchResult.html || '', 'utf8'),
      html: fetchResult.html,
      headers: fetchResult.headers,
      linksDiscovered,
      error: fetchResult.error || null
    });

    if (scanMode === 'quick') break;
  }

  if (scanMode === 'full' && queue.length > 0) {
    crawlCapped = true;
  }

  return {
    pages,
    crawlCapped,
    robotsDisallowedCount: disallowedPrefixes.length
  };
}
