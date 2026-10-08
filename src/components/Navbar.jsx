import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Menu, 
  X, 
  Radio, 
  ChevronRight, 
  PhoneCall, 
  KeyRound, 
  ExternalLink, 
  Cpu, 
  Activity,
  LayoutDashboard,
  User,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ currentPage, setCurrentPage, openLoginModal, openEmergencyModal }) {
  const { currentUser } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'What We Provide' },
    { id: 'about', label: 'Goals & Vision' },
    { id: 'team', label: 'Our Team' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const navItems = currentUser 
    ? [...baseNavItems, { id: 'dashboard', label: 'Dashboard', isSpecial: true }]
    : baseNavItems;

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const roleBadgeColors = {
    super_developer: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    admin_manager: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    senior_manager: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    company_developer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    employee: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <>
      {/* Top Threat Telemetry / Status Bar */}
      <div className="w-full bg-[#05070B] border-b border-cyan-950/40 text-[10px] sm:text-xs py-1.5 px-3 sm:px-6 md:px-10 lg:px-14 xl:px-20 text-slate-400 font-mono flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap">
              DEFCON 5 NORMAL
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap">
            Threat Ingest: <span className="text-cyan-400">4,812 pkt/s</span>
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap">
            Global Honeypot: <span className="text-emerald-400">14ms</span>
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={openEmergencyModal}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold transition-colors duration-150 cursor-pointer text-[10px] sm:text-[11px]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="hidden xs:inline">24/7 Hotline:</span>
            <span>1-800-VORTEX-SOC</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav 
        className={`w-full sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#080B11]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-2.5 sm:py-3' 
            : 'bg-[#080B11]/80 backdrop-blur-md border-b border-slate-800/40 py-3 sm:py-4.5'
        }`}
      >
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <button 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-400 rounded-full blur-[2px] opacity-70"></div>
            </div>

            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  VORTEX
                </span>
                <span className="text-lg sm:text-xl md:text-2xl font-light tracking-widest text-cyan-400">
                  CYBER
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-slate-400 -mt-0.5">
                AUTONOMOUS THREAT DEFENSE
              </p>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 bg-slate-900/70 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-md">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 xl:px-5 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-semibold'
                      : item.isSpecial
                      ? 'text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.isSpecial && <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action CTA Buttons */}
          <div className="hidden sm:flex items-center gap-2 md:gap-2.5">
            {/* Theme Mode Switcher */}
            <ThemeToggle />

            <button
              onClick={openEmergencyModal}
              className="px-3 md:px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 hover:border-rose-500 transition-all duration-200 flex items-center gap-1.5 md:gap-2 cursor-pointer shadow-sm"
              title="Report an active security breach"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>Breach Response</span>
            </button>

            {currentUser ? (
              /* If logged in: Go to Dashboard CTA */
              <button
                onClick={() => handleNavClick('dashboard')}
                className="relative group px-3.5 md:px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 flex items-center gap-2 cursor-pointer border border-cyan-400/40"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>Dashboard ({currentUser.roleLabel.split(' ')[0]})</span>
                <ChevronRight className="w-3 h-3 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              /* If not logged in: Client Portal login button */
              <button
                onClick={() => handleNavClick('login')}
                className="relative group px-3.5 md:px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 flex items-center gap-1.5 md:gap-2 cursor-pointer border border-cyan-400/40"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-200" />
                <span>Client Portal</span>
                <ChevronRight className="w-3 h-3 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Mobile Menu & Quick Login Buttons */}
          <div className="flex sm:hidden items-center gap-1.5">
            <ThemeToggle />

            <button
              onClick={currentUser ? () => handleNavClick('dashboard') : () => handleNavClick('login')}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1"
            >
              {currentUser ? <LayoutDashboard className="w-3.5 h-3.5" /> : <KeyRound className="w-3.5 h-3.5" />}
              <span>{currentUser ? 'Portal' : 'Login'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden w-full bg-[#0a0e17] border-b border-cyan-500/20 px-4 sm:px-6 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="grid gap-1.5 pt-1">
              {navItems.map((item) => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm sm:text-base font-medium transition-colors ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                        : item.isSpecial
                        ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/20'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.isSpecial && <LayoutDashboard className="w-4 h-4 text-cyan-400" />}
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openEmergencyModal();
                }}
                className="py-2.5 px-2.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Emergency Hotline</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentUser) {
                    handleNavClick('dashboard');
                  } else {
                    handleNavClick('login');
                  }
                }}
                className="py-2.5 px-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/25 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{currentUser ? 'Dashboard' : 'Portal Login'}</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
