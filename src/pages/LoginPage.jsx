import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Building2, 
  Users, 
  Code2, 
  Globe, 
  Sparkles,
  Fingerprint,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage({ onLoginSuccess, onExitToSite }) {
  const { login, roleCredentials = [], detectRole } = useAuth();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Live detection of role as user types
  const detectedRole = detectRole ? detectRole(userId) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    if (!userId.trim()) {
      setErrorMessage('Please enter your User ID or Role identifier (1-5).');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setAuthenticating(true);

    // Simulate authenticating against Zero-Trust RBAC gateway
    setTimeout(() => {
      const result = login(userId, password);
      setAuthenticating(false);

      if (result.success) {
        setSuccessInfo({
          roleNumber: result.roleNumber,
          roleLabel: result.roleLabel,
          user: result.user
        });

        // Short smooth transition to dashboard
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user);
          }
        }, 650);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 500);
  };

  const handleFillCredentials = (roleCred) => {
    setUserId(roleCred.defaultUserId);
    setPassword(roleCred.defaultPassword);
    setErrorMessage('');
    setSuccessInfo(null);
  };

  const getRoleIcon = (roleNum) => {
    switch (roleNum) {
      case 1: return <Cpu className="w-4 h-4 text-purple-400" />;
      case 2: return <Building2 className="w-4 h-4 text-amber-400" />;
      case 3: return <Users className="w-4 h-4 text-cyan-400" />;
      case 4: return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 5: return <KeyRound className="w-4 h-4 text-rose-400" />;
      default: return <Shield className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Background glow & cyber grid elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between border-b border-slate-800/80">
        <button 
          onClick={onExitToSite}
          className="flex items-center gap-2.5 group cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">VORTEX</span>
              <span className="text-lg font-light tracking-widest text-cyan-400">CYBER</span>
            </div>
            <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400 -mt-0.5">Enterprise RBAC Portal</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={onExitToSite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Public Website</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        
        {/* Left Side: Common Login Form */}
        <div className="w-full max-w-md bg-[#0D121F]/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.1)] backdrop-blur-xl relative">
          
          {/* Top subtle highlight line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-t-2xl" />

          {/* Form Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                Common Portal Gateway
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your User ID and password. The system automatically decides whether to grant access to <strong className="text-cyan-300">Role 1, 2, 3, 4, or 5</strong>.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successInfo && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Access Granted: Role {successInfo.roleNumber}</p>
                <p className="text-[11px] text-emerald-400">{successInfo.roleLabel} • Launching Dashboard...</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* User ID Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                  <span>User ID / Username</span>
                </label>
                
                {/* Real-time Role Detector pill */}
                {detectedRole && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold animate-fadeIn ${detectedRole.colorBadge}`}>
                    Role {detectedRole.roleNumber}: {detectedRole.roleLabel}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. superdev, adminmgr, seniormgr, companydev, employee (or 1-5)"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: You can enter role IDs (<code>1</code>, <code>2</code>, <code>3</code>, <code>4</code>, <code>5</code>) or handles (<code>superdev</code>, <code>adminmgr</code>, <code>seniormgr</code>, <code>companydev</code>, <code>employee</code>).
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Password</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">Default: password123</span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-950/80 border border-slate-700 hover:border-slate-600 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons: 2 in a row on mobile instead of full-width giant button */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="submit"
                disabled={authenticating}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {authenticating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="truncate">Verifying...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                    <span className="truncate">Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-200 shrink-0 hidden xs:inline" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onExitToSite}
                className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Public Site</span>
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9.5px] sm:text-[10px] text-slate-500 font-mono">
            <span>FIPS 140-3 ZERO-TRUST</span>
            <span className="text-cyan-400">SHA-256</span>
          </div>
        </div>

        {/* Right Side: Role Decision Guide & 1-Click Tester */}
        <div className="w-full max-w-xl space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Role Credentials & Quick-Fill</span>
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  5 ROLES
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Tap any role chip or card to auto-fill and test:
              </p>
            </div>
          </div>

          {/* Horizontal Role Selector Chips Bar for rapid 1-tap mobile selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            {roleCredentials.map((role) => {
              const isSelected = detectedRole?.roleNumber === role.roleNumber;
              return (
                <button
                  key={role.roleNumber}
                  type="button"
                  onClick={() => handleFillCredentials(role)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 font-bold shadow-sm'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`w-4 h-4 rounded text-[9px] font-bold text-white flex items-center justify-center bg-gradient-to-tr ${role.accentGrad}`}>
                    {role.roleNumber}
                  </span>
                  <span>{role.roleLabel.replace('Developer', 'Dev').replace('Manager', 'Mgr')}</span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Responsive Role Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {roleCredentials.map((role) => {
              const isSelected = detectedRole?.roleNumber === role.roleNumber;
              return (
                <div
                  key={role.roleNumber}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/95 border-cyan-400/80 shadow-[0_0_15px_rgba(0,240,255,0.12)] ring-1 ring-cyan-400/50'
                      : 'bg-[#0D121F]/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  {/* Top info */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono bg-gradient-to-tr ${role.accentGrad} text-white shadow`}>
                      {role.roleNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">
                          {role.roleLabel}
                        </span>
                        <span className="text-[9.5px] font-mono text-cyan-400 shrink-0">
                          #{role.roleNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {role.personName} • {role.company.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  {/* Credentials row + Quick button combined */}
                  <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-1.5 text-[9.5px] font-mono">
                    <div className="text-slate-400 truncate">
                      ID: <strong className="text-cyan-300">{role.defaultUserId}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFillCredentials(role)}
                      className="shrink-0 px-2 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      <span>Use Role {role.roleNumber}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-[10px] sm:text-[11px] flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              The backend RBAC automatically extracts the role from the submitted User ID and evaluates permissions.
            </span>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-[10px] font-mono text-slate-500 border-t border-slate-800/80">
        VORTEX CYBER DEFENSE • MULTI-TENANT RBAC ARCHITECTURE • ROLES 1 TO 5
      </footer>

    </div>
  );
}
