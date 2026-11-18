import React, { Component } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SuperDevDashboard from '../components/dashboard/roles/SuperDevDashboard';
import AdminManagerDashboard from '../components/dashboard/roles/AdminManagerDashboard';
import SeniorManagerDashboard from '../components/dashboard/roles/SeniorManagerDashboard';
import CompanyDevDashboard from '../components/dashboard/roles/CompanyDevDashboard';
import EmployeeDashboard from '../components/dashboard/roles/EmployeeDashboard';
import { Shield, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

import LoginPage from './LoginPage';

class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto my-12 bg-[#0B0F19] border border-rose-500/40 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Dashboard Encountered a Rendering Issue</h2>
          <p className="text-xs text-slate-400 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 text-left overflow-x-auto text-rose-300">
            {this.state.error?.message || 'Unknown dashboard render failure.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry View</span>
            </button>
            <button
              onClick={this.props.onLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch User</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DashboardPage({ onExitToSite }) {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={() => {}} 
        onExitToSite={onExitToSite} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header with Role Indicator and Switch User CTA */}
      <DashboardHeader 
        onExitToSite={onExitToSite} 
        onSwitchUser={() => logout()} 
      />

      {/* Dynamic Role-Based View Container with Error Boundary */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-2.5 xs:px-4 sm:px-6 md:px-10 lg:px-14 py-3 xs:py-5 sm:py-8 overflow-x-hidden">
        <DashboardErrorBoundary onLogout={() => logout()}>
          {currentUser.role === 'super_developer' && <SuperDevDashboard />}
          {(currentUser.role === 'owner_manager' || currentUser.role === 'admin_manager') && <AdminManagerDashboard />}
          {(currentUser.role === 'senior_manager' || currentUser.role === 'company_manager') && <SeniorManagerDashboard />}
          {(currentUser.role === 'company_developer' || (currentUser.role === 'employee' && (currentUser.roleLabel?.toLowerCase().includes('tech') || currentUser.securityClearance?.toLowerCase().includes('tech')))) && <CompanyDevDashboard />}
          {(currentUser.role === 'employee' && !(currentUser.roleLabel?.toLowerCase().includes('tech') || currentUser.securityClearance?.toLowerCase().includes('tech'))) && <EmployeeDashboard />}
        </DashboardErrorBoundary>
      </main>
    </div>
  );
}
