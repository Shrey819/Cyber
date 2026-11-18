import PDFDocument from 'pdfkit';

/**
 * Generates an executive website security & technical audit report PDF using PDFKit.
 * 
 * @param {Object} options
 * @param {Object} options.scan - The Scan document
 * @param {Array<Object>} options.findings - Array of Finding documents
 * @param {Array<Object>} options.pages - Array of ScannedPage documents
 * @param {import('express').Response} options.res - Express response stream
 */
export function generateAuditReportPdf({ scan, findings = [], pages = [], res }) {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true,
    info: {
      Title: `Audit Report - ${scan.normalized_domain || scan.target_url}`,
      Author: 'Vortex Cyber Defense Platform',
      Subject: 'Automated Website Security & Technical Health Audit',
      Keywords: 'security, accessibility, seo, performance, ssl, dns, mobile'
    }
  });

  doc.pipe(res);

  const primaryCyan = '#00E5FF';
  const darkBg = '#0B0F19';
  const panelBg = '#F8FAFC';
  const borderColor = '#CBD5E1';
  const textDark = '#0F172A';
  const textMuted = '#64748B';

  const overallScore = scan.scores?.overall != null ? scan.scores.overall : 0;
  const getScoreColor = (score) => {
    if (score >= 90) return '#059669'; // Emerald
    if (score >= 75) return '#0284C7'; // Cyan/Sky
    if (score >= 50) return '#D97706'; // Amber
    return '#DC2626'; // Rose/Red
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#2563EB';
      default: return '#059669';
    }
  };

  // Helper for page break check
  const ensureSpace = (neededHeight) => {
    if (doc.y + neededHeight > 780) {
      doc.addPage();
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.rect(40, 20, 515, 20).fill('#0F172A');
    doc.fillColor(primaryCyan).fontSize(7).font('Helvetica-Bold').text('VORTEX CYBER DEFENSE | TECHNICAL AUDIT SYSTEM', 50, 26);
    doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text(`Target: ${scan.normalized_domain || scan.target_url}`, 340, 26, { align: 'right', width: 205 });
    doc.y = 50;
  };

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ==========================================

  // 1. Top Header Banner
  doc.rect(40, 40, 515, 65).fill(darkBg);
  doc.fillColor(primaryCyan).fontSize(16).font('Helvetica-Bold').text('VORTEX CYBER DEFENSE', 55, 52);
  doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica').text('ENTERPRISE WEBSITE SECURITY & TECHNICAL HEALTH AUDIT', 55, 72);
  doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('EXECUTIVE REPORT', 380, 52, { align: 'right', width: 160 });
  doc.fillColor(primaryCyan).fontSize(8).font('Helvetica-Bold').text(scan.id, 380, 72, { align: 'right', width: 160 });

  // 2. Target & Scope Metadata Box
  const metaY = 115;
  doc.rect(40, metaY, 515, 45).fill(panelBg);
  doc.rect(40, metaY, 515, 45).stroke(borderColor);

  doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text('AUDITED DOMAIN:', 50, metaY + 10);
  doc.fillColor('#0284C7').fontSize(9).font('Helvetica-Bold').text(scan.target_url || scan.normalized_domain, 50, metaY + 24);

  doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text('SCAN MODE:', 320, metaY + 10);
  doc.fillColor(textMuted).fontSize(8).font('Helvetica').text((scan.scan_mode || 'quick').toUpperCase() + (scan.scan_mode === 'quick' ? ' (Single Page)' : ' (Crawl capped at 25 pages)'), 320, metaY + 24);

  const scanDate = scan.completed_at ? new Date(scan.completed_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString();
  doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text('AUDIT DATE:', 430, metaY + 10);
  doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(scanDate, 430, metaY + 24);

  // 3. Overall Score Card
  const scoreCardY = 170;
  doc.rect(40, scoreCardY, 150, 110).fill('#0F172A');
  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica-Bold').text('OVERALL SCORE', 55, scoreCardY + 15);
  doc.fillColor(getScoreColor(overallScore)).fontSize(36).font('Helvetica-Bold').text(`${overallScore}`, 55, scoreCardY + 32);
  doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica').text('/ 100', 115, scoreCardY + 52);

  const grade = overallScore >= 90 ? 'EXCELLENT' : overallScore >= 75 ? 'GOOD' : overallScore >= 50 ? 'NEEDS ATTENTION' : 'CRITICAL ACTION REQUIRED';
  doc.fillColor(getScoreColor(overallScore)).fontSize(8).font('Helvetica-Bold').text(grade, 55, scoreCardY + 85);

  // 4. Category Scores (6 Pillars)
  const catCardX = 200;
  doc.rect(catCardX, scoreCardY, 355, 110).fill(panelBg);
  doc.rect(catCardX, scoreCardY, 355, 110).stroke(borderColor);

  const categories = [
    { label: 'Security Headers', score: scan.scores?.security ?? 0 },
    { label: 'Performance Latency', score: scan.scores?.performance ?? 0 },
    { label: 'Technical SEO', score: scan.scores?.seo ?? 0 },
    { label: 'Accessibility (WCAG)', score: scan.scores?.accessibility ?? 0 },
    { label: 'Mobile Viewport', score: scan.scores?.mobile ?? 0 },
    { label: 'SSL / TLS & DNS', score: scan.scores?.sslDns ?? 0 }
  ];

  categories.forEach((cat, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const itemX = catCardX + 15 + col * 112;
    const itemY = scoreCardY + 14 + row * 46;

    doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text(cat.label, itemX, itemY);
    doc.fillColor(getScoreColor(cat.score)).fontSize(14).font('Helvetica-Bold').text(`${cat.score}%`, itemX, itemY + 12);
  });

  // 5. Findings Severity Summary Bar
  const statsY = 292;
  doc.rect(40, statsY, 515, 34).fill('#0F172A');
  const counts = {
    critical: findings.filter(f => f.status === 'failed' && f.severity === 'critical').length,
    high: findings.filter(f => f.status === 'failed' && f.severity === 'high').length,
    medium: findings.filter(f => f.status === 'failed' && f.severity === 'medium').length,
    low: findings.filter(f => f.status === 'failed' && f.severity === 'low').length,
    passed: findings.filter(f => f.status === 'passed').length
  };

  doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('FINDINGS OVERVIEW:', 50, statsY + 12);
  doc.fillColor('#DC2626').text(`Critical: ${counts.critical}`, 160, statsY + 12);
  doc.fillColor('#EA580C').text(`High: ${counts.high}`, 235, statsY + 12);
  doc.fillColor('#D97706').text(`Medium: ${counts.medium}`, 300, statsY + 12);
  doc.fillColor('#38BDF8').text(`Low: ${counts.low}`, 375, statsY + 12);
  doc.fillColor('#34D399').text(`Passed Checks: ${counts.passed}`, 435, statsY + 12);

  // 6. Audited Pages Scope
  const pagesY = 338;
  doc.rect(40, pagesY, 515, 24).fill('#F1F5F9');
  doc.rect(40, pagesY, 515, 24).stroke(borderColor);
  doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
    .text(`CRAWL COVERAGE: `, 50, pagesY + 7, { continued: true })
    .font('Helvetica').fillColor(textMuted)
    .text(`${pages.length} page(s) audited successfully without intrusive crawler impact.`);

  doc.y = 375;

  // ==========================================
  // DETAILED FINDINGS & REMEDIATION ROADMAP
  // ==========================================
  doc.fillColor(textDark).fontSize(12).font('Helvetica-Bold').text('DETAILED AUDIT FINDINGS & REMEDIATION ROADMAP', 40, doc.y);
  doc.rect(40, doc.y + 4, 515, 2).fill(primaryCyan);
  doc.y += 14;

  const failedFindings = findings.filter(f => f.status === 'failed');
  const sortedFindings = [...failedFindings].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
  });

  if (sortedFindings.length === 0) {
    doc.rect(40, doc.y, 515, 50).fill('#ECFDF5');
    doc.rect(40, doc.y, 515, 50).stroke('#A7F3D0');
    doc.fillColor('#065F46').fontSize(10).font('Helvetica-Bold').text('No Critical Issues Detected!', 55, doc.y + 15);
    doc.fillColor('#047857').fontSize(8).font('Helvetica').text('All passive automated checks passed across audited pages.', 55, doc.y + 30);
    doc.y += 65;
  } else {
    for (const f of sortedFindings) {
      ensureSpace(130);

      const cardY = doc.y;
      const cardHeight = 120; // Estimated baseline height

      // Finding Header Badge
      const sevColor = getSeverityColor(f.severity);
      doc.rect(40, cardY, 515, 22).fill(panelBg);
      doc.rect(40, cardY, 515, 22).stroke(borderColor);

      // Severity Pill
      doc.rect(48, cardY + 4, 55, 14).fill(sevColor);
      doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold').text((f.severity || 'medium').toUpperCase(), 48, cardY + 7, { width: 55, align: 'center' });

      // Title & Rule
      doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold').text(f.title, 110, cardY + 6, { width: 340 });
      doc.fillColor(textMuted).fontSize(7).font('Helvetica').text(f.rule_id || '', 450, cardY + 7, { width: 100, align: 'right' });

      // Finding Body Box
      doc.rect(40, cardY + 22, 515, 90).fill('#FFFFFF');
      doc.rect(40, cardY + 22, 515, 90).stroke(borderColor);

      let innerY = cardY + 28;
      doc.fillColor(textDark).fontSize(8).font('Helvetica').text(f.description, 50, innerY, { width: 495 });
      innerY += 22;

      // Why It Matters
      if (f.recommendation?.whyItMatters) {
        doc.fillColor('#0284C7').fontSize(7.5).font('Helvetica-Bold').text('Why It Matters: ', 50, innerY, { continued: true });
        doc.fillColor(textMuted).font('Helvetica').text(f.recommendation.whyItMatters, { width: 495 });
        innerY += 20;
      }

      // Remediation Action
      if (f.recommendation?.action) {
        doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold').text('Remediation: ', 50, innerY, { continued: true });
        doc.fillColor(textDark).font('Helvetica').text(f.recommendation.action, { width: 495 });
        innerY += 16;
      }

      // Affected URLs count
      const urlCount = Array.isArray(f.affected_urls) ? f.affected_urls.length : 1;
      doc.fillColor(textMuted).fontSize(7).font('Helvetica')
        .text(`Affected Scope: ${urlCount} page(s) | Fix Effort: ${(f.recommendation?.effort || 'medium').toUpperCase()}`, 50, innerY);

      doc.y = cardY + 118;
    }
  }

  // ==========================================
  // DISCLAIMER & SIGNATURE FOOTER
  // ==========================================
  ensureSpace(80);
  const footerY = doc.y + 10;
  doc.rect(40, footerY, 515, 50).fill('#0F172A');
  doc.fillColor(primaryCyan).fontSize(8).font('Helvetica-Bold').text('VORTEX CYBER DEFENSE PLATFORM - PASSIVE SECURITY SCOPE', 50, footerY + 10);
  doc.fillColor('#94A3B8').fontSize(6.5).font('Helvetica').text(
    'This audit report is produced exclusively via non-intrusive, read-only passive inspections, public DNS telemetry, and static HTML parsing. It adheres to strict SSRF boundary controls and does not simulate destructive exploitation. Remediations should be tested in staging before production deployment.',
    50, footerY + 22, { width: 495 }
  );

  doc.end();
}

export default {
  generateAuditReportPdf
};