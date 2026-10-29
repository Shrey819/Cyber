import React from 'react';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function Footer({ setCurrentPage, openLoginModal, openEmergencyModal }) {
  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#05070D] border-t border-slate-800/80 text-slate-400 text-xs pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        
        {/* Column 1: Company Profile */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">VORTEX CYBER</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enterprise cybersecurity platform providing automated vulnerability assessment, continuous cloud posture monitoring, and dedicated incident defense for modern businesses.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>Incorporated in India</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">CERT-In Aligned</span>
          </div>
        </div>

        {/* Column 2: Solutions & Services */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Products & Solutions</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition-colors">
                Web Application & API Shield
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition-colors">
                Cloud Armor (CSPM & CI/CD)
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition-colors">
                24/7 Managed SOC & MDR
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition-colors">
                Offensive Red Teaming
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition-colors">
                ISO 27001 & DPDP Audit Readiness
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform & Portals */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Access & Portals</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => navigateTo('login')} className="hover:text-cyan-400 transition-colors text-white font-medium flex items-center gap-1.5">
                <span>Client Organization Portal</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('login')} className="hover:text-cyan-400 transition-colors">
                Owner Management Backoffice
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('checkout')} className="hover:text-cyan-400 transition-colors">
                B2B License Checkout
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('about')} className="hover:text-cyan-400 transition-colors">
                Our Security Methodology
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo('contact')} className="hover:text-cyan-400 transition-colors">
                Request Security Briefing
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Operations */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Enterprise Support</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-300">security@vortexcyber.in</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-300">+91 (020) 6742-8900</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Cyber Gateway, BKC Bandra, Mumbai & Magarpatta Cyber City, Pune</span>
            </div>
            <div className="pt-1">
              <button 
                onClick={openEmergencyModal}
                className="px-3 py-1.5 bg-rose-950/40 border border-rose-600/40 hover:border-rose-500 text-rose-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
              >
                <span>Report Incident Breach (24/7)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} Vortex Cyber Technologies Pvt Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button onClick={() => navigateTo('about')} className="hover:text-white">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => navigateTo('about')} className="hover:text-white">Terms of Service</button>
          <span>•</span>
          <button onClick={() => navigateTo('contact')} className="hover:text-white">Compliance & Governance</button>
        </div>
      </div>
    </footer>
  );
}
