import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Key, 
  Fingerprint, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Laptop, 
  ShieldAlert, 
  HelpCircle, 
  Eye, 
  EyeOff,
  Sparkles,
  Users,
  Cpu,
  Code2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, roleCredentials = [], detectRole } = useAuth();

  const [authMethod, setAuthMethod] = useState('credentials'); // default to 'credentials'
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authSuccess, setAuthSuccess] = useState(null);
  const [passkeyStatus, setPasskeyStatus] = useState('idle');

  if (!isOpen) return null;

  const detectedRole = detectRole ? detectRole(userId) : null;

  const handleCredentialsLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthSuccess(null);

    if (!userId.trim()) {
      setErrorMessage('Please enter your User ID or Role number (1-5).');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setAuthenticating(true);
    setTimeout(() => {
      const res = login(userId, password);
      setAuthenticating(false);

      if (res.success) {
        setAuthSuccess(res);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(res.user);
          }
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 600);
  };

  const handleFillCredentials = (role) => {
    setUserId(role.defaultUserId);
    setPassword(role.defaultPassword);
    setErrorMessage('');
    setAuthSuccess(null);
  };

  const handleSsoLogin = (provider) => {
    setAuthenticating(true);
    setTimeout(() => {
      setAuthenticating(false);
      // Default to Super Developer or Admin Manager
      const user = quickLogin('admin_manager');
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      onClose();
    }, 900);
  };

  const handlePasskey = () => {
    setPasskeyStatus('scanning');
    setTimeout(() => {
      setPasskeyStatus('verified');
      setTimeout(() => {
        const user = quickLogin('super_developer');
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
        onClose();
      }, 700);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0D121F] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative scanner bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px]">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Enterprise Portal</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  RBAC AUTH
                </span>
              </h3>
              <p className="text-xs text-slate-400">Multi-Tenant Identity & Access Management</p>
            </div>
          </div>

          {/* Method Switcher Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs mb-5">
            <button
              onClick={() => setAuthMethod('demo')}
              className={`py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                authMethod === 'demo' ? 'bg-cyan-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Roles Demo</span>
            </button>
            <button
              onClick={() => setAuthMethod('credentials')}
              className={`py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                authMethod === 'credentials' ? 'bg-cyan-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Credentials
            </button>
            <button
              onClick={() => setAuthMethod('sso')}
              className={`py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                authMethod === 'sso' ? 'bg-cyan-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              SSO
            </button>
            <button
              onClick={() => setAuthMethod('passkey')}
              className={`py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                authMethod === 'passkey' ? 'bg-cyan-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              FIDO2
            </button>
          </div>

          {/* TAB 1: 1-CLICK ROLE DEMO PRESETS */}
          {authMethod === 'demo' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Select a role to test its custom dashboard:</span>
                <span className="font-mono text-[10px] text-cyan-400">1-CLICK INSTANT LOGIN</span>
              </div>

              <div className="space-y-2">
                {demoPersonas.map((persona) => (
                  <button
                    key={persona.roleKey}
                    disabled={authenticating}
                    onClick={() => handleQuickDemoLogin(persona.roleKey)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-sm hover:shadow-cyan-500/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono bg-gradient-to-tr ${persona.accentGrad} text-white shadow`}>
                        {persona.title[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {persona.title}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border font-semibold ${persona.colorBadge}`}>
                            {persona.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {persona.company} • {persona.email}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {persona.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COMMON CREDENTIALS FORM */}
          {authMethod === 'credentials' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Authenticated as Role {authSuccess.roleNumber}: </span>
                    <span>{authSuccess.roleLabel}</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">User ID / Handle / Role (1-5)</label>
                  {detectedRole && (
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded border font-semibold animate-fadeIn ${detectedRole.colorBadge}`}>
                      Role {detectedRole.roleNumber}: {detectedRole.roleLabel}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. superdev, adminmgr, seniormgr, companydev, employee, or 1-5"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <span className="text-[10px] font-mono text-slate-400">Default: password123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter password"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-9 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Buttons for Roles 1 to 5 */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] font-mono space-y-1.5">
                <span className="text-slate-400 block font-semibold text-[10px]">Autofill Credentials for Roles 1 to 5:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {roleCredentials.map(role => (
                    <button
                      key={role.roleNumber}
                      type="button"
                      onClick={() => handleFillCredentials(role)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-[10px] cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <span className="w-3.5 h-3.5 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[9px]">
                        {role.roleNumber}
                      </span>
                      <span className="truncate">{role.roleLabel.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
              >
                {authenticating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Resolving Role 1-5 Clearance...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Assigned Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: SSO PROVIDERS */}
          {authMethod === 'sso' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">Select your enterprise federated identity provider:</p>
              
              <button
                onClick={() => handleSsoLogin('Okta')}
                disabled={authenticating}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    O
                  </div>
                  <span>Okta Identity Engine</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => handleSsoLogin('Azure')}
                disabled={authenticating}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                    M
                  </div>
                  <span>Microsoft Entra ID (Azure AD)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => handleSsoLogin('Google')}
                disabled={authenticating}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                    G
                  </div>
                  <span>Google Cloud Identity</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          )}

          {/* TAB 4: FIDO2 PASSKEY */}
          {authMethod === 'passkey' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative">
                <Fingerprint className={`w-8 h-8 ${passkeyStatus === 'scanning' ? 'text-cyan-300 animate-pulse' : 'text-cyan-400'}`} />
                {passkeyStatus === 'scanning' && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-cyan-400 animate-ping opacity-40"></span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">YubiKey / WebAuthn FIDO2</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Insert cryptographic hardware key or authenticate via biometrics.
                </p>
              </div>

              {passkeyStatus === 'idle' && (
                <button
                  onClick={handlePasskey}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Simulate Hardware Touch</span>
                </button>
              )}

              {passkeyStatus === 'scanning' && (
                <div className="p-3 bg-slate-900 rounded-lg border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Verifying hardware challenge token...</span>
                </div>
              )}

              {passkeyStatus === 'verified' && (
                <div className="p-3 bg-emerald-950/60 rounded-lg border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Token Verified! Launching Command Center...</span>
                </div>
              )}
            </div>
          )}

          {/* Security Advisory note */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 leading-tight">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Zero-Trust continuous posture verification active. All logins and tenant switches are logged.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
