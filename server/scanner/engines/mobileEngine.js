import * as cheerio from 'cheerio';

const MOBILE_VIEWPORT_WIDTH = 390; // Standard modern mobile viewport baseline (e.g. iPhone 13/14/15, Pixel 7)
const MOBILE_VIEWPORT_HEIGHT = 844;

/**
 * Runs deterministic automated Mobile Viewport & Responsiveness Audits on an HTML document.
 * 
 * @param {Object} params
 * @param {string} params.url - The page URL
 * @param {string} params.html - Raw HTML content
 * @returns {Array<Object>} Normalized audit findings
 */
export function auditPageMobile({ url, html }) {
  const findings = [];
  if (!html || typeof html !== 'string') return findings;

  const $ = cheerio.load(html);

  const addFinding = ({ ruleId, title, description, status, severity, affectedUrls, evidence, recommendation }) => {
    findings.push({
      rule_id: ruleId,
      category: 'mobile',
      title,
      description,
      status: status || 'failed',
      severity: severity || 'medium',
      confidence: 1.0,
      affected_urls: affectedUrls || [url],
      evidence: evidence || {},
      recommendation: recommendation || {}
    });
  };

  // 1. Viewport Meta Tag Presence & Configuration
  const viewportTag = $('meta[name="viewport"]');
  const viewportContent = viewportTag.attr('content') || '';

  if (!viewportTag.length || !viewportContent.trim()) {
    addFinding({
      ruleId: 'mobile-missing-viewport',
      title: 'Missing Viewport Meta Tag (<meta name="viewport">)',
      description: 'The page lacks a <meta name="viewport"> tag. Mobile browsers will render the page at desktop resolution (~980px width) and scale it down, rendering text unreadably small.',
      status: 'failed',
      severity: 'critical',
      evidence: { tagFound: false, observed: null, expected: '<meta name="viewport" content="width=device-width, initial-scale=1">' },
      recommendation: {
        action: 'Add a standard responsive viewport meta tag in the <head>',
        whyItMatters: 'Tells mobile browsers to match screen dimensions and render content at 1:1 CSS pixel scale.',
        codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">',
        effort: 'easy',
        docUrl: 'https://web.dev/responsive-web-design-basics/#viewport'
      }
    });
  } else {
    // Check width=device-width
    const hasDeviceWidth = /width\s*=\s*device-width/i.test(viewportContent);
    const hasInitialScale = /initial-scale\s*=\s*1(\.0)?/i.test(viewportContent);
    const disablesZoom = /user-scalable\s*=\s*(no|0)/i.test(viewportContent) || /maximum-scale\s*=\s*1(\.0)?/i.test(viewportContent);

    if (!hasDeviceWidth || !hasInitialScale) {
      addFinding({
        ruleId: 'mobile-malformed-viewport',
        title: 'Suboptimal Viewport Meta Configuration',
        description: 'The viewport meta tag is missing "width=device-width" or "initial-scale=1". This may cause unexpected horizontal scaling or letterboxing on smaller mobile devices.',
        status: 'failed',
        severity: 'high',
        evidence: { observedContent: viewportContent, hasDeviceWidth, hasInitialScale },
        recommendation: {
          action: 'Update viewport meta tag to standard responsive syntax',
          whyItMatters: 'Guarantees consistent 1:1 initial rendering across mobile screens.',
          codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">',
          effort: 'easy'
        }
      });
    } else {
      addFinding({
        ruleId: 'mobile-viewport-configured',
        title: 'Responsive Viewport Meta Tag Configured',
        description: 'Page specifies width=device-width and initial-scale=1.',
        status: 'passed',
        severity: 'info',
        evidence: { viewportContent }
      });
    }

    if (disablesZoom) {
      addFinding({
        ruleId: 'mobile-zoom-restricted',
        title: 'Mobile Pinch-to-Zoom Disabled in Viewport',
        description: 'Viewport specifies user-scalable=no or maximum-scale=1.0. This prevents mobile users from zooming into text and charts.',
        status: 'failed',
        severity: 'high',
        evidence: { viewportContent },
        recommendation: {
          action: 'Remove user-scalable=no and allow user zoom up to 200%',
          whyItMatters: 'Essential for mobile accessibility and compliance with WCAG 1.4.4.',
          effort: 'easy'
        }
      });
    }
  }

  // 2. Fixed-Width Elements Exceeding Mobile Viewport
  const overflowingElements = [];
  $('[style*="width"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = /width\s*:\s*(\d+)px/i.exec(style);
    if (match) {
      const pxWidth = parseInt(match[1], 10);
      if (pxWidth > MOBILE_VIEWPORT_WIDTH) {
        overflowingElements.push({
          tag: el.tagName.toLowerCase(),
          id: $(el).attr('id') || null,
          class: $(el).attr('class') || null,
          fixedWidthPx: pxWidth,
          snippet: $.html(el).slice(0, 100)
        });
      }
    }
  });

  // Check HTML width attribute on non-images (tables, divs, iframes)
  $('table[width], div[width], iframe[width]').each((_, el) => {
    const rawW = $(el).attr('width');
    const parsedW = parseInt(rawW, 10);
    if (!isNaN(parsedW) && parsedW > MOBILE_VIEWPORT_WIDTH) {
      overflowingElements.push({
        tag: el.tagName.toLowerCase(),
        id: $(el).attr('id') || null,
        fixedWidthPx: parsedW,
        snippet: $.html(el).slice(0, 100)
      });
    }
  });

  if (overflowingElements.length > 0) {
    addFinding({
      ruleId: 'mobile-fixed-width-overflow',
      title: 'Elements With Fixed Pixel Widths Exceeding Mobile Screen',
      description: `${overflowingElements.length} element(s) have hardcoded widths greater than ${MOBILE_VIEWPORT_WIDTH}px (e.g. style="width: ${overflowingElements[0].fixedWidthPx}px"). This causes horizontal scrollbars and broken layouts on mobile screens.`,
      status: 'failed',
      severity: 'high',
      evidence: {
        mobileBreakpointPx: MOBILE_VIEWPORT_WIDTH,
        overflowCount: overflowingElements.length,
        examples: overflowingElements.slice(0, 5)
      },
      recommendation: {
        action: 'Use fluid or responsive CSS widths (e.g., max-width: 100% or width: 100%)',
        whyItMatters: 'Fixed pixel widths wider than the screen force awkward horizontal panning on mobile devices.',
        codeSnippet: '/* Responsive CSS */\n.container {\n  width: 100%;\n  max-width: 1200px;\n  box-sizing: border-box;\n}',
        effort: 'medium'
      }
    });
  }

  // 3. Responsive Images (Hardcoded large widths without responsive styling)
  const nonResponsiveImages = [];
  $('img[width]').each((_, el) => {
    const rawWidth = $(el).attr('width');
    const widthNum = parseInt(rawWidth, 10);
    const style = ($(el).attr('style') || '').toLowerCase();
    const className = ($(el).attr('class') || '').toLowerCase();

    // If width > 390px and doesn't have max-width or w-full / responsive class
    const isResponsive = style.includes('max-width') || style.includes('width: 100%') || className.includes('w-full') || className.includes('img-fluid') || className.includes('responsive');

    if (!isNaN(widthNum) && widthNum > MOBILE_VIEWPORT_WIDTH && !isResponsive) {
      nonResponsiveImages.push({
        src: ($(el).attr('src') || '').slice(0, 80),
        widthAttr: widthNum,
        snippet: $.html(el).slice(0, 100)
      });
    }
  });

  if (nonResponsiveImages.length > 0) {
    addFinding({
      ruleId: 'mobile-non-responsive-images',
      title: 'Images Lacking Fluid Responsive Sizing',
      description: `${nonResponsiveImages.length} image(s) specify fixed HTML width attributes greater than ${MOBILE_VIEWPORT_WIDTH}px without CSS max-width constraint.`,
      status: 'failed',
      severity: 'medium',
      evidence: {
        count: nonResponsiveImages.length,
        examples: nonResponsiveImages.slice(0, 4)
      },
      recommendation: {
        action: 'Apply global responsive image styling in CSS',
        whyItMatters: 'Prevents oversized images from breaking out of the mobile viewport container.',
        codeSnippet: 'img {\n  max-width: 100%;\n  height: auto;\n}',
        effort: 'easy'
      }
    });
  }

  // 4. Tables Without Horizontal Scroll Wrappers
  const unwrappedTables = [];
  $('table').each((_, el) => {
    const $table = $(el);
    const parent = $table.parent();
    const parentStyle = (parent.attr('style') || '').toLowerCase();
    const parentClass = (parent.attr('class') || '').toLowerCase();

    const hasOverflowScroll = parentStyle.includes('overflow-x') || parentStyle.includes('overflow: auto') || parentStyle.includes('overflow: scroll') || parentClass.includes('overflow-x-auto') || parentClass.includes('table-responsive');

    if (!hasOverflowScroll) {
      unwrappedTables.push({
        snippet: $.html(el).slice(0, 100)
      });
    }
  });

  if (unwrappedTables.length > 0) {
    addFinding({
      ruleId: 'mobile-unwrapped-tables',
      title: 'Data Tables Without Mobile Overflow Scroll Container',
      description: `${unwrappedTables.length} table(s) are not enclosed in a container with horizontal scroll (overflow-x: auto). Data tables wider than mobile screens will break the page container layout.`,
      status: 'failed',
      severity: 'medium',
      evidence: { unwrappedCount: unwrappedTables.length },
      recommendation: {
        action: 'Wrap data tables in a container with overflow-x: auto',
        whyItMatters: 'Allows mobile users to scroll large data tables horizontally without displacing page margins.',
        codeSnippet: '<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">\n  <table>...</table>\n</div>',
        effort: 'easy'
      }
    });
  }

  // 5. Illegible Small Font Sizes (< 12px)
  const smallFontOccurrences = [];
  $('[style*="font-size"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = /font-size\s*:\s*(\d+(\.\d+)?)px/i.exec(style);
    if (match) {
      const sizePx = parseFloat(match[1]);
      if (sizePx < 12) {
        smallFontOccurrences.push({
          tag: el.tagName.toLowerCase(),
          sizePx,
          text: $(el).text().trim().slice(0, 50),
          snippet: $.html(el).slice(0, 100)
        });
      }
    }
  });

  if (smallFontOccurrences.length > 0) {
    addFinding({
      ruleId: 'mobile-small-fonts',
      title: 'Tiny Font Sizes Detected (< 12px)',
      description: `${smallFontOccurrences.length} element(s) declare font sizes under 12px (e.g. ${smallFontOccurrences[0].sizePx}px). Text smaller than 12px is difficult or impossible to read on handheld mobile displays without zooming.`,
      status: 'failed',
      severity: 'medium',
      evidence: {
        count: smallFontOccurrences.length,
        examples: smallFontOccurrences.slice(0, 3)
      },
      recommendation: {
        action: 'Set base body font-size to at least 16px and small caption text to at least 12px',
        whyItMatters: 'Prevents reader eye strain and avoids triggering automatic zoom on iOS Safari.',
        effort: 'easy'
      }
    });
  }

  // 6. Mobile Viewport Dimension & Baseline Context
  addFinding({
    ruleId: 'mobile-viewport-baseline-info',
    title: 'Mobile Viewport Baseline Specification',
    description: `Audited against standard mobile baseline: ${MOBILE_VIEWPORT_WIDTH}x${MOBILE_VIEWPORT_HEIGHT} CSS pixels (Device Pixel Ratio: 2.0). Automated layout tests evaluate structural responsiveness; real-device manual testing is recommended for complex gesture interactions.`,
    status: 'passed',
    severity: 'info',
    evidence: {
      viewportWidth: MOBILE_VIEWPORT_WIDTH,
      viewportHeight: MOBILE_VIEWPORT_HEIGHT,
      devicePixelRatio: 2.0,
      targetFormFactors: ['Mobile Smart Phones (375px - 430px width)']
    }
  });

  return findings;
}

/**
 * Calculates Mobile Category Score (0 - 100).
 * @param {Array<Object>} mobileFindings
 * @returns {number} Score from 0 to 100
 */
export function calculateMobileScore(mobileFindings) {
  let score = 100;
  for (const f of mobileFindings) {
    if (f.status === 'passed') continue;

    if (f.severity === 'critical') {
      score -= 35; // e.g. Missing viewport meta tag entirely
    } else if (f.severity === 'high') {
      score -= 15; // e.g. Fixed width overflow or malformed viewport
    } else if (f.severity === 'medium') {
      score -= 10; // e.g. Unwrapped tables, non-responsive images, tiny font sizes
    } else if (f.severity === 'low') {
      score -= 5;
    }
  }

  return Math.max(10, Math.min(100, score));
}

export default {
  auditPageMobile,
  calculateMobileScore
};
