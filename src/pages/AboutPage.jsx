import React, { useState } from 'react';
import { 
  Compass, 
  Target, 
  Eye, 
  ShieldCheck, 
  Cpu, 
  Globe2, 
  Terminal, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Award, 
  Radio, 
  Sparkles,
  Zap,
  Building2
} from 'lucide-react';

export default function AboutPage({ setCurrentPage, openEmergencyModal }) {
  const [selectedMilestone, setSelectedMilestone] = useState(2026);

  const pillars = [
    {
      title: 'Offensive Knowledge Informs Defensive Mastery',
      icon: Terminal,
      description: 'You cannot protect a perimeter you do not know how to breach. Our offensive researchers continuously discover zero-days and emulate elite adversaries so our defensive filters block attacks before they are weaponized in the wild.',
      highlight: 'Over 80+ CVEs authored and responsibly disclosed to the global security community.'
    },
    {
      title: 'Autonomous Speed Trumps Manual Ticketing',
      icon: Zap,
      description: 'Modern ransomware encrypts a petabyte in under 18 minutes. Relying on humans to read alerts and file Jira tickets is obsolete. Our eBPF kernel sensors isolate compromised processes in milliseconds.',
      highlight: 'Sub-50 millisecond automated host containment across cloud and hybrid clusters.'
    },
    {
      title: 'Uncompromising Ethical Stewardship',
      icon: ShieldCheck,
      description: 'We believe that cybersecurity is a public trust. We never sell or monetize client telemetry, never engage in speculative FUD (Fear, Uncertainty, Doubt), and provide mathematically verified security architectures.',
      highlight: 'Zero third-party trackers, zero data harvesting, and 100% sovereign hosting options.'
    },
    {
      title: 'Post-Quantum Preparedness Today',
      icon: Lock,
      description: 'Nation-states are harvesting encrypted traffic today to decrypt tomorrow once quantum computing arrives. We implement NIST-approved post-quantum algorithms (ML-KEM / Kyber-768) into our telemetry grid now.',
      highlight: 'Quantum-resistant forward secrecy actively shielding all client data streams.'
    }
  ];

  const milestones = [
    {
      year: 2020,
      title: 'Genesis: Breaking the Antivirus Paradigm',
      summary: 'Founded in San Francisco by three former defensive cryptographers and red-team leaders. Engineered the first prototype of our autonomous eBPF kernel telemetry sensor.',
      stat: '5 founding engineers • First 10 Beta clients'
    },
    {
      year: 2022,
      title: 'Global SOC Expansion & 24/7 Threat Hunting',
      summary: 'Opened our dual Security Operations Centers in London and Silicon Valley, instituting a true follow-the-sun continuous vigilance model with guaranteed 15-minute response SLAs.',
      stat: '45+ Enterprise contracts • 500,000 threats neutralized'
    },
    {
      year: 2024,
      title: 'Autonomous Containment & Multi-Cloud Mesh',
      summary: 'Patented our Autonomous Threat Containment Engine, enabling instant microsegmentation and automatic isolation of ransomware without operational network downtime.',
      stat: '150+ Enterprises • $30B+ in client assets safeguarded'
    },
    {
      year: 2026,
      title: 'Quantum-Resilient Sovereign Defense Grid',
      summary: 'Rolled out post-quantum hybrid cryptographic handshakes across all 18 global edge sensor nodes, achieving full FedRAMP and SOC 2 Type II sovereign compliance.',
      stat: '2.4M+ daily threats neutralized • 0 client ransoms paid'
    }
  ];

  const nodes = [
    { city: 'San Francisco, USA', status: 'Optimal', latency: '4ms', load: '32%' },
    { city: 'London, United Kingdom', status: 'Optimal', latency: '6ms', load: '41%' },
    { city: 'Zurich, Switzerland', status: 'Optimal', latency: '8ms', load: '28%' },
    { city: 'Singapore, APAC', status: 'Optimal', latency: '12ms', load: '36%' },
    { city: 'Tokyo, Japan', status: 'Optimal', latency: '14ms', load: '30%' },
    { city: 'Frankfurt, Germany', status: 'Optimal', latency: '7ms', load: '39%' },
  ];

  return (
    <div className="w-full min-h-screen py-10 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[450px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-mono mb-3 sm:mb-4 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Compass className="w-3.5 h-3.5" />
            <span>GOALS & LONG-TERM VISION</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Securing the World’s Most Vital Digital Arteries
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base lg:text-lg mt-3 sm:mt-4 leading-relaxed max-w-3xl mx-auto">
            We are building an unyielding defensive grid where critical infrastructure, financial institutions, and innovative enterprises operate completely immune to cyber extortion.
          </p>
        </div>

        {/* Mission & Vision Dual Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-24">
          
          {/* Mission */}
          <div className="p-6 sm:p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#0c1424] to-[#070b13] border border-cyan-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>

              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                OUR CORE MISSION
              </span>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-2 mb-3 sm:mb-4">
                To Neutralize Adversaries Before Impact
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
                Our mission is to eliminate the asymmetry between cyber attackers and defenders. By fusing deep offensive research, kernel-level telemetry, and automated machine-speed mitigation, we empower organizations to survive and thrive regardless of adversary sophistication.
              </p>
            </div>

            <div className="mt-6 pt-5 sm:pt-6 border-t border-slate-800/80 flex items-center gap-2.5 text-xs sm:text-sm text-slate-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Zero-loss commitment for every actively monitored client</span>
            </div>
          </div>

          {/* Vision */}
          <div className="p-6 sm:p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#0b162c] to-[#070a14] border border-blue-500/30 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>

              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
                OUR LONG-TERM VISION
              </span>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-2 mb-3 sm:mb-4">
                A Resilient, Cryptographically Sovereign Future
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
                We envision a digital ecosystem where ransom payments are an obsolete historical anomaly. A world where cloud workloads, critical power grids, patient health databases, and financial systems verify every transaction with post-quantum zero trust and mathematical certainty.
              </p>
            </div>

            <div className="mt-6 pt-5 sm:pt-6 border-t border-slate-800/80 flex items-center gap-2.5 text-xs sm:text-sm text-slate-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Universal Zero-Trust and post-quantum encryption standards</span>
            </div>
          </div>

        </div>

        {/* 4 Guiding Principles */}
        <section className="mb-16 sm:mb-24">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] sm:text-xs font-mono mb-2.5 sm:mb-3">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>OPERATIONAL DOCTRINE</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white">
              The Four Principles That Guide Every Packet We Inspect
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 sm:p-8 md:p-10 rounded-3xl bg-[#090D18] border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>

                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">{pillar.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 text-[11px] sm:text-xs font-mono text-cyan-400 flex items-start sm:items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0" />
                    <span>{pillar.highlight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Milestones Timeline */}
        <section className="mb-16 sm:mb-24 rounded-3xl bg-[#0A0E1A] border border-slate-800 p-5 sm:p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs font-mono text-cyan-400 uppercase tracking-wider">THE JOURNEY</span>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white mt-1">
              Evolution of the Vortex Defense Grid
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-1.5 sm:mt-2">
              From our origins as an elite offensive research lab to securing global critical infrastructure.
            </p>
          </div>

          {/* Year Buttons - Touch Friendly */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 flex-wrap">
            {milestones.map((m) => (
              <button
                key={m.year}
                onClick={() => setSelectedMilestone(m.year)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedMilestone === m.year
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {m.year}
              </button>
            ))}
          </div>

          {/* Active Milestone Card */}
          {(() => {
            const active = milestones.find(m => m.year === selectedMilestone) || milestones[3];
            return (
              <div className="w-full max-w-4xl mx-auto p-5 sm:p-8 md:p-10 rounded-2xl bg-[#060911] border border-cyan-500/30 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">{active.title}</h3>
                  <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-400 font-mono text-[11px] sm:text-xs border border-cyan-500/30 self-start sm:self-auto">
                    YEAR {active.year}
                  </span>
                </div>

                <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-4 leading-relaxed">
                  {active.summary}
                </p>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs sm:text-sm font-mono text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{active.stat}</span>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Global Sensor Grid Status */}
        <section className="rounded-3xl bg-[#090D18] border border-slate-800 p-5 sm:p-8 md:p-12 mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>GLOBAL SENSOR NODES (18 ACTIVE REGIONS)</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Continuous High-Bandwidth Telemetry Network</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Aggregated Ingest: <strong className="text-cyan-400">142,000 eps</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {nodes.map((node, idx) => (
              <div key={idx} className="p-3.5 sm:p-4 rounded-xl bg-[#060911] border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{node.city}</h4>
                  <p className="text-[10.5px] sm:text-[11px] font-mono text-slate-400">
                    Latency: <span className="text-cyan-400">{node.latency}</span> • Load: {node.load}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Callout */}
        <div className="text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Join Forces with an Uncompromising Security Partner</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Ready to learn more about how our mission and architecture can fortify your enterprise against extortion and espionage?
          </p>
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                setCurrentPage('team');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer"
            >
              Meet Our Defense Team
            </button>
            <button
              onClick={() => {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Contact Our Architects
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
