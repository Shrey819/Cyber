import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Cloud, 
  Activity, 
  FileCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Cpu, 
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export default function HomePage({ setCurrentPage, openLoginModal }) {
  const [domainInput, setDomainInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleQuickScan = (e) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        domain: domainInput.trim(),
        score: 84,
        status: 'Protected',
        tlsGrade: 'A+',
        dnssec: 'Valid',
        portsOpen: 3
      });
    }, 1200);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase">
          <Shield className="w-3.5 h-3.5" />
          Autonomous Cyber Defense & Enterprise Security
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Protect Your Enterprise from Modern Cyber Threats.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Continuous vulnerability intelligence, multi-cloud posture management, and 24/7 security monitoring designed for high-assurance businesses.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage('services')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Security Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentPage('login')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-800"
          >
            Access Client Portal
          </button>
        </div>

        {/* Quick Diagnostic Search */}
        <div className="max-w-xl mx-auto pt-8">
          <form onSubmit={handleQuickScan} className="flex items-center bg-[#0B0F19] border border-slate-800 rounded-xl p-1.5 focus-within:border-cyan-500/60 shadow-xl">
            <Search className="w-4 h-4 text-slate-500 ml-3" />
            <input
              type="text"
              placeholder="Enter domain (e.g. yourcompany.com) to test TLS & perimeter..."
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="w-full px-3 py-2 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isScanning}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap disabled:opacity-50"
            >
              {isScanning ? 'Testing...' : 'Inspect'}
            </button>
          </form>

          {scanResult && (
            <div className="mt-4 p-4 bg-[#0B0F19] border border-cyan-500/30 rounded-xl text-left text-xs animate-fadeIn flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">{scanResult.domain}</span>
                <span className="text-[11px] text-slate-400">TLS: {scanResult.tlsGrade} • DNSSEC: {scanResult.dnssec} • Ports: {scanResult.portsOpen}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold block">Score: {scanResult.score}/100</span>
                <button onClick={() => setCurrentPage('services')} className="text-cyan-400 hover:underline text-[11px]">
                  Order Full VAPT Audit →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Core Pillars (Clean 4 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Comprehensive Security Infrastructure</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Everything your organization needs to satisfy regulatory compliance and eliminate threat vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B0F19] border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Vulnerability Testing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated DAST and API security scanning uncovering OWASP weaknesses before exploitation.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Cloud Armor (CSPM)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-cloud IAM least privilege and container security for AWS, Azure, and Google Cloud.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">24/7 Managed SOC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous threat hunting and rapid incident containment with dedicated security engineers.
            </p>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Audit & Compliance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated evidence gathering for ISO 27001, SOC 2 Type II, and Indian DPDP Act 2023.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Streamlined B2B Process */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="space-y-2">
            <span className="font-mono text-cyan-400 text-xs font-bold">STEP 01</span>
            <h4 className="text-sm font-bold text-white">Select Defense Modules</h4>
            <p className="text-xs text-slate-400">
              Browse our cybersecurity catalog in INR (₹) and configure team license seats.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-cyan-400 text-xs font-bold">STEP 02</span>
            <h4 className="text-sm font-bold text-white">B2B Checkout & Provisioning</h4>
            <p className="text-xs text-slate-400">
              Register with GSTIN and PIN code. The purchaser is immediately assigned as Customer Manager.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-cyan-400 text-xs font-bold">STEP 03</span>
            <h4 className="text-sm font-bold text-white">Delegate to Team</h4>
            <p className="text-xs text-slate-400">
              Manager assigns scanner and investigation tools to internal developers and employees.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
