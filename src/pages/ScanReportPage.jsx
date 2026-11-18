import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Shield,
  Zap,
  Search,
  Eye,
  Smartphone,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Filter,
  Layers,
  Globe,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from 'lucide-react';

export default function ScanReportPage({ scanId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [statusFilter, setStatusFilter] = useState('failed'); // 'failed', 'all', 'passed'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFindings, setExpandedFindings] = useState(new Set());
  const [copiedSnippetId, setCopiedSnippetId] = useState(null);

  // Comparison State
  const [historicalScans, setHistoricalScans] = useState([]);
  const [selectedCompareScanId, setSelectedCompareScanId] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [compareTab, setCompareTab] = useState('all'); // 'all', 'new', 'resolved', 'recurring'

  // Fetch Report Data
  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/scans/${scanId}/results`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReportData(data);
          // If scan has a domain, fetch historical scans for comparison selector
          if (data.scan.domainId) {
            fetch(`/api/domains/${data.scan.domainId}/scans`)
              .then(r => r.json())
              .then(histData => {
                if (histData.success) {
                  // Exclude the current scan from comparison candidates
                  const others = (histData.scans || []).filter(s => s.id !== scanId && s.status.startsWith('completed'));
                  setHistoricalScans(others);
                }
              })
              .catch(() => {});
          }
        } else {
          setError(data.error || 'Failed to load scan report.');
        }
      })
      .catch(err => {
        setError('Network error fetching audit report: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [scanId]);

  // Handle Comparison trigger
  const handleCompare = (otherId) => {
    setSelectedCompareScanId(otherId);
    if (!otherId) {
      setComparisonData(null);
      return;
    }

    setComparing(true);
    fetch(`/api/scans/${scanId}/compare/${otherId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setComparisonData(data);
        } else {
          alert('Comparison error: ' + (data.error || 'Unable to compare scans.'));
        }
      })
      .catch(err => {
        alert('Network error comparing scans: ' + err.message);
      })
      .finally(() => {
        setComparing(false);
      });
  };

  const toggleExpand = (findingId) => {
    setExpandedFindings(prev => {
      const next = new Set(prev);
      if (next.has(findingId)) next.delete(findingId);
      else next.add(findingId);
      return next;
    });
  };

  const handleCopySnippet = (snippet, id) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col items-center justify-center p-6">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-200">LOADING AUDIT REPORT</h2>
        <p className="text-sm text-slate-400 font-mono mt-1">Retrieving evidence, telemetry, and remediation directives...</p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/80 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Report Unavailable</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error || 'Scan record could not be found.'}</p>
          <button
            onClick={onBack}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { scan, findings = [], pages = [] } = reportData;
  const overallScore = scan.scores?.overall ?? 0;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 75) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'low':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  // Filter Findings
  const filteredFindings = findings.filter(f => {
    // Status filter
    if (statusFilter === 'failed' && f.status !== 'failed') return false;
    if (statusFilter === 'passed' && f.status !== 'passed') return false;

    // Category filter
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;

    // Severity filter
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false;

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (f.title || '').toLowerCase().includes(q);
      const matchDesc = (f.description || '').toLowerCase().includes(q);
      const matchRule = (f.ruleId || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRule) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 font-sans pb-20 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white font-mono">
                  {scan.normalizedDomain || scan.targetUrl}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {scan.scanMode === 'quick' ? 'Quick Audit' : 'Full Crawl (25 Max)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Scan ID: {scan.id} • {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : 'In Progress'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF Report Button */}
            <a
              href={`/api/scans/${scan.id}/pdf`}
              download={`Audit-Report-${scan.id}.pdf`}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Executive Score & Category Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Overall Gauge */}
          <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block mb-1">
                Executive Health Score
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-6xl font-black font-mono tracking-tight ${getScoreColor(overallScore).split(' ')[0]}`}>
                  {overallScore}
                </span>
                <span className="text-xl text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="mt-3">
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border inline-block ${getScoreColor(overallScore)}`}>
                  {overallScore >= 90 ? 'GRADE A: EXCELLENT' :
                   overallScore >= 75 ? 'GRADE B: STABLE' :
                   overallScore >= 50 ? 'GRADE C: NEEDS ATTENTION' : 'GRADE F: CRITICAL ISSUES'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Audited Pages:</span>
                <span className="font-mono text-white font-bold">{pages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Checks Evaluated:</span>
                <span className="font-mono text-white font-bold">{findings.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Actionable Violations:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {findings.filter(f => f.status === 'failed').length}
                </span>
              </div>
            </div>
          </div>

          {/* 6 Category Breakdown Grid */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { id: 'security', label: 'Security Headers', icon: Shield, score: scan.scores?.security ?? 0, desc: 'HSTS, CSP, XFO, Sniffing' },
              { id: 'performance', label: 'Performance Latency', icon: Zap, score: scan.scores?.performance ?? 0, desc: 'TTFB Latency, Compression' },
              { id: 'seo', label: 'Technical SEO', icon: Search, score: scan.scores?.seo ?? 0, desc: 'Title, Meta Descriptions' },
              { id: 'accessibility', label: 'Accessibility', icon: Eye, score: scan.scores?.accessibility ?? 0, desc: 'WCAG Lang, Alt, Labels, Headings' },
              { id: 'mobile', label: 'Mobile Viewport', icon: Smartphone, score: scan.scores?.mobile ?? 0, desc: 'Scalability, Fixed Widths, Fonts' },
              { id: 'ssl_dns', label: 'SSL & DNS Records', icon: Lock, score: scan.scores?.sslDns ?? 0, desc: 'TLS 1.3, Expiry, SPF, DMARC' }
            ].map(cat => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-950/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300 border border-slate-700/50">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className={`text-xl font-bold font-mono ${getScoreColor(cat.score).split(' ')[0]}`}>
                      {cat.score}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-wide">{cat.label}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cat.desc}</p>

                  <div className="w-full bg-slate-800 rounded-full h-1 mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cat.score >= 90 ? 'bg-emerald-400' :
                        cat.score >= 75 ? 'bg-cyan-400' :
                        cat.score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scan Comparison Selector & Diff Banner (Phase 8) */}
        {historicalScans.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Historical Scan Comparison</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compare this audit against a previous baseline scan to track remediation progress and regressions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCompareScanId}
                  onChange={(e) => handleCompare(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">Select Baseline Scan to Compare...</option>
                  {historicalScans.map(hs => (
                    <option key={hs.id} value={hs.id}>
                      {new Date(hs.completedAt || hs.startedAt).toLocaleDateString()} — Score: {hs.scores?.overall ?? 'N/A'}/100 ({hs.scanMode?.toUpperCase()})
                    </option>
                  ))}
                </select>
                {comparing && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
              </div>
            </div>

            {/* Comparison Metrics Banner */}
            {comparisonData && (
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                      comparisonData.summary.overallDelta > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      comparisonData.summary.overallDelta < 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                      'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {comparisonData.summary.overallDelta > 0 ? <ArrowUpRight className="w-5 h-5" /> :
                       comparisonData.summary.overallDelta < 0 ? <ArrowDownRight className="w-5 h-5" /> :
                       <Minus className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Overall Delta</span>
                      <span className="text-base font-black font-mono">
                        {comparisonData.summary.overallDelta > 0 ? `+${comparisonData.summary.overallDelta}` : comparisonData.summary.overallDelta} Points
                        {comparisonData.summary.improved ? ' (Improved)' : comparisonData.summary.regressed ? ' (Regressed)' : ' (No Score Change)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
                      +{comparisonData.summary.newIssuesCount} New Issues
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                      {comparisonData.summary.resolvedIssuesCount} Resolved Issues
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                      {comparisonData.summary.recurringIssuesCount} Recurring
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'security', label: 'Security' },
              { id: 'performance', label: 'Performance' },
              { id: 'seo', label: 'SEO' },
              { id: 'accessibility', label: 'Accessibility' },
              { id: 'mobile', label: 'Mobile' },
              { id: 'ssl_dns', label: 'SSL & DNS' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Filters: Severity, Status & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'failed' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Violations
              </button>
              <button
                onClick={() => setStatusFilter('passed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'passed' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Passed
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
            </div>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Text Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* Findings List & Remediation Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Showing {filteredFindings.length} of {findings.length} findings</span>
            <button
              onClick={() => {
                if (expandedFindings.size > 0) setExpandedFindings(new Set());
                else setExpandedFindings(new Set(filteredFindings.map(f => f.id)));
              }}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              {expandedFindings.size > 0 ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Findings Match Your Filters</h3>
              <p className="text-xs text-slate-500">Try broadening your category or severity filters to view other audit checks.</p>
            </div>
          ) : (
            filteredFindings.map(finding => {
              const isExpanded = expandedFindings.has(finding.id);
              const isFailed = finding.status === 'failed';
              const sevBadge = getSeverityBadge(finding.severity);
              const rec = finding.recommendation || {};

              return (
                <div
                  key={finding.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isFailed
                      ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900/20 border-slate-800/60 opacity-90'
                  }`}
                >
                  {/* Card Header Accordion Toggle */}
                  <div
                    onClick={() => toggleExpand(finding.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isFailed ? (
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${sevBadge}`}>
                            {finding.severity?.toUpperCase() || 'INFO'}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {finding.category?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {finding.ruleId}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {finding.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {finding.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {finding.affectedUrls?.length > 1 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {finding.affectedUrls.length} pages
                        </span>
                      )}
                      <div className="p-1 rounded-lg bg-slate-800/80 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Remediation & Evidence Drawer */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                      {/* Why It Matters Callout */}
                      {rec.whyItMatters && (
                        <div className="p-3.5 bg-blue-950/20 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-blue-300 block mb-0.5">Why It Matters:</span>
                            <p className="text-slate-300 leading-relaxed">{rec.whyItMatters}</p>
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step Remediation */}
                      {Array.isArray(rec.stepByStep) && rec.stepByStep.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            <span>Recommended Remediation Steps:</span>
                          </span>
                          <ul className="space-y-1 pl-4 text-xs text-slate-300">
                            {rec.stepByStep.map((step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed list-disc marker:text-cyan-400">
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Code Snippet Box */}
                      {rec.codeSnippet && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-slate-400">Example Configuration / Snippet</span>
                            <button
                              onClick={() => handleCopySnippet(rec.codeSnippet, finding.id)}
                              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedSnippetId === finding.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Snippet</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                            {rec.codeSnippet}
                          </pre>
                        </div>
                      )}

                      {/* Affected Scope / URLs */}
                      {Array.isArray(finding.affectedUrls) && finding.affectedUrls.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono text-slate-400">
                            Affected URL(s) ({finding.affectedUrls.length})
                          </span>
                          <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            {finding.affectedUrls.map((u, uIdx) => (
                              <div key={uIdx} className="text-[11px] font-mono text-slate-300 truncate">
                                • {u}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Verification Steps & Meta Footer */}
                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 gap-2">
                        {rec.verificationSteps && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">Verification:</span>
                            <span className="font-mono text-slate-300">{rec.verificationSteps}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                          <span>Effort: <strong className="text-white font-mono uppercase">{rec.effort || 'medium'}</strong></span>
                          {rec.docUrl && (
                            <a
                              href={rec.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Official Docs</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Audited Pages Drawer */}
        {pages.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Audited Pages Inventory ({pages.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Internal same-origin pages fetched and analyzed during this scan.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Audited URL</th>
                    <th className="pb-2 text-right">TTFB</th>
                    <th className="pb-2 text-right">Size</th>
                    <th className="pb-2 text-right">Links Discovered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pages.map(page => (
                    <tr key={page.id} className="hover:bg-slate-800/20">
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          page.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {page.statusCode || 'ERR'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300 truncate max-w-md">
                        {page.url}
                        {page.pageTitle && (
                          <span className="block text-[10px] text-slate-500 font-sans truncate">
                            {page.pageTitle}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-slate-400">
                        {page.responseTimeMs != null ? `${page.responseTimeMs}ms` : '—'}
                      </td>
                      <td className="py-2.5 text-right text-slate-400">
                        {page.pageSizeBytes ? `${(page.pageSizeBytes / 1024).toFixed(1)} KB` : '—'}
                      </td>
                      <td className="py-2.5 text-right text-slate-400">
                        {page.linksDiscovered ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
