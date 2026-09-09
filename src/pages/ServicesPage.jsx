import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  Terminal, 
  Cloud, 
  Lock, 
  Flame, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Cpu, 
  Server, 
  Database, 
  Zap, 
  Sparkles,
  Building,
  Stethoscope,
  Coins,
  Radio
} from 'lucide-react';

export default function ServicesPage({ setCurrentPage, openEmergencyModal }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeIndustry, setActiveIndustry] = useState('fintech');

  const services = [
    {
      id: 'mdr-soc',
      category: 'managed',
      title: '24/7 Managed Detection & Response (MDR / SOC)',
      icon: Activity,
      tagline: 'Autonomous AI Telemetry Backed by Elite Human Threat Hunters',
      description: 'Continuous monitoring across endpoints, cloud workloads, identity providers, and network perimeters. We ingest and correlate over 50,000 security events per second to neutralize intrusions before lateral spread.',
      features: [
        'Continuous eBPF Kernel-level telemetry & host process inspection',
        'Automated sub-50ms host containment & network micro-isolation',
        '24/7/365 US & EU sovereign Security Operations Center (SOC)',
        'Full MITRE ATT&CK framework mapping & adversary profiling',
        'Real-time proactive threat hunting by senior CISSP certified analysts',
        'Bi-weekly vulnerability advisory & executive risk reporting'
      ],
      sla: '< 12-minute human response guarantee',
      deployment: 'Agentless or lightweight eBPF daemon in < 48 hours',
      bestFor: 'Enterprises needing 24/7 vigilance without building a $3M internal SOC'
    },
    {
      id: 'red-team',
      category: 'offensive',
      title: 'Offensive Red Teaming & Penetration Testing',
      icon: Terminal,
      tagline: 'Real-World Adversary Simulation by Certified Ethical Hackers',
      description: 'We attack your digital and physical perimeter using the exact tactics, techniques, and procedures (TTPs) of nation-state threat actors. Find your critical vulnerabilities before malicious actors weaponize them.',
      features: [
        'Full-scope Red Teaming simulating APT41, Cozy Bear, and BlackCat TTPs',
        'Web Application, API, and Microservice penetration audits (OWASP Top 10+)',
        'Cloud environment privilege escalation & lateral movement testing',
        'Physical facility breach simulation & custom rogue hardware implants',
        'Tailored spear-phishing, social engineering, and MFA fatigue assessments',
        'Remediation re-testing and developer walkthrough code-level workshops'
      ],
      sla: 'Zero false-positive report delivered in 5 business days',
      deployment: 'Scheduled on-demand or continuous quarterly testing',
      bestFor: 'Companies preparing for SOC 2, ISO 27001, IPO, or high-stakes audits'
    },
    {
      id: 'cloud-devsecops',
      category: 'cloud',
      title: 'Cloud Security Posture & DevSecOps Hardening',
      icon: Cloud,
      tagline: 'Defend AWS, Azure, and GCP Infrastructure from Code to Production',
      description: 'Automate compliance and posture management across multi-cloud environments. We integrate automated static analysis, container image scanning, and IAM least-privilege enforcement into your CI/CD pipeline.',
      features: [
        'Multi-cloud CSPM & CWPP (AWS, Google Cloud, Microsoft Azure)',
        'Kubernetes & Docker cluster security posture and runtime defense',
        'CI/CD pipeline automated SAST, DAST, and secret leakage gates',
        'Infrastructure as Code (Terraform/CloudFormation) drift prevention',
        'Ephemeral IAM credentials & zero standing cloud root permissions',
        'Automated misconfiguration auto-remediation (S3 buckets, SG rules)'
      ],
      sla: 'Real-time drift detection & auto-remediation in < 30 seconds',
      deployment: 'Native IAM read-only cross-account role in 30 minutes',
      bestFor: 'SaaS providers, cloud-native tech companies, and microservice architectures'
    },
    {
      id: 'dfir-response',
      category: 'incident',
      title: 'Incident Response & Digital Forensics (DFIR)',
      icon: Flame,
      tagline: 'Rapid Threat Eviction, Root-Cause Forensics, and Legal Evidence Safeguarding',
      description: 'When an active compromise occurs, every second determines survival. Our specialized crisis incident commanders intervene immediately to isolate attackers, preserve forensic evidence, and orchestrate safe recovery.',
      features: [
        'Emergency 24/7 crisis hotline with guaranteed 15-minute dispatch SLA',
        'Ransomware negotiation, decryption triage, and adversary communication',
        'Full-disk, volatile RAM, and cloud API forensic reconstruction',
        'Chain-of-custody evidentiary preservation admissible in federal courts',
        'Active adversary eviction without destroying operational business continuity',
        'Post-incident root cause analysis & board-level executive testimony'
      ],
      sla: '15-minute response SLA under active retainer',
      deployment: 'Instant remote containment or on-site deployment worldwide',
      bestFor: 'Organizations under active ransomware attack or maintaining crisis readiness'
    },
    {
      id: 'zero-trust',
      category: 'identity',
      title: 'Zero Trust Architecture & Phishing-Resistant IAM',
      icon: Lock,
      tagline: 'Never Trust, Always Continuously Verify Every Session and Actor',
      description: 'Transform obsolete perimeter castle-and-moat security into a microsegmented, zero-trust cryptographic fabric. Enforce device health attestation, hardware-bound tokens, and contextual access.',
      features: [
        'NIST SP 800-207 and CISA Zero Trust Maturity Model implementation',
        'Phishing-resistant WebAuthn, FIDO2, and YubiKey universal rollout',
        'Software-Defined Perimeter (SDP) replacing legacy insecure VPNs',
        'Internal network microsegmentation preventing lateral malware spread',
        'Continuous device posture verification (EDR health, OS patch, MDM status)',
        'Conditional access rules based on geolocation, risk score, and user role'
      ],
      sla: 'Sub-10 millisecond zero-trust policy evaluation latency',
      deployment: 'Phased rollout with zero downtime for remote employees',
      bestFor: 'Distributed workforces, remote enterprises, and regulated financial firms'
    },
    {
      id: 'compliance-vciso',
      category: 'governance',
      title: 'vCISO & Strategic Compliance Governance',
      icon: FileCheck,
      tagline: 'Executive Cyber Leadership and Audit Assurance at a Fraction of the Cost',
      description: 'Partner with seasoned former Chief Information Security Officers who steer your security roadmap, manage regulatory audits, prepare your board for cybersecurity oversight, and ensure bulletproof compliance.',
      features: [
        'End-to-end compliance readiness for SOC 2 Type II, ISO 27001, HIPAA, and PCI-DSS',
        'Quarterly cyber risk presentations tailored for Board of Directors and Audit Committees',
        'Comprehensive third-party vendor and supply chain risk assessments (TPCRM)',
        'Custom corporate security policy drafting and employee phishing drills',
        'Cyber insurance policy review to ensure claims eligibility and lower premiums',
        'M&A technical security due diligence for acquisitions and divestitures'
      ],
      sla: 'Dedicated senior executive available for all strategic decisions',
      deployment: 'Engagements from advisory retainer to interim CISO placement',
      bestFor: 'Startups, mid-market enterprises, and companies facing stringent regulatory audits'
    }
  ];

  const filteredServices = activeFilter === 'all' 
    ? services 
    : services.filter(s => s.category === activeFilter);

  const industryProfiles = {
    fintech: {
      name: 'Financial Services & FinTech',
      icon: Coins,
      challenge: 'High-frequency transaction security, SWIFT/ACH wire fraud prevention, PCI-DSS 4.0 compliance, and API credential stuffing defense.',
      solution: 'Sub-millisecond API anomaly inspection, hardware-backed transaction signing, zero-trust ledger separation, and continuous SEC/GLBA audit readiness.',
      highlight: 'Protected over $12B in daily liquidity across 22 global FinTech partners with zero wire compromises.'
    },
    healthcare: {
      name: 'Healthcare & Life Sciences',
      icon: Stethoscope,
      challenge: 'Ransomware extortion targeting clinical care systems, HIPAA patient records compliance, and insecure legacy medical IoT devices.',
      solution: 'Isolated medical VLAN microsegmentation, immutable EHR backup air-gapping, continuous PHI access auditing, and rapid ransomware kill-switch deployment.',
      highlight: 'Zero downtime achieved across 85 hospital clinics during widespread global healthcare ransomware campaigns.'
    },
    enterprise: {
      name: 'Critical Enterprise & SaaS',
      icon: Building,
      challenge: 'Supply chain poisoning, CI/CD pipeline compromise, distributed remote worker credential leaks, and nation-state APT espionage.',
      solution: 'Cryptographic software bill of materials (SBOM) validation, developer workstation isolation, and autonomous eBPF threat containment.',
      highlight: 'Eliminated lateral threat spread across 4,500 AWS microservices during an active zero-day supply chain advisory.'
    }
  };

  return (
    <div className="w-full min-h-screen py-10 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[450px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
        
        {/* Page Header - Responsive Font Sizing */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-mono mb-3 sm:mb-4 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Layers className="w-3.5 h-3.5" />
            <span>WHAT WE ARE PROVIDING</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Defense Capabilities Engineered for Unforgiving Realities
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base lg:text-lg mt-3 sm:mt-4 leading-relaxed max-w-3xl mx-auto">
            From autonomous real-time threat neutralization to offensive red-teaming and compliance governance, explore our modular defense portfolio.
          </p>
        </div>

        {/* Filter Pills - Swipeable on mobile with scrollbar-none, centered on desktop */}
        <div className="w-full overflow-x-auto scrollbar-none pb-3 mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:justify-center min-w-max px-1">
            {[
              { id: 'all', label: 'All Defense Practices' },
              { id: 'managed', label: '24/7 Managed SOC & MDR' },
              { id: 'offensive', label: 'Red Team & Pen Testing' },
              { id: 'cloud', label: 'Cloud & DevSecOps' },
              { id: 'identity', label: 'Zero Trust & IAM' },
              { id: 'incident', label: 'Incident Response (DFIR)' },
              { id: 'governance', label: 'vCISO & Compliance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-mono font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services List Grid - Full Width 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div 
                key={service.id}
                className="rounded-3xl bg-[#0A0E1A] border border-slate-800/90 hover:border-cyan-500/40 p-5 sm:p-8 md:p-10 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.12)]"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-right">
                      {service.deployment}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight mb-1.5 sm:mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-[11px] sm:text-xs font-mono text-cyan-400 mb-3 sm:mb-4">
                    {service.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 sm:mb-6">
                    {service.description}
                  </p>

                  {/* Capabilities List */}
                  <div className="space-y-2 sm:space-y-2.5 pt-4 border-t border-slate-800/80 mb-6">
                    <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      KEY DELIVERABLES & CONTROLS:
                    </p>
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-4 sm:pt-6 border-t border-slate-800/80 space-y-3 sm:space-y-4">
                  <div className="p-2.5 sm:p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>SLA Guarantee:</span>
                    <span className="text-emerald-400 font-semibold">{service.sla}</span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 text-xs sm:text-sm font-bold text-slate-200 hover:text-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request Scoping & Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Industry Specific Tailoring Section - Responsive Canvas */}
        <section className="mb-16 sm:mb-24 rounded-3xl bg-[#090D18] border border-slate-800 p-5 sm:p-8 md:p-12 relative overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs font-mono mb-2.5 sm:mb-3 border border-blue-500/30">
              <Building className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>INDUSTRY SPECIALIZATIONS</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Defenses Tailored to Your Regulatory Mandate
            </h2>
          </div>

          {/* Industry Tab Buttons - Scrollable on mobile */}
          <div className="w-full overflow-x-auto scrollbar-none pb-2 mb-6 sm:mb-8">
            <div className="flex sm:justify-center gap-2 sm:gap-3 min-w-max px-1">
              {Object.keys(industryProfiles).map((key) => {
                const item = industryProfiles[key];
                const active = activeIndustry === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveIndustry(key)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      active 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Industry Content Card */}
          <div className="w-full max-w-5xl mx-auto p-5 sm:p-8 rounded-2xl bg-[#060911] border border-slate-800 space-y-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400 uppercase tracking-wider">THREAT LANDSCAPE & CHALLENGE</span>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-1 leading-relaxed">
                {industryProfiles[activeIndustry].challenge}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 uppercase tracking-wider">THE VORTEX SOLUTION</span>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-1 leading-relaxed">
                {industryProfiles[activeIndustry].solution}
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs sm:text-sm text-cyan-300 flex items-start sm:items-center gap-2.5 sm:gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
              <span><strong>Proven Metric:</strong> {industryProfiles[activeIndustry].highlight}</span>
            </div>
          </div>
        </section>

        {/* Service Tiers / Comparison Table */}
        <section className="rounded-3xl bg-[#0A0E1A] border border-slate-800 p-5 sm:p-8 md:p-12 mb-16">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Transparent Defense Architecture Tiers
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-1.5 sm:mt-2">
              Select the level of coverage that matches your organization's threat profile and compliance scope.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Tier 1 */}
            <div className="p-5 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">TIER 01</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">Core Shield</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">Essential autonomous endpoint defense and automated vulnerability monitoring for fast-growing startups.</p>
                
                <div className="my-5 sm:my-6 pt-5 sm:pt-6 border-t border-slate-800/80 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Autonomous Endpoint EDR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>External Surface Scanning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Weekly CVE Alerts</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>✕ 24/7 Human Threat Hunting</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>✕ Dedicated Incident Commander</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Inquire About Core Shield
              </button>
            </div>

            {/* Tier 2 (Flagship) */}
            <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0e1628] to-[#0a101d] border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-[9px] sm:text-[10px] uppercase font-mono tracking-wider whitespace-nowrap">
                MOST DEPLOYED ENTERPRISE TIER
              </div>

              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">TIER 02</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">Sentinel Enterprise</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">Comprehensive 24/7 Managed SOC, threat hunting, annual penetration testing, and rapid incident response.</p>
                
                <div className="my-5 sm:my-6 pt-5 sm:pt-6 border-t border-cyan-500/30 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-200 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>24/7/365 Sovereign SOC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>&lt; 15-Minute Containment SLA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Annual Full-Scope Red Team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Multi-Cloud CSPM (AWS/Azure)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>SOC 2 & ISO 27001 Support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-cyan-400/20 cursor-pointer"
              >
                Schedule Sentinel Briefing
              </button>
            </div>

            {/* Tier 3 */}
            <div className="p-5 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">TIER 03</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">Sovereign Apex</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2">Air-gapped and custom-architected cyber defense operations for national infrastructure, defense contractors, and top-tier banks.</p>
                
                <div className="my-5 sm:my-6 pt-5 sm:pt-6 border-t border-slate-800/80 space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Dedicated Named Hunters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Air-Gapped / On-Prem Clustered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Continuous Adversary Emulation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Zero Standing Access Vaults</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Executive Crisis Flight Team</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Request Sovereign Consultation
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
