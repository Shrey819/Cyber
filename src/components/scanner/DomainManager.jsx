import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ScanMonitor from './ScanMonitor';

export default function DomainManager({ onSelectDomainForScan }) {
  const { currentUser } = useAuth();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Scan modal state
  const [scanModalTarget, setScanModalTarget] = useState(null);

  // Add Domain Modal / Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const companyId = currentUser?.companyId || currentUser?.company_id || null;
  const userId = currentUser?.id || 'usr-anonymous';

  const fetchDomains = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        'x-user-id': userId
      };
      if (companyId) {
        headers['x-company-id'] = companyId;
      }

      const res = await fetch('/api/domains', { headers });
      const data = await res.json();
      if (data.success) {
        setDomains(data.domains || []);
      } else {
        setError(data.error || 'Failed to load domains.');
      }
    } catch (err) {
      setError('Network error connecting to domains API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [currentUser]);

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          ...(companyId ? { 'x-company-id': companyId } : {})
        },
        body: JSON.stringify({
          url: newDomainInput.trim(),
          userId,
          companyId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Domain "${data.domain.normalized_domain}" registered successfully!`);
        setNewDomainInput('');
        setShowAddModal(false);
        fetchDomains();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || 'Failed to register domain.');
      }
    } catch (err) {
      setError('Connection error while saving domain: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDomain = async (domainId, domainName) => {
    if (!window.confirm(`Are you sure you want to remove "${domainName}" from active monitoring? All historical audit reports will remain preserved.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId,
          ...(companyId ? { 'x-company-id': companyId } : {})
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Domain "${domainName}" removed. Historical reports preserved.`);
        setDomains(prev => prev.filter(d => d.id !== domainId));
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || 'Failed to remove domain.');
      }
    } catch (err) {
      setError('Error removing domain: ' + err.message);
    }
  };

  const filteredDomains = domains.filter(d => 
    d.normalizedDomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.displayUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Toast Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Domain Inventory & Asset Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Registered target domains eligible for automated Quick and Full security audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDomains}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh domain list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Target Domain</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter registered domains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Register Website Domain</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter a public domain name (e.g. <code className="text-cyan-300">example.com</code> or <code className="text-cyan-300">https://sub.domain.org</code>). Our SSRF firewall validates safe public IP resolution before registration.
            </p>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Target Domain or URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourcompany.com"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  autoFocus
                  required
                />
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Automatic SSRF & DNS Safety</span>
                </div>
                <p>Private loopbacks, RFC1918 subnets, and cloud metadata (169.254.x.x) are automatically blocked.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newDomainInput.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Validating DNS...</span>
                    </>
                  ) : (
                    <span>Register Domain</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Domains Table / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          <span>Loading registered domains...</span>
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="p-8 text-center bg-[#0B0F19] border border-slate-800/80 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Globe className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white">No Target Domains Registered</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            {searchTerm ? 'No domains matched your search criteria.' : 'Add your company or client web domains to monitor security health, SEO, performance, and accessibility.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register First Domain</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-lg divide-y divide-slate-800/70">
          {filteredDomains.map((domain) => {
            const scoreColor = domain.latestScore >= 80 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              : domain.latestScore >= 50
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : domain.latestScore != null
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : 'text-slate-400 bg-slate-800/50 border-slate-700/50';

            return (
              <div 
                key={domain.id} 
                className="p-4 hover:bg-slate-900/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      {domain.normalizedDomain}
                    </span>
                    <a
                      href={domain.displayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-0.5"
                      title="Open external website"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>{domain.displayUrl}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      Added: {new Date(domain.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      Last Scan: {domain.lastScanAt ? new Date(domain.lastScanAt).toLocaleString() : 'Never audited'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Latest Score Badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">Health Score</span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border inline-block ${scoreColor}`}>
                      {domain.latestScore != null ? `${domain.latestScore}/100` : 'Pending'}
                    </span>
                  </div>

                  {/* Action: Trigger / Select Domain for Scan */}
                  {domain.latestScanId && (
                    <button
                      onClick={() => {
                        window.location.hash = `#scan/${domain.latestScanId}`;
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700 cursor-pointer"
                      title="View latest audit report"
                    >
                      <FileText className="w-3 h-3 text-cyan-400" />
                      <span>Report</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectDomainForScan ? onSelectDomainForScan(domain) : setScanModalTarget(domain)}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer"
                    title="Initiate website audit scan"
                  >
                    <span>Audit</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  {/* Remove Domain Action */}
                  <button
                    onClick={() => handleRemoveDomain(domain.id, domain.normalizedDomain)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Remove domain (archive)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time Scan Monitor Modal (Phase 2) */}
      {scanModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full animate-fadeIn">
            <ScanMonitor
              initialUrl={scanModalTarget.displayUrl}
              initialDomainId={scanModalTarget.id}
              initialMode="quick"
              onClose={() => {
                setScanModalTarget(null);
                fetchDomains();
              }}
              onViewReport={(scanId) => {
                window.location.hash = `#scan/${scanId}`;
                setScanModalTarget(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
