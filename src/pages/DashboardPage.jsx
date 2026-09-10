import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SuperDevDashboard from '../components/dashboard/roles/SuperDevDashboard';
import AdminManagerDashboard from '../components/dashboard/roles/AdminManagerDashboard';
import SeniorManagerDashboard from '../components/dashboard/roles/SeniorManagerDashboard';
import CompanyDevDashboard from '../components/dashboard/roles/CompanyDevDashboard';
import EmployeeDashboard from '../components/dashboard/roles/EmployeeDashboard';
import { Shield, KeyRound, Sparkles, ArrowRight } from 'lucide-react';

export default function DashboardPage({ onExitToSite, openLoginModal }) {
  const { currentUser, quickLogin, demoPersonas } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md p-8 bg-[#0D121F] border border-cyan-500/30 rounded-2xl shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Authentication Required</h2>
            <p className="text-xs text-slate-400 mt-1">
              Please sign in to access your role-specific enterprise dashboard.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={openLoginModal}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>Open Enterprise Login</span>
            </button>

            <button
              onClick={onExitToSite}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Instant 1-Click Role Preview
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-left">
              {demoPersonas.map((p) => (
                <button
                  key={p.roleKey}
                  onClick={() => quickLogin(p.roleKey)}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 text-xs flex items-center justify-between text-slate-300 transition-all cursor-pointer group"
                >
                  <span className="font-semibold text-white">{p.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header with Role Switcher */}
      <DashboardHeader onExitToSite={onExitToSite} />

      {/* Dynamic Role-Based View Container */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8">
        {currentUser.role === 'super_developer' && <SuperDevDashboard />}
        {currentUser.role === 'admin_manager' && <AdminManagerDashboard />}
        {currentUser.role === 'senior_manager' && <SeniorManagerDashboard />}
        {currentUser.role === 'company_developer' && <CompanyDevDashboard />}
        {currentUser.role === 'employee' && <EmployeeDashboard />}
      </main>
    </div>
  );
}
