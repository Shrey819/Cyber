import React, { useState } from 'react';
import { 
  Mail, 
  PhoneCall, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Lock, 
  HelpCircle,
  Radio
} from 'lucide-react';

export default function ContactPage({ openEmergencyModal }) {
  const [inquiryType, setInquiryType] = useState('assessment');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    endpoints: '500-2500',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedPgp, setCopiedPgp] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  const pgpKeyBlock = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Vortex Armor v4.2
mQENBF/h1mEBCADL7+K9kU5vX8L1z9WqY2R8mP3nK0lJ5vH4tG3bN2xM1wQ9pA8s
7D6fC5vB4nA3mZ2yX1wV0uT9sR8qP7oN6mL5kJ4iH3gF2eD1cB0aZ9yX8wV7uT6s
R5qP4oN3mL2kJ1iH0gF9eD8cB7aZ6yX5wV4uT3sR2qP1oN0mL9kJ8iH7gF6eD5cB
=9X1a
-----END PGP PUBLIC KEY BLOCK-----`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const copyPgp = () => {
    navigator.clipboard.writeText(pgpKeyBlock);
    setCopiedPgp(true);
    setTimeout(() => setCopiedPgp(false), 2500);
  };

  const offices = [
    {
      city: 'San Francisco (Headquarters)',
      address: '555 Mission St, Suite 2800, San Francisco, CA 94105',
      phone: '+1 (415) 890-4200',
      timeZone: 'UTC-7 (Pacific Standard)',
      coverage: 'North America SOC & Autonomous Labs'
    },
    {
      city: 'London',
      address: '25 Bank Street, Canary Wharf, London E14 5JP',
      phone: '+44 20 7946 0912',
      timeZone: 'UTC+0 (Greenwich Mean)',
      coverage: 'EMEA Sovereign Defense & DFIR Command'
    },
    {
      city: 'Zurich',
      address: 'Bahnhofstrasse 45, 8001 Zürich, Switzerland',
      phone: '+41 44 215 8800',
      timeZone: 'UTC+1 (Central European)',
      coverage: 'Post-Quantum & High-Assurance Banking SOC'
    },
    {
      city: 'Singapore',
      address: '1 Marina Boulevard, #28-00, Singapore 018989',
      phone: '+65 6712 3400',
      timeZone: 'UTC+8 (Singapore Standard)',
      coverage: 'Asia-Pacific Telemetry Grid & Threat Research'
    },
  ];

  const faqs = [
    {
      q: 'How quickly can Vortex deploy across our cloud and endpoint infrastructure?',
      a: 'Deployments take as little as 30 minutes for cloud telemetry (via read-only IAM cross-account roles in AWS, GCP, or Azure) and less than 48 hours for global workstation and server rollout using our lightweight agentless or eBPF kernel daemons.'
    },
    {
      q: 'Do you execute a mutual Non-Disclosure Agreement (NDA) prior to preliminary scoping?',
      a: 'Yes. All consultations and threat assessments are immediately governed by our standard unilateral or mutual NDA, guaranteeing that your architectural schematics, network diagrams, and vulnerability disclosures remain strictly confidential.'
    },
    {
      q: 'Can we schedule an unannounced adversary emulation (Red Team) against our team?',
      a: 'Absolutely. We routinely conduct unannounced double-blind red team operations to test whether your internal SOC and incident response workflows identify and contain real-world nation-state tactics (MITRE ATT&CK) under pressure.'
    },
    {
      q: 'How does Vortex safeguard client telemetry and proprietary logs?',
      a: 'All data in transit is encrypted using post-quantum hybrid ciphers (Kyber-768/TLS 1.3), and all stored telemetry is encrypted at rest using AES-256-GCM. Furthermore, client data is strictly segregated in sovereign regional VPCs with zero third-party telemetry sharing.'
    },
    {
      q: 'What is your guaranteed response time if our enterprise is actively attacked?',
      a: 'Under active Vortex Sentinel and Sovereign retainers, we commit to a guaranteed 15-minute response SLA. For prospective clients experiencing an emergency breach, our 24/7 hotline bridges you to an on-call incident commander in under 45 seconds.'
    }
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
            <Mail className="w-3.5 h-3.5" />
            <span>DIRECT SECURITY OPERATIONS ENGAGEMENT</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Initiate Contact with Our Defense Architects
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base lg:text-lg mt-3 sm:mt-4 leading-relaxed max-w-3xl mx-auto">
            Whether you need immediate breach containment, an offensive penetration audit, or 24/7 Managed SOC coverage, our senior cyber engineers are standing by.
          </p>
        </div>

        {/* Emergency Triage Quick Banner */}
        <div className="mb-10 sm:mb-14 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-950/70 via-[#160c18] to-slate-900 border border-rose-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_40px_rgba(225,29,72,0.15)]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <PhoneCall className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Active Ransomware or Security Breach In Progress?</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              </h4>
              <p className="text-[11px] sm:text-xs text-rose-200 mt-0.5">
                Bypass standard queue with our 24/7 Priority Emergency DFIR Hotline: <strong>+1 (800) 867-8397</strong>
              </p>
            </div>
          </div>

          <button
            onClick={openEmergencyModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-600/30 whitespace-nowrap cursor-pointer shrink-0 text-center"
          >
            Emergency Breach Dispatch
          </button>
        </div>

        {/* Main Grid: Form on Left, Offices & PGP on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 sm:mb-24">
          
          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-8 md:p-10 rounded-3xl bg-[#0A0E1A] border border-slate-800 shadow-2xl relative">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight mb-1.5 sm:mb-2">
                Request Scoping & Consultation
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 sm:mb-6">
                All communications are protected under mutual NDA and routed to cleared defensive personnel.
              </p>

              {submitted ? (
                <div className="py-10 sm:py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">Inquiry Received & Logged</h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-white">{formData.name}</span>. Your ticket has been assigned to a senior security architect (<span className="font-mono text-cyan-400">#VX-INQ-8812</span>). You will receive an encrypted briefing within 2 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', company: '', phone: '', endpoints: '500-2500', message: '' });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs sm:text-sm tracking-wide transition-all cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Inquiry Type Selector - Mobile friendly */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                      Inquiry Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'assessment', label: 'Security Assessment' },
                        { id: 'soc', label: '24/7 Managed SOC' },
                        { id: 'pentest', label: 'Red Team / Pen Test' },
                        { id: 'cloud', label: 'Cloud DevSecOps' },
                        { id: 'vciso', label: 'vCISO Advisory' },
                        { id: 'general', label: 'Other Inquiries' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setInquiryType(item.id)}
                          className={`py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-mono transition-all text-center cursor-pointer ${
                            inquiryType === item.id
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personal & Organization details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Connor"
                        className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="s.connor@enterprise.com"
                        className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Organization / Entity</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Cyberdyne Systems"
                        className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 392-0192"
                        className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Estimated Endpoints / Cloud Workloads
                    </label>
                    <select
                      value={formData.endpoints}
                      onChange={(e) => setFormData({ ...formData, endpoints: e.target.value })}
                      className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="under-100">Fewer than 100 Endpoints</option>
                      <option value="100-500">100 – 500 Endpoints</option>
                      <option value="500-2500">500 – 2,500 Endpoints (Mid-Enterprise)</option>
                      <option value="2500-10000">2,500 – 10,000 Endpoints</option>
                      <option value="10000+">10,000+ Endpoints (Global Enterprise / Sovereign)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Specific Requirements or Compliance Timeline
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Briefly describe your infrastructure (AWS, Azure, on-prem), required compliance targets (SOC 2, ISO, HIPAA), and timeline..."
                      className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                    ></textarea>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[10.5px] sm:text-xs text-slate-400 flex items-start sm:items-center gap-2 font-mono">
                    <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
                    <span>Transmitted via 256-bit TLS encryption with zero retention for non-authorized personnel.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Routing to Security Architect...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Transmit Encrypted Consultation Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Global Locations & PGP Block */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Office Locations */}
            <div className="p-5 sm:p-8 rounded-3xl bg-[#0A0E1A] border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
                <Building2 className="w-4 h-4" />
                <span>GLOBAL OPERATIONS HUBS</span>
              </div>

              <div className="space-y-3.5">
                {offices.map((office, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-[#070b13] border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white">{office.city}</h4>
                      <span className="text-[9.5px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {office.timeZone}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{office.address}</p>
                    <div className="pt-1.5 flex items-center justify-between text-[10.5px] sm:text-[11px] font-mono">
                      <span className="text-slate-500">{office.phone}</span>
                      <span className="text-emerald-400 text-[10px]">{office.coverage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PGP Key Disclosure Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0A0E1A] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] sm:text-xs uppercase tracking-wider font-semibold">
                  <Fingerprint className="w-4 h-4" />
                  <span>PUBLIC PGP DISCLOSURE KEY</span>
                </span>
                <button
                  onClick={copyPgp}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedPgp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPgp ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                For sensitive vulnerability disclosures, whistleblower submissions, or confidential crisis briefs, encrypt your communications using our official master PGP key:
              </p>

              <div className="p-3 bg-[#060910] rounded-xl border border-slate-800 text-[9.5px] sm:text-[10px] font-mono text-slate-500 overflow-x-auto select-all">
                <pre>{pgpKeyBlock}</pre>
              </div>
            </div>

          </div>

        </div>

        {/* Security FAQ Section */}
        <section className="rounded-3xl bg-[#0A0E1A] border border-slate-800 p-5 sm:p-8 md:p-12 mb-16">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-mono mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Enterprise Procurement & Deployment Clarifications
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl bg-[#070b13] border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:text-cyan-300 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
