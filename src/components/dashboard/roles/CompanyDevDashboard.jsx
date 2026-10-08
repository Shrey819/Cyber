import React, { useState } from 'react';
import { 
  Code2, 
  KeyRound, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Globe, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Lock, 
  ExternalLink, 
  Search, 
  AlertTriangle, 
  Server,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function CompanyDevDashboard() {
  const { 
    currentUser, 
    apiKeys, 
    vulnerabilities, 
    createApiKey, 
    revokeApiKey, 
    triggerVulnerabilityScan, 
    companies 
  } = useAuth();

  const companyId = currentUser?.companyId || 'comp-apex';
  const company = companies.find(c => c.id === companyId) || companies[0];

  // Filter keys and vulnerabilities for this company
  const companyKeys = apiKeys.filter(k => k.companyId === companyId);
  const companyVulns = vulnerabilities.filter(v => v.companyId === companyId);

  // States
  const [activeTab, setActiveTab] = useState('keys'); // 'keys', 'scanner', 'ssl', 'waf'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState(['read:telemetry']);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [notification, setNotification] = useState(null);

  // WAF State
  const [rateLimitThreshold, setRateLimitThreshold] = useState(3000);
  const [ipList, setIpList] = useState([
    { ip: '194.230.14.0/24', type: 'whitelist', desc: 'Corporate HQ Gateway' },
    { ip: '72.14.204.0/20', type: 'whitelist', desc: 'San Francisco Branch Office' },
    { ip: '185.220.101.5', type: 'blacklist', desc: 'Tor Exit Node / DDoS Probe' },
  ]);
  const [newIp, setNewIp] = useState('');
  const [newIpType, setNewIpType] = useState('whitelist');
  const [newIpDesc, setNewIpDesc] = useState('');

  // Handle Security Scan
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanProgress(15);
    const step1 = setTimeout(() => setScanProgress(55), 700);
    const step2 = setTimeout(() => setScanProgress(85), 1400);
    const step3 = setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      triggerVulnerabilityScan(companyId);
      setNotification('Automated vulnerability assessment completed! 1 new remediation rule added.');
      setTimeout(() => setNotification(null), 4000);
    }, 2000);
  };

  // Handle API Key Creation
  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const created = createApiKey({
      name: newKeyName,
      scopes: newKeyScope,
      rateLimit: '2,500 req/min',
    });

    setNewlyCreatedKey(created);
    setNewKeyName('');
    setShowNewKeyModal(false);
    setNotification(`New API Key "${created.name}" generated with cryptographic secret.`);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleRevokeKey = (keyId) => {
    revokeApiKey(keyId);
    setNotification('API Key successfully revoked.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleAddIp = (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setIpList([...ipList, { ip: newIp, type: newIpType, desc: newIpDesc || 'Custom Rule' }]);
    setNewIp('');
    setNewIpDesc('');
    setNotification(`IP rule for ${newIp} added to company firewall.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRemoveIp = (ipToRemove) => {
    setIpList(ipList.filter(item => item.ip !== ipToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notification && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-3.5 xs:p-5 sm:p-6 bg-[#0B0F19] border border-emerald-500/20 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                COMPANY DEVELOPER / SECOPS
              </span>
              <span className="text-[11px] sm:text-xs text-emerald-400 font-mono">
                Scoped to: {company.name} (@{company.domain})
              </span>
            </div>
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-white tracking-tight">
              Company SecOps Architecture & Developer Controls
            </h1>
            <p className="text-[11px] xs:text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manage enterprise API credentials, trigger deep CVE vulnerability scans, inspect TLS 1.3 cryptographic domain certificates, and configure firewall rate limiting.
            </p>
          </div>

          {/* Sub-Navigation Tabs (Horizontal swipe track on mobile) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'keys'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>API Keys ({companyKeys.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CVE Scanner ({companyVulns.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ssl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'ssl'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>SSL & Headers</span>
            </button>

            <button
              onClick={() => setActiveTab('waf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'waf'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>WAF & IP Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: API KEYS & WEBHOOK CREDENTIALS */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Production API Keys & Ingest Tokens</span>
              </h2>
              <p className="text-xs text-slate-400">
                Scoped machine-to-machine authentication tokens for {company.name}'s pipelines.
              </p>
            </div>

            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New API Key</span>
            </button>
          </div>

          {/* New Key Form Modal */}
          {showNewKeyModal && (
            <div className="p-5 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-white">Create New Company API Ingest Key</h4>
              <form onSubmit={handleCreateKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Key Description / Client Name</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Jenkins Staging Runner, Data Warehouse ETL..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Scopes</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {['read:telemetry', 'write:firewall_rules', 'stream:alerts', 'read:vulnerabilities', 'admin:webhooks'].map(scope => (
                      <label key={scope} className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newKeyScope.includes(scope)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyScope([...newKeyScope, scope]);
                            } else {
                              setNewKeyScope(newKeyScope.filter(s => s !== scope));
                            }
                          }}
                          className="rounded text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-mono text-[11px] text-slate-300">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Create Key
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Keys Table */}
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-lg divide-y divide-slate-800">
            {companyKeys.map((key) => {
              const isRevoked = key.status === 'revoked';
              return (
                <div key={key.id} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{key.name}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono border font-bold uppercase ${
                        isRevoked ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {key.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-emerald-300 bg-black/60 px-2 py-1 rounded border border-slate-800">
                        {key.keyPrefix}
                      </code>
                      <button
                        onClick={() => handleCopy(key.keyPrefix, key.id)}
                        className="text-slate-400 hover:text-white"
                        title="Copy Key Token"
                      >
                        {copiedKeyId === key.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 font-mono mt-1">
                      <span>Rate Limit: {key.rateLimit}</span>
                      <span>•</span>
                      <span>Calls This Month: {key.callsThisMonth}</span>
                      <span>•</span>
                      <span>Created: {key.created}</span>
                    </div>

                    {/* Scopes Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {key.scopes.map(s => (
                        <span key={s} className="px-1.5 py-0.2 bg-slate-900 text-slate-400 border border-slate-800 rounded font-mono text-[9px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {!isRevoked && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                      >
                        Revoke Key
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY CVE VULNERABILITY SCANNER */}
      {activeTab === 'scanner' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Automated Vulnerability & Dependency Scanner</span>
              </h2>
              <p className="text-xs text-slate-400">
                Continuous static and dynamic security testing of {company.name}'s endpoints.
              </p>
            </div>

            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? `Scanning Dependencies (${scanProgress}%)...` : 'Trigger Deep Vulnerability Scan'}</span>
            </button>
          </div>

          {/* Scanner Progress Bar */}
          {isScanning && (
            <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/40 space-y-2 animate-fadeIn font-mono text-xs">
              <div className="flex justify-between text-cyan-300">
                <span>Inspecting container layers & package manifests...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
              </div>
            </div>
          )}

          {/* Findings Cards */}
          <div className="space-y-3">
            {companyVulns.map((vuln) => {
              const severityColor = 
                vuln.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                vuln.severity === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                'bg-blue-500/20 text-blue-300 border-blue-500/40';

              return (
                <div key={vuln.id} className="p-4 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-2.5 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {vuln.cve}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono border font-bold uppercase ${severityColor}`}>
                        {vuln.severity} (CVSS {vuln.score})
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Discovered: {vuln.discoveredDate}</span>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      PATCH AVAILABLE
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200">{vuln.title}</h4>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 font-mono text-[11px] space-y-1">
                    <div className="text-slate-400">
                      Target: <span className="text-slate-200">{vuln.affectedComponent}</span>
                    </div>
                    <div className="text-cyan-400">
                      Remediation: <span className="text-slate-300">{vuln.recommendedAction}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SSL / TLS & DOMAIN HARDENING */}
      {activeTab === 'ssl' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>TLS 1.3 Cryptographic Certificate & Headers Inspector</span>
            </h2>
            <p className="text-xs text-slate-400">
              Hardening assessment for <code className="text-emerald-300">*.{company.domain}</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Certificate Details */}
            <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
              <h4 className="text-xs font-bold text-white font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Certificate Authority & Session Cipher</span>
              </h4>

              <div className="space-y-2 pt-1 text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Issuer:</span>
                  <span className="text-white">DigiCert Global Root G3 (EV)</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Protocol:</span>
                  <span className="text-emerald-400 font-bold">TLS 1.3 (RFC 8446)</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Cipher Suite:</span>
                  <span className="text-cyan-300">TLS_AES_256_GCM_SHA384</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Key Exchange:</span>
                  <span className="text-purple-300">Kyber-768 + X25519</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Renewal In:</span>
                  <span className="text-emerald-400">284 Days</span>
                </div>
              </div>
            </div>

            {/* HTTP Security Headers Status */}
            <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
              <h4 className="text-xs font-bold text-white font-sans flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Security Headers Verification</span>
              </h4>

              <div className="space-y-2 pt-1">
                {[
                  { header: 'Strict-Transport-Security', val: 'max-age=63072000; preload', status: 'PASS' },
                  { header: 'Content-Security-Policy', val: "default-src 'self'; script-src 'nonce-...'", status: 'PASS' },
                  { header: 'X-Frame-Options', val: 'DENY', status: 'PASS' },
                  { header: 'X-Content-Type-Options', val: 'nosniff', status: 'PASS' },
                  { header: 'Permissions-Policy', val: 'camera=(), microphone=(), geolocation=()', status: 'PASS' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-900 pb-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-200 font-bold">{item.header}</span>
                      <p className="text-[10px] text-slate-500 truncate max-w-xs">{item.val}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WAF & RATE LIMITING CONTROLS */}
      {activeTab === 'waf' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Company Firewall & Dynamic Rate Limiter</span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure perimeter DDoS shields and IP access rules for {company.name}.
            </p>
          </div>

          {/* Rate Limit Slider */}
          <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">Ingress Request Threshold Cap</span>
              <span className="font-mono text-emerald-400 font-bold">{rateLimitThreshold.toLocaleString()} req / min / IP</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={rateLimitThreshold}
              onChange={(e) => setRateLimitThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Strict Defense (500 req/m)</span>
              <span>Default (3,000 req/m)</span>
              <span>High-Traffic Pipeline (10,000 req/m)</span>
            </div>
          </div>

          {/* IP Rules Manager */}
          <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white">Company IP Access Whitelist / Blacklist</h4>

            <form onSubmit={handleAddIp} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="IP address or CIDR (e.g. 192.168.1.0/24)"
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono flex-1"
              />

              <input
                type="text"
                value={newIpDesc}
                onChange={(e) => setNewIpDesc(e.target.value)}
                placeholder="Rule description (e.g. VPN Tunnel)"
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 sm:w-48"
              />

              <select
                value={newIpType}
                onChange={(e) => setNewIpType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
              >
                <option value="whitelist">Whitelist</option>
                <option value="blacklist">Blacklist</option>
              </select>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Add Rule
              </button>
            </form>

            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
              {ipList.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/40">
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      item.type === 'whitelist' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-white font-bold">{item.ip}</span>
                    <span className="text-slate-500 font-sans">• {item.desc}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveIp(item.ip)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove IP rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
