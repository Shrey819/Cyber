import assert from 'assert';
import {
  RECOMMENDATION_CATALOGUE,
  enrichFindingWithRecommendation,
  consolidateFindings
} from './scanner/recommendations.js';

console.log('🧪 Starting Phase 6 & 7 Recommendation Engine & Evidence Structuring Tests...\n');

// 1. Catalogue completeness test
console.log('Test 1: Verification of Recommendation Catalogue completeness and schema...');
const requiredCategories = ['security', 'performance', 'seo', 'accessibility', 'mobile', 'ssl_dns'];
const categoriesFound = new Set(Object.values(RECOMMENDATION_CATALOGUE).map(c => c.category));

for (const reqCat of requiredCategories) {
  assert(categoriesFound.has(reqCat), `Category "${reqCat}" must be present in RECOMMENDATION_CATALOGUE`);
}

for (const [ruleId, rec] of Object.entries(RECOMMENDATION_CATALOGUE)) {
  assert(rec.ruleId === ruleId, `ruleId mismatch in key ${ruleId}`);
  assert(typeof rec.action === 'string' && rec.action.length > 5, `${ruleId} missing action`);
  assert(typeof rec.whyItMatters === 'string' && rec.whyItMatters.length > 10, `${ruleId} missing whyItMatters`);
  assert(Array.isArray(rec.stepByStep) && rec.stepByStep.length > 0, `${ruleId} stepByStep must be non-empty array`);
  assert(['easy', 'medium', 'hard'].includes(rec.effort), `${ruleId} effort must be easy/medium/hard`);
  assert(typeof rec.verificationSteps === 'string', `${ruleId} verificationSteps must be string`);
}
console.log(`✅ Passed: Checked ${Object.keys(RECOMMENDATION_CATALOGUE).length} deterministic rules with full remediation metadata.`);

// 2. Finding enrichment test
console.log('\nTest 2: Finding enrichment with deterministic catalogue...');
const testFinding = {
  rule_id: 'sec-missing-hsts',
  category: 'security',
  title: 'HSTS Not Configured',
  description: 'Missing Strict-Transport-Security header',
  status: 'failed',
  severity: 'high'
};
const enriched = enrichFindingWithRecommendation(testFinding);
assert.strictEqual(enriched.recommendation.action, RECOMMENDATION_CATALOGUE['sec-missing-hsts'].action);
assert(enriched.recommendation.stepByStep.length > 1, 'stepByStep must be populated');
assert.strictEqual(enriched.recommendation.effort, 'easy');
assert(enriched.recommendation.codeSnippet.includes('Strict-Transport-Security'), 'Code snippet must contain directive');
console.log('✅ Passed: Known finding enriched with complete remediation actions and snippets.');

// 2b. Graceful fallback for unknown rule
console.log('\nTest 2b: Fallback for uncatalogued custom rule...');
const customFinding = {
  rule_id: 'custom-internal-check',
  category: 'security',
  title: 'Custom Check',
  description: 'Custom rule details'
};
const customEnriched = enrichFindingWithRecommendation(customFinding);
assert(customEnriched.recommendation.action.length > 0, 'Fallback action must be generated');
assert.strictEqual(customEnriched.recommendation.effort, 'medium');
console.log('✅ Passed: Custom finding gracefully handles missing catalogue entries.');

// 3. Deduplication and multi-page consolidation test
console.log('\nTest 3: Deduplication across multi-page crawls...');
const multiPageRaw = [
  {
    rule_id: 'a11y-missing-image-alt',
    category: 'accessibility',
    title: 'Images Missing Meaningful Alternative Text',
    description: 'Found 2 image(s) missing alt text.',
    status: 'failed',
    severity: 'medium',
    affected_urls: ['https://example.com/'],
    evidence: { elements: ['<img src="banner.jpg">', '<img src="logo.png">'] }
  },
  {
    rule_id: 'a11y-missing-image-alt',
    category: 'accessibility',
    title: 'Images Missing Meaningful Alternative Text',
    description: 'Found 1 image(s) missing alt text.',
    status: 'failed',
    severity: 'medium',
    affected_urls: ['https://example.com/about'],
    evidence: { elements: ['<img src="team.jpg">'] }
  },
  {
    rule_id: 'a11y-missing-image-alt',
    category: 'accessibility',
    title: 'Images Missing Meaningful Alternative Text',
    description: 'Found 3 image(s) missing alt text.',
    status: 'failed',
    severity: 'medium',
    affected_urls: ['https://example.com/contact'],
    evidence: { elements: ['<img src="map.png">', '<img src="icon1.svg">', '<img src="icon2.svg">'] }
  },
  {
    rule_id: 'sec-missing-hsts',
    category: 'security',
    title: 'Missing HTTP Strict Transport Security (HSTS)',
    description: 'Server missing HSTS header.',
    status: 'failed',
    severity: 'high',
    affected_urls: ['https://example.com/']
  }
];

const consolidated = consolidateFindings(multiPageRaw, 'scan-test-123', 'dom-test-456');

// Should deduplicate 3 a11y findings into 1, plus 1 security finding = 2 total
assert.strictEqual(consolidated.length, 2, `Expected 2 consolidated findings, received ${consolidated.length}`);

const a11yConsolidated = consolidated.find(f => f.rule_id === 'a11y-missing-image-alt');
assert(a11yConsolidated, 'a11y-missing-image-alt must exist in consolidated output');
assert.strictEqual(a11yConsolidated.affected_urls.length, 3, 'Must aggregate all 3 distinct affected URLs');
assert(a11yConsolidated.affected_urls.includes('https://example.com/'));
assert(a11yConsolidated.affected_urls.includes('https://example.com/about'));
assert(a11yConsolidated.affected_urls.includes('https://example.com/contact'));

// Check evidence merging
assert.strictEqual(a11yConsolidated.evidence.affectedPagesCount, 3, 'Evidence must record affected page count');
assert.strictEqual(a11yConsolidated.evidence.totalViolations, 6, 'Evidence must aggregate all 6 image violations');
assert.strictEqual(a11yConsolidated.evidence.sampleViolations.length, 6);

// Check recommendation enrichment
assert(a11yConsolidated.recommendation.action.includes('alt attributes'), 'Remediation action must be enriched');
assert(a11yConsolidated.recommendation.stepByStep.length >= 2, 'Remediation steps must be populated');
console.log('✅ Passed: Multi-page crawl findings successfully consolidated with aggregated evidence and URLs.');

// 4. Mixed passed and failed consolidation test
console.log('\nTest 4: Mixed passed and failed pages consolidation...');
const mixedRaw = [
  {
    rule_id: 'a11y-missing-html-lang',
    category: 'accessibility',
    title: 'Missing Document Language',
    status: 'failed',
    affected_urls: ['https://example.com/broken']
  },
  {
    rule_id: 'a11y-missing-html-lang',
    category: 'accessibility',
    title: 'Document Language Specified',
    status: 'passed',
    affected_urls: ['https://example.com/valid']
  }
];

const mixedConsolidated = consolidateFindings(mixedRaw, 'scan-test-123');
assert.strictEqual(mixedConsolidated.length, 1);
assert.strictEqual(mixedConsolidated[0].status, 'failed', 'Failure must take precedence for site audit health');
assert.deepStrictEqual(mixedConsolidated[0].affected_urls, ['https://example.com/broken'], 'Only failing URLs should be flagged');
console.log('✅ Passed: Failing state correctly prioritised over passing pages for audit findings.');

console.log('\n🎉 ALL Phase 6 & 7 Recommendation & Consolidation tests passed successfully!\n');
