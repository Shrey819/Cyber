import * as cheerio from 'cheerio';

/**
 * Runs deterministic automated accessibility audits on an HTML document.
 * 
 * @param {Object} params
 * @param {string} params.url - The page URL being audited
 * @param {string} params.html - The raw HTML body
 * @returns {Array<Object>} List of normalized findings
 */
export function auditPageAccessibility({ url, html }) {
  const findings = [];
  if (!html || typeof html !== 'string') return findings;

  const $ = cheerio.load(html);

  // Helper to add finding
  const addFinding = ({ ruleId, title, description, status, severity, affectedUrls, evidence, recommendation }) => {
    findings.push({
      rule_id: ruleId,
      category: 'accessibility',
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

  // 1. Missing Document Language (<html lang>)
  const htmlTag = $('html');
  const langAttr = htmlTag.attr('lang');
  if (!langAttr || !langAttr.trim()) {
    addFinding({
      ruleId: 'a11y-missing-html-lang',
      title: 'Missing or Empty Document Language (<html lang>)',
      description: 'The root <html> element does not specify a "lang" attribute. Screen readers cannot determine the correct voice synthesis, accent, and pronunciation rules.',
      status: 'failed',
      severity: 'high',
      evidence: { tag: '<html' + (htmlTag.attr('class') ? ` class="${htmlTag.attr('class')}"` : '') + '>', observed: langAttr || null, expected: 'e.g. lang="en" or lang="en-US"' },
      recommendation: {
        action: 'Add a valid lang attribute to the <html> tag',
        whyItMatters: 'Allows assistive screen-reading software to read content with proper pronunciation.',
        codeSnippet: '<html lang="en">',
        effort: 'easy',
        docUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html'
      }
    });
  } else {
    addFinding({
      ruleId: 'a11y-missing-html-lang',
      title: 'Document Language Specified',
      description: `Root <html> tag declares language as "${langAttr.trim()}".`,
      status: 'passed',
      severity: 'info',
      evidence: { lang: langAttr.trim() }
    });
  }

  // 2. Images Missing Alternative Text (<img>)
  const suspiciousAltPatterns = ['image', 'photo', 'picture', 'graphic', 'logo', 'icon', 'banner', 'untitled', 'placeholder'];
  const failedImages = [];
  $('img').each((_, el) => {
    const $img = $(el);
    const src = $img.attr('src') || $img.attr('data-src') || '(no src)';
    const alt = $img.attr('alt');
    const role = $img.attr('role');
    const ariaHidden = $img.attr('aria-hidden');

    // Decorative images with aria-hidden="true" or role="presentation" are exempt
    if (ariaHidden === 'true' || role === 'presentation' || role === 'none') {
      return;
    }

    if (alt === undefined) {
      failedImages.push({
        selector: `img[src="${src.slice(0, 80)}"]`,
        snippet: $.html(el).slice(0, 120),
        reason: 'Missing alt attribute'
      });
    } else if (alt !== '' && suspiciousAltPatterns.includes(alt.toLowerCase().trim())) {
      failedImages.push({
        selector: `img[src="${src.slice(0, 80)}"]`,
        snippet: $.html(el).slice(0, 120),
        reason: `Placeholder alt text "${alt}" provides no context`
      });
    }
  });

  if (failedImages.length > 0) {
    addFinding({
      ruleId: 'a11y-missing-image-alt',
      title: 'Images Missing Meaningful Alternative Text',
      description: `${failedImages.length} image(s) lack an "alt" attribute or use uninformative placeholder text. Vision-impaired visitors cannot understand the visual information.`,
      status: 'failed',
      severity: 'high',
      evidence: {
        totalFailingImages: failedImages.length,
        examples: failedImages.slice(0, 5)
      },
      recommendation: {
        action: 'Add concise, descriptive alt attributes to informative images',
        whyItMatters: 'Screen readers vocalize the alt text in place of visual images. For purely decorative images, explicitly set alt="" or aria-hidden="true".',
        codeSnippet: '<img src="chart.png" alt="Monthly revenue growth bar chart for Q3" />',
        effort: 'easy',
        docUrl: 'https://www.w3.org/WAI/tutorials/images/'
      }
    });
  }

  // 3. Form Controls Missing Accessible Labels
  const unlabeledControls = [];
  $('input, select, textarea').each((_, el) => {
    const $input = $(el);
    const type = ($input.attr('type') || 'text').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return;

    const id = $input.attr('id');
    const ariaLabel = $input.attr('aria-label');
    const ariaLabelledby = $input.attr('aria-labelledby');
    const title = $input.attr('title');
    const placeholder = $input.attr('placeholder');

    let hasLabel = false;
    // Check aria attributes or title
    if ((ariaLabel && ariaLabel.trim()) || (ariaLabelledby && ariaLabelledby.trim()) || (title && title.trim())) {
      hasLabel = true;
    }

    // Check parent <label>
    if (!hasLabel && $input.closest('label').length > 0) {
      hasLabel = true;
    }

    // Check <label for="id">
    if (!hasLabel && id) {
      if ($(`label[for="${id}"]`).length > 0) {
        hasLabel = true;
      }
    }

    if (!hasLabel) {
      unlabeledControls.push({
        element: el.tagName.toLowerCase(),
        type,
        id: id || '(no id)',
        name: $input.attr('name') || '(no name)',
        snippet: $.html(el).slice(0, 100),
        hasPlaceholderOnly: Boolean(placeholder)
      });
    }
  });

  if (unlabeledControls.length > 0) {
    addFinding({
      ruleId: 'a11y-missing-form-labels',
      title: 'Form Inputs Missing Accessible Labels',
      description: `${unlabeledControls.length} form input element(s) do not have an associated <label> or aria-label attribute. Placeholder text alone does not fulfill accessibility standards.`,
      status: 'failed',
      severity: 'critical',
      evidence: {
        unlabeledCount: unlabeledControls.length,
        examples: unlabeledControls.slice(0, 5)
      },
      recommendation: {
        action: 'Associate each form control with a visible <label> or aria-label',
        whyItMatters: 'Screen reader users must know what input is expected when focusing an input field.',
        codeSnippet: '<label for="user-email">Work Email</label>\n<input type="email" id="user-email" />',
        effort: 'easy',
        docUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/'
      }
    });
  }

  // 4. Buttons and Links Without Accessible Names
  const emptyInteractiveElements = [];
  $('button, a').each((_, el) => {
    const $el = $(el);
    const tag = el.tagName.toLowerCase();
    if (tag === 'a' && !$el.attr('href')) return; // anchor without href is not interactive link

    const text = $el.text().trim();
    const ariaLabel = $el.attr('aria-label');
    const ariaLabelledby = $el.attr('aria-labelledby');
    const title = $el.attr('title');
    const hasImageAlt = $el.find('img[alt]:not([alt=""])').length > 0;
    const hasSvgLabel = $el.find('svg[aria-label], svg title').length > 0;

    const isAccessible = text.length > 0 || (ariaLabel && ariaLabel.trim()) || (ariaLabelledby && ariaLabelledby.trim()) || (title && title.trim()) || hasImageAlt || hasSvgLabel;

    if (!isAccessible) {
      emptyInteractiveElements.push({
        tag,
        snippet: $.html(el).slice(0, 100)
      });
    }
  });

  if (emptyInteractiveElements.length > 0) {
    addFinding({
      ruleId: 'a11y-empty-interactive-names',
      title: 'Buttons or Links Lacking Accessible Names',
      description: `${emptyInteractiveElements.length} button or link element(s) have no visible text or aria-label attribute. Screen readers announce them as blank or unclickable icons.`,
      status: 'failed',
      severity: 'high',
      evidence: {
        failingCount: emptyInteractiveElements.length,
        examples: emptyInteractiveElements.slice(0, 5)
      },
      recommendation: {
        action: 'Provide accessible text or an aria-label on icon buttons and links',
        whyItMatters: 'Ensures users who cannot see visual icons know the purpose of the button or destination of the link.',
        codeSnippet: '<button aria-label="Close modal dialog">\n  <svg ... />\n</button>',
        effort: 'easy',
        docUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html'
      }
    });
  }

  // 5. Heading Structure & Hierarchy Check (h1 - h6)
  const headings = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName.replace(/^h/i, ''), 10);
    headings.push({
      level,
      text: $(el).text().trim().slice(0, 60),
      tag: el.tagName.toLowerCase()
    });
  });

  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count === 0) {
    addFinding({
      ruleId: 'a11y-missing-h1',
      title: 'Missing Top-Level Heading (<h1>)',
      description: 'The page does not contain a primary <h1> heading. An <h1> informs users of the central topic of the page.',
      status: 'failed',
      severity: 'medium',
      evidence: { totalHeadingsFound: headings.length, h1Count: 0 },
      recommendation: {
        action: 'Add a single descriptive <h1> element representing the main page topic',
        whyItMatters: 'Screen reader users rely on headings to quickly scan and jump across page sections.',
        codeSnippet: '<h1>Enterprise Cybersecurity Platform</h1>',
        effort: 'easy'
      }
    });
  } else if (h1Count > 1) {
    addFinding({
      ruleId: 'a11y-multiple-h1',
      title: 'Multiple <h1> Headings Detected',
      description: `The page contains ${h1Count} separate <h1> headings. While technically allowed in HTML5, best practice recommends a single main heading per document.`,
      status: 'failed',
      severity: 'low',
      evidence: { h1Count, examples: headings.filter(h => h.level === 1) },
      recommendation: {
        action: 'Consolidate to a single <h1> heading and demote secondary headers to <h2>',
        whyItMatters: 'A single <h1> creates an unambiguous top-level landmark for assistive technologies.',
        effort: 'easy'
      }
    });
  }

  // Check skipped heading levels (e.g. h1 -> h3 without h2)
  const skippedHeadings = [];
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      skippedHeadings.push({
        from: `h${prev}`,
        to: `h${curr}`,
        text: headings[i].text
      });
    }
  }

  if (skippedHeadings.length > 0) {
    addFinding({
      ruleId: 'a11y-skipped-heading-level',
      title: 'Skipped Heading Levels in Document Hierarchy',
      description: `Headings jump levels (e.g. ${skippedHeadings[0].from} directly to ${skippedHeadings[0].to}) without intermediate levels.`,
      status: 'failed',
      severity: 'medium',
      evidence: { skippedCount: skippedHeadings.length, examples: skippedHeadings.slice(0, 3) },
      recommendation: {
        action: 'Adjust heading tags to maintain sequential hierarchical nesting',
        whyItMatters: 'Screen reader users navigating via keyboard heading shortcuts are disoriented when levels are skipped.',
        codeSnippet: '<!-- Correct hierarchy -->\n<h1>Title</h1>\n  <h2>Section</h2>\n    <h3>Subsection</h3>',
        effort: 'easy'
      }
    });
  }

  // 6. Duplicate Element IDs
  const idMap = new Map();
  $('[id]').each((_, el) => {
    const id = $(el).attr('id');
    if (!id || !id.trim()) return;
    const count = idMap.get(id) || 0;
    idMap.set(id, count + 1);
  });

  const duplicateIds = Array.from(idMap.entries()).filter(([_, count]) => count > 1);
  if (duplicateIds.length > 0) {
    addFinding({
      ruleId: 'a11y-duplicate-id',
      title: 'Duplicate Element IDs Detected in Document',
      description: `${duplicateIds.length} unique HTML ID(s) appear multiple times on the page. IDs must be globally unique.`,
      status: 'failed',
      severity: 'medium',
      evidence: {
        duplicates: duplicateIds.map(([id, occurrences]) => ({ id, occurrences }))
      },
      recommendation: {
        action: 'Ensure all HTML id attributes are unique across the entire DOM',
        whyItMatters: 'Duplicate IDs break label associations, aria-labelledby references, and DOM element selectors.',
        effort: 'easy'
      }
    });
  }

  // 7. Positive Tabindex (> 0) Anti-Pattern
  const positiveTabindexElements = [];
  $('[tabindex]').each((_, el) => {
    const tabVal = parseInt($(el).attr('tabindex'), 10);
    if (tabVal > 0) {
      positiveTabindexElements.push({
        tag: el.tagName.toLowerCase(),
        tabindex: tabVal,
        snippet: $.html(el).slice(0, 100)
      });
    }
  });

  if (positiveTabindexElements.length > 0) {
    addFinding({
      ruleId: 'a11y-positive-tabindex',
      title: 'Positive Tabindex (> 0) Used',
      description: `${positiveTabindexElements.length} element(s) use positive tabindex values. This disrupts the natural keyboard focus order and creates confusion for keyboard-only navigators.`,
      status: 'failed',
      severity: 'medium',
      evidence: { count: positiveTabindexElements.length, examples: positiveTabindexElements.slice(0, 3) },
      recommendation: {
        action: 'Remove positive tabindex attributes; rely on DOM source order or tabindex="0"',
        whyItMatters: 'Positive tabindex forces artificial focus jumps before the natural top-to-bottom tab flow.',
        effort: 'easy'
      }
    });
  }

  // 8. Viewport Zoom Lock Check
  const viewportMeta = $('meta[name="viewport"]').attr('content') || '';
  if (/user-scalable\s*=\s*(no|0)/i.test(viewportMeta) || /maximum-scale\s*=\s*1(\.0)?/i.test(viewportMeta)) {
    addFinding({
      ruleId: 'a11y-viewport-zoom-disabled',
      title: 'User Zoom and Pinch Scaling Disabled in Viewport',
      description: 'The viewport meta tag includes "user-scalable=no" or "maximum-scale=1.0", preventing visually impaired users from magnifying text.',
      status: 'failed',
      severity: 'high',
      evidence: { viewportContent: viewportMeta },
      recommendation: {
        action: 'Remove user-scalable=no and allow zoom up to at least 200%',
        whyItMatters: 'WCAG 1.4.4 requires content to be scalable up to 200% without loss of content or functionality.',
        codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">',
        effort: 'easy',
        docUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html'
      }
    });
  }

  // 9. Standard Scope Disclaimer
  addFinding({
    ruleId: 'a11y-automated-scope-notice',
    title: 'Automated Accessibility Coverage & Testing Scope',
    description: 'Automated rules evaluate measurable structural criteria. Full WCAG 2.1 AA conformance also requires manual testing for keyboard traps, focus visible indicators, and screen reader announcements.',
    status: 'passed',
    severity: 'info',
    evidence: { automatedRulesTested: 8, manualVerificationRecommended: true },
    recommendation: {
      action: 'Conduct manual keyboard tab-through and screen reader spot checks',
      whyItMatters: 'Automated tests catch approximately 30-50% of accessibility barriers.',
      docUrl: 'https://www.w3.org/WAI/test-evaluate/'
    }
  });

  return findings;
}

/**
 * Calculates Accessibility Category Score (0 - 100) based on evaluated findings.
 * @param {Array<Object>} a11yFindings
 * @returns {number} Score from 0 to 100
 */
export function calculateAccessibilityScore(a11yFindings) {
  let score = 100;
  for (const f of a11yFindings) {
    if (f.status === 'passed') continue;

    if (f.severity === 'critical') {
      score -= 25;
    } else if (f.severity === 'high') {
      score -= 15;
    } else if (f.severity === 'medium') {
      score -= 8;
    } else if (f.severity === 'low') {
      score -= 4;
    }
  }

  return Math.max(10, Math.min(100, score));
}

export default {
  auditPageAccessibility,
  calculateAccessibilityScore
};
