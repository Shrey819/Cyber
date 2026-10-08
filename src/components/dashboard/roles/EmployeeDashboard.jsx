import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  Lock, 
  Smartphone, 
  QrCode, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  EyeOff, 
  Search, 
  Sparkles, 
  Zap, 
  AlertCircle,
  HelpCircle,
  Laptop
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function EmployeeDashboard() {
  const { currentUser, addEmployeeSearch } = useAuth();

  // 1. Password Generator State
  const [passwordLength, setPasswordLength] = useState(20);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // 2. Password Strength Analyzer State
  const [testPassword, setTestPassword] = useState('V0rt3x#Sec2026!Quant');
  const [showTestPassword, setShowTestPassword] = useState(false);

  // 3. 2FA Status State
  const [twoFaActive, setTwoFaActive] = useState(true);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const backupCodes = [
    '7A91-49F2', 'B301-88E4', '99D2-11C0', '44X9-81P3', 
    'F520-22A8', '11C4-90B1', '68E7-77F3', '33A0-55D9'
  ];

  // 4. Employee Security Checklist State
  const [checklist, setChecklist] = useState({
    diskEncryption: true,
    mfaActive: true,
    passwordManager: true,
    vpnConfigured: true,
    phishingTrained: false,
  });

  // 5. Query Search Simulator (Demonstrates connection to Senior Manager's dashboard)
  const [mySearchQuery, setMySearchQuery] = useState('');
  const [searchSuccess, setSearchSuccess] = useState(false);

  // Generate password algorithm
  const generatePassword = () => {
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    let result = '';
    const array = new Uint32Array(passwordLength);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < passwordLength; i++) {
      result += chars[array[i] % chars.length];
    }

    setGeneratedPassword(result);
    setCopied(false);
  };

  useEffect(() => {
    generatePassword();
  }, [passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Password Strength Calculation
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', crackTime: '0 seconds', color: 'text-slate-500', barBg: 'bg-slate-700', width: '0%' };
    
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 14) score += 2;
    if (pwd.length >= 20) score += 2;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 2;

    if (score <= 3) return { score, label: 'Weak', crackTime: '3 minutes', color: 'text-rose-400', barBg: 'bg-rose-500', width: '25%' };
    if (score <= 5) return { score, label: 'Moderate', crackTime: '4 months', color: 'text-amber-400', barBg: 'bg-amber-400', width: '50%' };
    if (score <= 7) return { score, label: 'Strong', crackTime: '1,200 years', color: 'text-cyan-400', barBg: 'bg-cyan-400', width: '75%' };
    return { score, label: 'Military-Grade (Quantum Resistant)', crackTime: '4.8 billion years', color: 'text-emerald-400', barBg: 'bg-emerald-400', width: '100%' };
  };

  const strengthResult = calculateStrength(testPassword);

  // Toggle checklist
  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const healthPercent = Math.round((completedChecks / Object.keys(checklist).length) * 100);

  // Send search query to demonstrate Senior Manager visibility
  const handlePerformSearch = (e) => {
    e.preventDefault();
    if (!mySearchQuery.trim()) return;

    // Detect risk level based on query
    let risk = 'low';
    let cat = 'Threat Knowledgebase Search';
    const lower = mySearchQuery.toLowerCase();
    if (lower.includes('password') || lower.includes('passkey') || lower.includes('dump') || lower.includes('leak')) {
      risk = 'critical';
      cat = 'Sensitive Credential Query';
    } else if (lower.includes('bypass') || lower.includes('exploit') || lower.includes('hack')) {
      risk = 'elevated';
      cat = 'Red Team Query';
    }

    addEmployeeSearch(mySearchQuery, cat, risk);
    setSearchSuccess(true);
    setMySearchQuery('');
    setTimeout(() => setSearchSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-3.5 xs:p-5 sm:p-6 bg-[#0B0F19] border border-rose-500/20 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[9px] xs:text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                EMPLOYEE DEFENSE SUITE
              </span>
              <span className="text-[11px] sm:text-xs text-rose-300 font-mono">
                Workstation: {currentUser?.name} ({currentUser?.companyName})
              </span>
            </div>
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-white tracking-tight">
              Personal Security Utilities & Credentials Hardening
            </h1>
            <p className="text-[11px] xs:text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Equipped with high-entropy cryptographic password generation, real-time brute-force analyzers, 2-Factor hardware tokens, and workstation compliance checklists.
            </p>
          </div>

          {/* Personal Security Score Badge */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-900/80 border border-slate-800 rounded-xl self-start lg:self-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black font-mono text-emerald-400 text-xs sm:text-sm shrink-0">
              {healthPercent}%
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400">Security Score</span>
              <p className="text-xs font-bold text-white">
                {healthPercent >= 80 ? 'Highly Hardened' : 'Needs Attention'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Password Generator & Password Strength Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Tool 1: Interactive Password Generator */}
        <div className="p-3.5 xs:p-4 sm:p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Cryptographic Password Generator</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              CSPRNG ENTROPY
            </span>
          </div>

          {/* Generated Password Output Box */}
          <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 group hover:border-cyan-500/40 transition-all">
            <div className="font-mono text-base sm:text-lg text-cyan-300 font-bold break-all tracking-wider selection:bg-cyan-500 selection:text-black">
              {generatedPassword}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-900 text-xs">
              <span className="text-[11px] font-mono text-slate-400">
                Length: <strong className="text-white">{passwordLength}</strong> chars (~{(passwordLength * 6.5).toFixed(0)} bits entropy)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={generatePassword}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Generate New Password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => copyToClipboard(generatedPassword)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generator Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Password Length</span>
                <span className="font-mono text-cyan-400 font-bold">{passwordLength} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={passwordLength}
                onChange={(e) => setPasswordLength(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Checkbox Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-200">Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-200">Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-200">Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-200">Symbols (!@#$%)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tool 2: Password Strength & Crack Time Estimator */}
        <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Brute-Force & Crack-Time Analyzer</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              LIVE ENTROPY TEST
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Test any proposed password against GPU clusters cracking dictionaries (100 Billion hashes/sec benchmark).
          </p>

          {/* Test Input */}
          <div className="relative">
            <input
              type={showTestPassword ? 'text' : 'password'}
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Type password to evaluate..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowTestPassword(!showTestPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              {showTestPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Results Box */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Estimated Crack Time:</span>
              <strong className={`font-mono text-sm font-bold ${strengthResult.color}`}>
                {strengthResult.crackTime}
              </strong>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${strengthResult.barBg} transition-all duration-500`}
                style={{ width: strengthResult.width }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
              <span>Rating: <strong className={strengthResult.color}>{strengthResult.label}</strong></span>
              <span>Length: {testPassword.length} chars</span>
            </div>
          </div>

          {/* Security Checklist for password */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className={testPassword.length >= 14 ? 'text-emerald-400' : 'text-slate-600'}>✓</span>
              <span>Min 14 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/[0-9]/.test(testPassword) ? 'text-emerald-400' : 'text-slate-600'}>✓</span>
              <span>Contains numbers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/[A-Z]/.test(testPassword) ? 'text-emerald-400' : 'text-slate-600'}>✓</span>
              <span>Mixed casing (A-z)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={/[^A-Za-z0-9]/.test(testPassword) ? 'text-emerald-400' : 'text-slate-600'}>✓</span>
              <span>Special symbols</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2FA Management & Security Checklist & Interactive Search Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2FA Token Setup */}
        <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Two-Factor Authentication</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Hardware token and Authenticator app (Google Authenticator / YubiKey) synced.
          </p>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3 text-center">
            <div className="w-16 h-16 mx-auto rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">YubiKey / Authenticator Enrolled</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Algorithm: TOTP-SHA256 (30s interval)</p>
            </div>

            <button
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              {showBackupCodes ? 'Hide Recovery Codes' : 'View Emergency Recovery Codes'}
            </button>

            {showBackupCodes && (
              <div className="p-3 bg-black/90 rounded-lg border border-slate-800 font-mono text-xs text-purple-300 grid grid-cols-2 gap-1 text-center animate-fadeIn">
                {backupCodes.map((c, i) => (
                  <span key={i} className="p-1 bg-slate-900 rounded">{c}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Checklist & Workstation Posture */}
        <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>Workstation Security Checklist</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              {completedChecks} / 5 Done
            </span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'diskEncryption', label: 'Full Disk Encryption (FileVault / BitLocker)' },
              { id: 'mfaActive', label: 'FIDO2 / 2-Factor Enforced for All Accounts' },
              { id: 'passwordManager', label: 'Enterprise Credential Vault Synchronized' },
              { id: 'vpnConfigured', label: 'WireGuard Zero-Trust Tunnel Connected' },
              { id: 'phishingTrained', label: 'Q3 Anti-Phishing Simulation Completed' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <span className="text-slate-300">{item.label}</span>
                <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                  checklist[item.id] ? 'bg-emerald-500 text-black font-bold' : 'border border-slate-600 text-transparent'
                }`}>
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Knowledgebase Search (Connects to Senior Manager Log!) */}
        <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-400" />
              <span>Internal Threat Search</span>
            </h3>
            <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
              MONITORED
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Conduct threat lookups. Notice: Queries are recorded and visible to your company's Senior Manager dashboard in real-time.
          </p>

          <form onSubmit={handlePerformSearch} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={mySearchQuery}
                onChange={(e) => setMySearchQuery(e.target.value)}
                placeholder="e.g. CVE-2025-1082 patch, SOC2 compliance guide..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-md shadow-rose-600/20"
            >
              Search & Record Workstation Query
            </button>

            {searchSuccess && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Query logged! Check the Senior Manager view to see it in real-time.</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
