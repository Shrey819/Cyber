import React, { useState } from 'react';
import { 
  Shield, 
  LogOut, 
  ChevronDown, 
  Globe, 
  Building2, 
  Users, 
  Cpu, 
  Code2, 
  KeyRound, 
  ExternalLink,
  Bell,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ onExitToSite }) {
  const { currentUser, logout, quickLogin, demoPersonas } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!currentUser) return null;

  const roleColorClasses = {
    super_developer: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    admin_manager: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    senior_manager: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    company_developer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    employee: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  const currentRoleClass = roleColorClasses[currentUser.role] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <header className="w-full bg-[#080B11]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl">
      {/* Top micro telemetry bar */}
      <div className="w-full bg-[#05070B] border-b border-slate-900 px-4 sm:px-8 py-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-400 font-semibold">SESSION AUTHENTICATED</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-400">Clearance: {currentUser.securityClearance}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400">Node IP: {currentUser.ipAddress}</span>
          <span className="text-cyan-400 font-semibold">FIPS 140-3 COMPLIANT</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onExitToSite}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            title="Return to Public Site"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">VORTEX</span>
                <span className="text-base font-light text-cyan-400">PORTAL</span>
              </div>
            </div>
          </button>

          <span className="hidden sm:inline text-slate-700">|</span>

          {/* Company context indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-200 font-semibold truncate max-w-[200px]">{currentUser.companyName}</span>
          </div>
        </div>

        {/* Right: Role Persona Switcher & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:border-cyan-400/60 shadow-sm"
              title="Switch demo persona"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline text-slate-400 font-mono text-[11px]">Role:</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-mono border font-bold ${currentRoleClass}`}>
                {currentUser.roleLabel}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0D121F] border border-cyan-500/30 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Quick Role Demo Switcher
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click to test any of the 5 role interfaces:
                  </p>
                </div>

                <div className="space-y-1 pt-1.5 max-h-[380px] overflow-y-auto scrollbar-none">
                  {demoPersonas.map((persona) => {
                    const isCurrent = currentUser.role === persona.roleKey;
                    return (
                      <button
                        key={persona.roleKey}
                        onClick={() => {
                          quickLogin(persona.roleKey);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left transition-colors flex items-start gap-2.5 cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono bg-gradient-to-tr ${persona.accentGrad} text-white`}>
                          {persona.title[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{persona.title}</span>
                            {isCurrent && <span className="text-[9px] font-mono text-cyan-400 font-bold">ACTIVE</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{persona.name} • {persona.company}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{persona.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white relative cursor-pointer"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0D121F] border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <span>NOTIFICATIONS</span>
                  <span className="text-cyan-400 font-bold">3 NEW</span>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                    <p className="text-slate-200 font-medium">Session mTLS Verified</p>
                    <span className="text-[10px] text-slate-500 font-mono">1 min ago • Zero-Trust Gateway</span>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                    <p className="text-slate-200 font-medium">Global Threat Defense: Defcon 5</p>
                    <span className="text-[10px] text-slate-500 font-mono">15 mins ago • Honeypot cluster</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exit to Public Website */}
          <button
            onClick={onExitToSite}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Return to Public Website"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
