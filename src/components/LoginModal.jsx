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
  EyeOff
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [authMethod, setAuthMethod] = useState('sso'); // 'sso', 'credentials', 'passkey'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState('idle'); // 'idle', 'scanning', 'verified'

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthenticating(true);
    setTimeout(() => {
      setAuthenticating(false);
      setAuthSuccess(true);
    }, 1200);
  };

  const handlePasskey = () => {
    setPasskeyStatus('scanning');
    setTimeout(() => {
      setPasskeyStatus('verified');
      setTimeout(() => {
        setAuthSuccess(true);
      }, 800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#0D121F] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] scrollbar-none"
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

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1.5px]">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Enterprise Portal</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  FIPS 140-3
                </span>
              </h3>
              <p className="text-xs text-slate-400">Zero-Trust Identity & Access Verification</p>
            </div>
          </div>

          {authSuccess ? (
            /* Authenticated Preview State */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Identity Verified & Handshake Established</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Mutual TLS Session Key negotiated. In a live enterprise deployment, you would be routed to your dedicated SOC command center.
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Client Clearance:</span>
                  <span className="text-emerald-400">ENTERPRISE_ROOT</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Session Cipher:</span>
                  <span className="text-cyan-400">AES-256-GCM / Kyber-768</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Monitored Endpoints:</span>
                  <span className="text-white">1,420</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setAuthSuccess(false);
                  setPasskeyStatus('idle');
                  onClose();
                }}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Close & Return to Portal View
              </button>
            </div>
          ) : (
            /* Login Form Tabs */
            <div>
              {/* Method Switcher */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs mb-5">
                <button
                  onClick={() => setAuthMethod('sso')}
                  className={`py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    authMethod === 'sso' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Enterprise SSO
                </button>
                <button
                  onClick={() => setAuthMethod('credentials')}
                  className={`py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    authMethod === 'credentials' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Credentials
                </button>
                <button
                  onClick={() => setAuthMethod('passkey')}
                  className={`py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    authMethod === 'passkey' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FIDO2 / Key
                </button>
              </div>

              {/* SSO Provider Options */}
              {authMethod === 'sso' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 mb-2">Select your enterprise federated identity provider:</p>
                  
                  <button
                    onClick={() => {
                      setAuthenticating(true);
                      setTimeout(() => {
                        setAuthenticating(false);
                        setAuthSuccess(true);
                      }, 1000);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/70 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
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
                    onClick={() => {
                      setAuthenticating(true);
                      setTimeout(() => {
                        setAuthenticating(false);
                        setAuthSuccess(true);
                      }, 1000);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/70 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
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
                    onClick={() => {
                      setAuthenticating(true);
                      setTimeout(() => {
                        setAuthenticating(false);
                        setAuthSuccess(true);
                      }, 1000);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/70 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                        G
                      </div>
                      <span>Google Cloud Identity / Workspace</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              )}

              {/* Password & MFA Form */}
              {authMethod === 'credentials' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@vortex-defense.com"
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-slate-300">Master Secret / Password</label>
                      <a href="#reset" onClick={(e) => e.preventDefault()} className="text-[11px] text-cyan-400 hover:underline">
                        Hardware Reset?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 pr-9"
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

                  <button
                    type="submit"
                    disabled={authenticating}
                    className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
                  >
                    {authenticating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Negotiating Zero-Trust Handshake...</span>
                      </>
                    ) : (
                      <>
                        <span>Authenticate Portal Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Passkey / Hardware FIDO2 Authenticator */}
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
                      Insert your cryptographic hardware security key or touch your biometric sensor.
                    </p>
                  </div>

                  {passkeyStatus === 'idle' && (
                    <button
                      onClick={handlePasskey}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>Simulate Hardware Touch</span>
                    </button>
                  )}

                  {passkeyStatus === 'scanning' && (
                    <div className="p-3 bg-slate-900 rounded-lg border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>Reading hardware challenge nonce...</span>
                    </div>
                  )}

                  {passkeyStatus === 'verified' && (
                    <div className="p-3 bg-emerald-950/60 rounded-lg border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>FIDO2 Token Validated!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Security Advisory note */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 leading-tight">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Unauthorized access attempts are logged, geolocated, and automatically reported under 18 U.S.C. § 1030 Computer Fraud and Abuse Act.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
