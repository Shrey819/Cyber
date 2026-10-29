import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  User, 
  Mail,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage({ onLoginSuccess, onExitToSite }) {
  const { login, registerUser, updateUserPassword, roleCredentials = [] } = useAuth();

  // Mode: 'login' | 'register' | 'update_password'
  const [viewMode, setViewMode] = useState('login');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    companyName: '',
    registrationNumber: '',
    pinCode: '',
    password: '',
    confirmPassword: '',
    role: 'senior_manager' // 'senior_manager' | 'company_developer' | 'employee'
  });

  // Update password state
  const [updateData, setUpdateData] = useState({
    email: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!loginInput.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your email/ID and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginInput, loginPassword);
      setLoading(false);

      if (res && res.success) {
        setSuccessMessage(`Authenticated as ${res.user.name} (${res.roleLabel || res.user.role})`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(res.user);
        }, 500);
      } else {
        setErrorMessage(res?.error || 'Invalid credentials. Please verify your email/ID and password.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Login failed. Please try again.');
    }
  };

  // 2. Handle User Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!regData.name || !regData.email || !regData.password) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }

    if (regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (regData.pinCode && !/^\d{6}$/.test(regData.pinCode)) {
      setErrorMessage('Please enter a valid 6-digit PIN code.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        role: regData.role,
        companyName: regData.companyName,
        registrationNumber: regData.registrationNumber,
        pinCode: regData.pinCode
      });
      setLoading(false);

      if (res && res.success) {
        setSuccessMessage('Account created successfully in Neon database! Logging you in...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(res.user);
        }, 600);
      } else {
        setErrorMessage(res?.error || 'Failed to create account.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  // 3. Handle Password Update
  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!updateData.email || !updateData.newPassword) {
      setErrorMessage('Please enter your email and new password.');
      return;
    }

    if (updateData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (updateData.newPassword !== updateData.confirmNewPassword) {
      setErrorMessage('Confirmation password does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserPassword(updateData.email, updateData.newPassword);
      setLoading(false);

      if (res && res.success) {
        setSuccessMessage(res.message || 'Your password has been updated in database! You can now log in.');
        setLoginInput(updateData.email);
        setLoginPassword(updateData.newPassword);
        setTimeout(() => setViewMode('login'), 1500);
      } else {
        setErrorMessage(res?.error || 'Failed to update password.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Password update request failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Top Bar */}
      <header className="w-full border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between z-20">
        <button
          onClick={onExitToSite}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight">VORTEX CYBER</span>
            <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">AUTHENTICATION GATEWAY</span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={onExitToSite}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60"
          >
            Back to Website
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
          
          {/* View Mode Switcher Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {viewMode === 'login' && 'Sign In to Your Account'}
              {viewMode === 'register' && 'Register New Organization / User'}
              {viewMode === 'update_password' && 'Update Your Account Password'}
            </h2>
            <p className="text-xs text-slate-400">
              {viewMode === 'login' && 'Enter your registered email and password to proceed.'}
              {viewMode === 'register' && 'Set up your credentials to manage tools and teams.'}
              {viewMode === 'update_password' && 'Enter your registered email and choose a new password.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email / User ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. marcus.mgr@apextech.com or adminmgr"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300 block">Password</label>
                  <button
                    type="button"
                    onClick={() => setViewMode('update_password')}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Forgot or Update Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setViewMode('register');
                  }}
                  className="text-cyan-400 font-bold hover:underline ml-1"
                >
                  Register New Account
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER WITH PASSWORD */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Corporate Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@company.in"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Cyber India Pvt Ltd"
                    value={regData.companyName}
                    onChange={(e) => setRegData({ ...regData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">GSTIN / PIN (6 digits)</label>
                  <input
                    type="text"
                    placeholder="400051"
                    maxLength={6}
                    value={regData.pinCode}
                    onChange={(e) => setRegData({ ...regData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Role in Organization</label>
                <select
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="senior_manager">Customer Manager (Primary Admin & Buyer)</option>
                  <option value="company_developer">Company Developer (Security & Scans)</option>
                  <option value="employee">Employee (Awareness & Reporting)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Set Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setViewMode('login');
                  }}
                  className="text-cyan-400 font-bold hover:underline ml-1"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: UPDATE PASSWORD */}
          {viewMode === 'update_password' && (
            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Registered Corporate Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={updateData.email}
                    onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  New Password (Min 6 characters) *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={updateData.newPassword}
                    onChange={(e) => setUpdateData({ ...updateData, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={updateData.confirmNewPassword}
                    onChange={(e) => setUpdateData({ ...updateData, confirmNewPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
              >
                Update & Save Password
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setViewMode('login');
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Credentials Footer */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            <span className="block mb-1.5 font-mono">Quick Demo Roles (Click to autofill):</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setLoginInput('owner@vortex.internal');
                  setLoginPassword('owner123');
                  setViewMode('login');
                }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 hover:border-amber-500 font-semibold"
              >
                Owner Manager (Singleton)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginInput('seniormgr');
                  setLoginPassword('manager123');
                  setViewMode('login');
                }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500"
              >
                Customer Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginInput('superdev');
                  setLoginPassword('superdev123');
                  setViewMode('login');
                }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 hover:border-purple-500"
              >
                Owner Tech
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 px-4 py-3 text-center text-[11px] text-slate-500">
        TLS 1.3 End-to-End Encrypted Authentication • Vortex Cyber Technologies Pvt Ltd
      </footer>
    </div>
  );
}
