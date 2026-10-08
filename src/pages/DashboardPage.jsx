import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SuperDevDashboard from '../components/dashboard/roles/SuperDevDashboard';
import AdminManagerDashboard from '../components/dashboard/roles/AdminManagerDashboard';
import SeniorManagerDashboard from '../components/dashboard/roles/SeniorManagerDashboard';
import CompanyDevDashboard from '../components/dashboard/roles/CompanyDevDashboard';
import EmployeeDashboard from '../components/dashboard/roles/EmployeeDashboard';
import { Shield, KeyRound, Sparkles, ArrowRight } from 'lucide-react';

import LoginPage from './LoginPage';

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

      {/* Dynamic Role-Based View Container */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-2.5 xs:px-4 sm:px-6 md:px-10 lg:px-14 py-3 xs:py-5 sm:py-8 overflow-x-hidden">
        {currentUser.role === 'super_developer' && <SuperDevDashboard />}
        {currentUser.role === 'admin_manager' && <AdminManagerDashboard />}
        {currentUser.role === 'senior_manager' && <SeniorManagerDashboard />}
        {currentUser.role === 'company_developer' && <CompanyDevDashboard />}
        {currentUser.role === 'employee' && <EmployeeDashboard />}
      </main>
    </div>
  );
}
