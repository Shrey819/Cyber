import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Terminal, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Globe2, 
  Cpu, 
  Radio, 
  Fingerprint, 
  Copy, 
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer({ setCurrentPage, openLoginModal, openEmergencyModal }) {
  const { currentUser } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [copiedPgp, setCopiedPgp] = useState(false);

  const pgpFingerprint = "7B4F 9A21 88E0 4C3D E912 05BB F491 A8E7 392C 11D8";

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setNewsletterEmail('');
      }, 5000);
    }
  };

  const copyPgp = () => {
    navigator.clipboard.writeText(pgpFingerprint);
    setCopiedPgp(true);
    setTimeout(() => setCopiedPgp(false), 2500);
  };

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#05070D] border-t border-slate-800/80 text-slate-400 text-xs sm:text-sm relative overflow-hidden">
      {/* Background cyber grid & glow */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-12 sm:pt-16 pb-10 sm:pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 xl:gap-12 mb-10 sm:mb-14">
          
          {/* Column 1: Brand & Threat Philosophy */}
          <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1.5px] shadow-md shadow-cyan-500/20 shrink-0">
                <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">VORTEX</span>
                <span className="text-lg sm:text-xl font-light text-cyan-400 tracking-widest">CYBER</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Vortex Cyber Defense operates autonomous, AI-augmented telemetry and elite offensive security testing for Fortune 500 enterprises, critical infrastructure, and high-growth technology pioneers.
            </p>

            {/* Certifications Badge Row */}
            <div className="pt-2">
              <p className="text-[9.5px] sm:text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                ACCREDITED COMPLIANCE MATRICES
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {['SOC 2 TYPE II', 'ISO/IEC 27001', 'NIST CSF 2.0', 'HIPAA SECURE', 'GDPR', 'PCI-DSS 4.0'].map((cert) => (
                  <span 
                    key={cert}
                    className="text-[9.5px] sm:text-[10px] font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-slate-900/90 border border-slate-700/60 text-slate-300 shadow-sm"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* PGP Security Key block */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 max-w-md">
              <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>VORTEX SOC PGP FINGERPRINT</span>
                </span>
                <button
                  onClick={copyPgp}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 font-mono transition-colors cursor-pointer"
                >
                  {copiedPgp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPgp ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <code className="text-[9.5px] sm:text-[10px] font-mono text-slate-500 block truncate">
                {pgpFingerprint}
              </code>
            </div>
          </div>

          {/* Column 2: Solutions Navigation */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-3 sm:mb-4">
              DEFENSE SOLUTIONS
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                  <span>Managed Detection & Response (MDR)</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                  <span>Red Team & Penetration Testing</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                  <span>Cloud Posture & DevSecOps</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                  <span>Zero Trust & Microsegmentation</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                  <span>DFIR & Active Incident Response</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('services')} className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left">
                  <span>vCISO & Compliance Advisory</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Information */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-3 sm:mb-4">
              COMPANY & MISSION
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-cyan-300 transition-colors cursor-pointer text-left">
                  Goals & Long-Term Vision
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-cyan-300 transition-colors cursor-pointer text-left">
                  The Vortex Origin Story
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('team')} className="hover:text-cyan-300 transition-colors cursor-pointer text-left">
                  Our Security Engineers & CISOs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('team')} className="hover:text-cyan-300 transition-colors cursor-pointer text-left">
                  Vulnerability Research & CVEs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-cyan-300 transition-colors cursor-pointer text-left">
                  Global SOC Locations
                </button>
              </li>
              <li>
                <button onClick={openEmergencyModal} className="text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer text-left">
                  Emergency Breach Triage
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Threat Intelligence Bulletin Newsletter */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-3 sm:mb-4">
              THREAT INTELLIGENCE
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mb-3">
              Receive zero-day advisories, exploit breakdowns, and threat actor intelligence directly from our researchers.
            </p>

            {newsletterSubscribed ? (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed! You are on the priority security dispatch list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="ciso@company.com"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer"
                >
                  Subscribe to Intel Brief
                </button>
              </form>
            )}

            <div className="mt-3 sm:mt-4 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-[10.5px] sm:text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>100% Encrypted & Zero Spam</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-4">
            <p>© {new Date().getFullYear()} Vortex Cyber Defense Systems Inc. All rights reserved.</p>
            <span className="hidden md:inline text-slate-700">•</span>
            <button onClick={() => navigateTo('contact')} className="hover:text-slate-300 transition-colors">
              Responsible Disclosure
            </button>
            <span className="hidden md:inline text-slate-700">•</span>
            <button onClick={() => navigateTo('contact')} className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </button>
            <span className="hidden md:inline text-slate-700">•</span>
            <button onClick={() => navigateTo('contact')} className="hover:text-slate-300 transition-colors">
              SLA Terms
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10.5px] sm:text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GLOBAL SENSOR GRID: ACTIVE</span>
            </span>
            <button 
              onClick={currentUser ? () => navigateTo('dashboard') : openLoginModal}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
            >
              {currentUser ? `Dashboard (${currentUser.roleLabel.split(' ')[0]})` : 'Enterprise Sign In'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
