import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  Clock, 
  ArrowRight, 
  Layers, 
  Activity, 
  Cpu, 
  FileText,
  StopCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ScanMonitor({ initialUrl = '', initialDomainId = null, initialMode = 'quick', onClose, onViewReport }) {
  const { currentUser } = useAuth();
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [scanMode, setScanMode] = useState(initialMode); // 'quick' | 'full'
  const [activeScanId, setActiveScanId] = useState(null);
  const [scanState, setScanState] = useState(null); // scan document from API
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const userId = currentUser?.id || 'usr-anonymous';
  const companyId = currentUser?.companyId || currentUser?.company_id || null;

  // Poll for scan progress when an active scan ID exists
  useEffect(() => {
    if (!activeScanId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${activeScanId}`);
        const data = await res.json();
        if (data.success && isSubscribed) {
          setScanState(data.scan);
          // Stop polling on terminal states
          if (['completed', 'completed_with_warnings', 'failed', 'cancelled'].includes(data.scan.status)) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error polling scan status:', err);
      }
    }, 900);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeScanId]);

  const handleStartScan = async (e) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) {
      setError('Please enter a website URL or domain name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setScanState(null);

    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          ...(companyId ? { 'x-company-id': companyId } : {})
        },
        body: JSON.stringify({
          url: targetUrl.trim(),
          domainId: initialDomainId,
          scanMode
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveScanId(data.scanId);
      } else {
        if (res.status === 409 && data.scanId) {
          // An active scan already exists, automatically hook into it
          setActiveScanId(data.scanId);
        } else {
          setError(data.error || 'Failed to start scan.');
        }
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelScan = async () => {
    if (!activeScanId) return;
    try {
      await fetch(`/api/scans/${activeScanId}/cancel`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to cancel scan:', e);
    }
  };

  const isScanning = scanState && ['queued', 'validating', 'crawling', 'scanning', 'scoring'].includes(scanState.status);
  const isFinished = scanState && ['completed', 'completed_with_warnings'].includes(scanState.status);
  const isFailed = scanState && scanState.status === 'failed';
  const isCancelled = scanState && scanState.status === 'cancelled';

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            {!activeScanId ? 'Initiate Website Health Audit' : `Auditing: ${scanState?.normalizedDomain || targetUrl}`}
          </h3>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Stage 1: Configure & Launch Scan */}
      {!activeScanId && (
        <form onSubmit={handleStartScan} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
              Website Domain or URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. example.com or https://company.org"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
              Select Scan Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => setScanMode('quick')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scanMode === 'quick' 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Quick Homepage Scan</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    1 Page
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Audits only the homepage. Runs fast security headers, SSL/DNS, TTFB latency, and SEO checks.
                </p>
              </div>

              <div 
                onClick={() => setScanMode('full')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scanMode === 'full' 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Full Website Scan</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Max 25 Pages
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Crawls in-scope internal links and respects robots.txt. Capped at 25 unique pages for this release.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Scans are strictly passive and read-only. We do not perform intrusive exploits, brute force, or modify website content.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !targetUrl.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSubmitting ? 'Validating Target...' : `Start ${scanMode === 'quick' ? 'Quick' : 'Full'} Audit`}</span>
            </button>
          </div>
        </form>
      )}

      {/* Stage 2: Live Progress Monitor */}
      {activeScanId && (
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isScanning ? 'bg-cyan-400 animate-pulse' :
                  isFinished ? 'bg-emerald-400' :
                  isFailed ? 'bg-rose-400' : 'bg-slate-400'
                }`} />
                <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                  {scanState?.status?.replace(/_/g, ' ') || 'INITIALIZING'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Mode: {scanState?.scanMode?.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {scanState?.progress?.currentStep || 'Preparing audit worker...'}
              </p>
            </div>

            {/* Cancel Action */}
            {isScanning && (
              <button
                onClick={handleCancelScan}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-center gap-1.5 self-start cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Cancel Scan</span>
              </button>
            )}
          </div>

          {/* Honest Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Progress</span>
              <span className="text-cyan-400 font-bold">{scanState?.progress?.percent || 0}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
                style={{ width: `${scanState?.progress?.percent || 0}%` }}
              />
            </div>
          </div>

          {/* Telemetry Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-500 font-mono block">Pages Audited</span>
              <span className="text-xs font-bold font-mono text-white">
                {scanState?.progress?.pagesAudited || 0} / {scanState?.progress?.maxPages || 1}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-500 font-mono block">Discovered Links</span>
              <span className="text-xs font-bold font-mono text-cyan-300">
                {scanState?.progress?.pagesDiscovered || 0}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-500 font-mono block">Findings Detected</span>
              <span className="text-xs font-bold font-mono text-amber-400">
                {scanState?.summary?.totalFindings || 0}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-500 font-mono block">Health Score</span>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {scanState?.scores?.overall != null ? `${scanState.scores.overall}/100` : 'Calculating'}
              </span>
            </div>
          </div>

          {/* Notice if crawl was capped */}
          {scanState?.progress?.crawlCapped && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] font-mono flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Full scan reached the 25-page crawl cap for this release.</span>
            </div>
          )}

          {/* Completion Card */}
          {isFinished && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Audit Complete</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white">Score: {scanState.scores.overall}/100</span>
                </div>
              </div>

              {/* Category Breakdown Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Security</span>
                  <span className="text-emerald-400 font-bold">{scanState.scores.security}/100</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Performance</span>
                  <span className="text-cyan-400 font-bold">{scanState.scores.performance}/100</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Technical SEO</span>
                  <span className="text-blue-400 font-bold">{scanState.scores.seo}/100</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Accessibility</span>
                  <span className="text-amber-400 font-bold">
                    {scanState.scores.accessibility != null ? `${scanState.scores.accessibility}/100` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">Mobile</span>
                  <span className="text-pink-400 font-bold">
                    {scanState.scores.mobile != null ? `${scanState.scores.mobile}/100` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">SSL & DNS</span>
                  <span className="text-purple-400 font-bold">{scanState.scores.sslDns}/100</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setActiveScanId(null);
                    setScanState(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>New Scan</span>
                </button>

                {onViewReport && (
                  <button
                    onClick={() => onViewReport(scanState.id)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    <span>View Detailed Findings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Notice */}
          {isCancelled && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
              <span className="text-xs text-slate-400">Scan was cancelled. No further pages were audited.</span>
              <div>
                <button
                  onClick={() => {
                    setActiveScanId(null);
                    setScanState(null);
                  }}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart Audit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
