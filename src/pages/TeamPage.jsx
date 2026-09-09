import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Award, 
  Terminal, 
  Lock, 
  Cpu, 
  ExternalLink, 
  ChevronRight, 
  ArrowRight, 
  FileCode, 
  Sparkles, 
  CheckCircle2, 
  Radio
} from 'lucide-react';

export default function TeamPage({ setCurrentPage, openEmergencyModal }) {
  const [selectedDomain, setSelectedDomain] = useState('all');

  const teamMembers = [
    {
      name: 'Dr. Evelyn Sterling',
      role: 'Chief Information Security Officer (CISO) & Co-Founder',
      domain: 'leadership',
      certs: ['CISSP', 'CISM', 'CISA'],
      bio: 'Former cyber operations advisor to national infrastructure task forces. With over 18 years in high-assurance defense, Dr. Sterling oversees Vortex’s autonomous SOC operations and sovereign compliance architecture.',
      focus: 'Enterprise Threat Governance, Zero-Trust Frameworks, Regulatory Defense',
      cveContribution: 'Lead contributor to NIST SP 800-207 Zero Trust Architecture guidance.',
      avatarInitial: 'ES',
      color: 'from-cyan-600 to-blue-600'
    },
    {
      name: 'Kaelen Vance',
      role: 'Head of Offensive Operations & Red Team Director',
      domain: 'offensive',
      certs: ['OSCP', 'OSCE', 'GXPN', 'CRTP'],
      bio: 'Two-time DEF CON CTF finalist and prolific zero-day researcher. Kaelen leads our adversary emulation team, simulating sophisticated APT intrusion playbooks against Fortune 100 perimeters.',
      focus: 'Kernel Exploitation, Active Directory Abuse, Firmware Reverse Engineering',
      cveContribution: 'Author of CVE-2023-38606 (Kernel Memory Boundary Bypass)',
      avatarInitial: 'KV',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      name: 'Dr. Tariq Al-Mansoor',
      role: 'Chief Cryptographer & Post-Quantum Architect',
      domain: 'cryptography',
      certs: ['PhD Applied Math', 'CISSP-ISSAP'],
      bio: 'Renowned researcher in lattice-based cryptography and post-quantum key exchange (ML-KEM / Kyber). Directs the cryptographic layer of the Vortex sovereign sensor mesh.',
      focus: 'Post-Quantum Handshakes, Homomorphic Encryption, Zero-Knowledge Proofs',
      cveContribution: 'NIST PQC Standardization Contributor & Co-Author of hybrid Kyber-X25519 draft.',
      avatarInitial: 'TA',
      color: 'from-indigo-600 to-purple-600'
    },
    {
      name: 'Sariyah Chen',
      role: 'Director of Incident Response & Digital Forensics (DFIR)',
      domain: 'incident',
      certs: ['GCFA', 'GNFA', 'GCIH', 'EnCE'],
      bio: 'Veteran incident commander who has personally orchestrated containment across 140+ active enterprise ransomware and nation-state intrusion incidents. Former federal digital forensics investigator.',
      focus: 'Volatile RAM Analysis, Adversary Eviction, Evidence Preservation for Prosecution',
      cveContribution: 'Published authoritative analysis on BlackCat & LockBit ransomware exfiltration decryptors.',
      avatarInitial: 'SC',
      color: 'from-rose-600 to-pink-600'
    },
    {
      name: 'Nikolai Voronin',
      role: 'Principal Threat Intelligence Analyst',
      domain: 'intelligence',
      certs: ['GCTI', 'GREM', 'CEH Master'],
      bio: 'Specializes in tracking Eastern European and Asia-Pacific Advanced Persistent Threat (APT) syndicates. Reverse engineers advanced evasion techniques and polymorphic malware loaders.',
      focus: 'Dark Web Telemetry, Ransomware Syndicate Tracking, YARA & Sigma Rule Generation',
      cveContribution: 'Discovered novel C2 beaconing protocol used in solar supply-chain campaigns.',
      avatarInitial: 'NV',
      color: 'from-amber-600 to-orange-600'
    },
    {
      name: 'Maya Lin',
      role: 'Lead Cloud Security & DevSecOps Architect',
      domain: 'cloud',
      certs: ['CCSP', 'AWS Security Specialty', 'CKA', 'HashiCorp Security'],
      bio: 'Pioneered infrastructure-as-code defense and automated compliance gating for hyperscale SaaS platforms. Designed our eBPF cloud runtime monitoring agent.',
      focus: 'Kubernetes Hardening, CI/CD Pipeline Shielding, Multi-Cloud Least Privilege',
      cveContribution: 'Architected open-source eBPF container anomaly detector with over 15K GitHub stars.',
      avatarInitial: 'ML',
      color: 'from-emerald-600 to-teal-600'
    }
  ];

  const filteredMembers = selectedDomain === 'all'
    ? teamMembers
    : teamMembers.filter(m => m.domain === selectedDomain);

  const certifications = [
    { code: 'CISSP', title: 'Certified Information Systems Security Professional', count: '14 Holders' },
    { code: 'OSCP', title: 'Offensive Security Certified Professional', count: '9 Holders' },
    { code: 'GXPN', title: 'GIAC Exploit Researcher and Advanced Penetration Tester', count: '6 Holders' },
    { code: 'GCFA', title: 'GIAC Certified Forensic Analyst', count: '8 Holders' },
    { code: 'CCSP', title: 'Certified Cloud Security Professional', count: '11 Holders' },
    { code: 'CEH', title: 'Certified Ethical Hacker Master', count: '12 Holders' },
  ];

  return (
    <div className="w-full min-h-screen py-10 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[450px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-mono mb-3 sm:mb-4 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Users className="w-3.5 h-3.5" />
            <span>ELITE DEFENSIVE & OFFENSIVE PRACTITIONERS</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            The Minds Protecting Your Perimeter
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base lg:text-lg mt-3 sm:mt-4 leading-relaxed max-w-3xl mx-auto">
            Our team comprises former intelligence cryptographers, CREST-certified red-teamers, and veteran DFIR incident commanders with decades of frontline experience.
          </p>
        </div>

        {/* Filter Pills - Swipeable on mobile */}
        <div className="w-full overflow-x-auto scrollbar-none pb-3 mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:justify-center min-w-max px-1">
            {[
              { id: 'all', label: 'Entire Operations Team' },
              { id: 'leadership', label: 'Executive Leadership' },
              { id: 'offensive', label: 'Offensive Red Team' },
              { id: 'cryptography', label: 'Post-Quantum & Crypto' },
              { id: 'incident', label: 'DFIR Incident Response' },
              { id: 'intelligence', label: 'Threat Intel & Malware' },
              { id: 'cloud', label: 'Cloud & DevSecOps' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDomain(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-mono font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedDomain === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Grid - Responsive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {filteredMembers.map((member, idx) => (
            <div 
              key={idx}
              className="rounded-3xl bg-[#0A0E1A] border border-slate-800/90 hover:border-cyan-500/40 p-5 sm:p-8 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.12)]"
            >
              <div>
                {/* Avatar & Certs Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${member.color} p-[1.5px] shadow-lg shrink-0`}>
                    <div className="w-full h-full bg-[#080B12] rounded-[14px] flex items-center justify-center">
                      <span className="text-sm sm:text-base font-bold font-mono text-white">{member.avatarInitial}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-1 sm:gap-1.5 max-w-[190px]">
                    {member.certs.map((cert) => (
                      <span 
                        key={cert}
                        className="text-[9.5px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  {member.name}
                </h3>
                <p className="text-[11px] sm:text-xs font-mono text-slate-400 mt-1 mb-3 sm:mb-4 leading-snug">
                  {member.role}
                </p>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 sm:mb-6">
                  {member.bio}
                </p>
              </div>

              {/* Research & Contribution Callout */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2.5 sm:space-y-3">
                <div className="text-[10.5px] sm:text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500 block text-[9.5px] sm:text-[10px] uppercase">Domain Specialization:</span>
                  <span className="text-slate-200">{member.focus}</span>
                </div>

                <div className="p-2.5 sm:p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] font-mono text-cyan-400 flex items-start gap-2">
                  <Award className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
                  <span className="leading-tight text-cyan-300/90">{member.cveContribution}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Global Security Certifications Matrix */}
        <section className="mb-16 sm:mb-24 rounded-3xl bg-[#090D18] border border-slate-800 p-5 sm:p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs font-mono text-cyan-400 uppercase tracking-wider">RIGOR & VERIFICATION</span>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white mt-1">
              Battle-Tested Industry Accreditations
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-1.5 sm:mt-2">
              Every analyst on our 24/7 watch holds elite, hands-on offensive and defensive technical credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {certifications.map((item) => (
              <div key={item.code} className="p-3.5 sm:p-4 rounded-xl bg-[#060911] border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white font-mono text-cyan-400">{item.code}</h4>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-400">{item.title}</p>
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-mono px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Careers Callout / Join the Defense Grid */}
        <section className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-[#0A0E1A] border border-cyan-500/30 p-5 sm:p-8 md:p-12 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2.5 sm:space-y-3 text-center lg:text-left max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs font-mono border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                <span>WE ARE EXPANDING OUR RESEARCH CORPS</span>
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white">
                Think You Have What It Takes to Defend the Grid?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
                We are actively hiring Senior Reverse Engineers, Kernel Exploit Analysts, and Tier-3 Threat Hunters. Remote worldwide with competitive compensation and autonomous research sabbaticals.
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Apply for Fellowship</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
