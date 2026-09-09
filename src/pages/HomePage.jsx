import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Radar, 
  Lock, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Eye, 
  Cpu, 
  Globe2, 
  Search, 
  Play, 
  ChevronRight,
  Sparkles,
  Layers,
  Database,
  Users
} from 'lucide-react';

import InteractiveGazeHero from '../components/InteractiveGazeHero';
import RadialRosetteCardDeck from '../components/RadialRosetteCardDeck';
import InteractiveBrandWordmark from '../components/InteractiveBrandWordmark';

export default function HomePage({ setCurrentPage, openLoginModal, openEmergencyModal }) {
  // Live simulated SOC feed lines
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, time: '19:42:02', level: 'INFO', msg: 'Zero-Trust Policy Engine: Verified TLS 1.3 handshake from 192.168.4.11' },
    { id: 2, time: '19:42:15', level: 'WARN', msg: 'Anomaly Detected: Lateral movement attempt via SMB from unmanaged host' },
    { id: 3, time: '19:42:16', level: 'BLOCKED', msg: 'Autonomous Containment: Host isolated via eBPF kernel filter in 38ms' },
    { id: 4, time: '19:42:28', level: 'INFO', msg: 'MITRE ATT&CK T1003 (OS Credential Dumping) mitigated successfully' },
  ]);

  useEffect(() => {
    const threats = [
      { level: 'BLOCKED', msg: 'DDoS mitigation: 42.8 Gbps SYN-flood packet dropped at edge router' },
      { level: 'INFO', msg: 'Cloud CSPM: Automatic remediation of IAM over-privileged role in AWS us-east-1' },
      { level: 'WARN', msg: 'Heuristic Alert: Suspicious PowerShell encoded script execution intercepted' },
      { level: 'BLOCKED', msg: 'Ransomware Canary Triggered: Process suspended, volume shadow copy restored' },
      { level: 'INFO', msg: 'Sovereign Threat Grid: 1,840 global threat feeds synchronized with local SIEM' },
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomThreat = threats[Math.floor(Math.random() * threats.length)];
      setTerminalLogs(prev => [
        ...prev.slice(1),
        { id: Date.now(), time: timeStr, level: randomThreat.level, msg: randomThreat.msg }
      ]);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Quick domain security scanner state
  const [scanDomain, setScanDomain] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleRunScan = (e) => {
    e.preventDefault();
    if (!scanDomain.trim()) return;
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      setScanResult({
        domain: scanDomain.trim(),
        score: 94,
        grade: 'A',
        ssl: 'TLS 1.3 Encrypted (Kyber-768 Hybrid)',
        dnssec: 'Valid DNSSEC Records Found',
        exposedPorts: '0 Critical Ports Exposed',
        headers: 'HSTS, CSP, X-Frame-Options Active',
        riskLevel: 'Low Surface Exposure',
      });
    }, 2000);
  };

  return (
    <div className="w-full relative min-h-screen overflow-hidden">
      
      {/* FEATURE 1: Interactive Mouse-Gaze Video & Typewriter Section */}
      <InteractiveGazeHero
        badge="AUTONOMOUS CYBER DEFENSE MESH"
        subheading="Autonomous Threat Intelligence & Sovereign Zero-Trust Defense"
        typewriterText="Engineered for 99.999% sovereign uptime. Real-time autonomous eBPF kernel mitigation and sub-12 minute breach containment. What infrastructure are we safeguarding today?"
        ctaText="Request Security Audit"
        videoSrc="/videos/Character_horizontal_eye_scan.mp4"
        statusBadgeText="Vortex AI Sentinel • Biometric Watch"
        pills={[
          { id: "services", label: "24/7 Managed SOC & MDR" },
          { id: "services", label: "Offensive Red Teaming" },
          { id: "services", label: "Cloud DevSecOps & CSPM" },
          { id: "services", label: "Zero Trust Architecture" },
        ]}
        contactEmail="soc@vortex-defense.com"
        setCurrentPage={setCurrentPage}
        openEmergencyModal={openEmergencyModal}
      />

      {/* Hero Section: Live Telemetry & Mission Directive */}
      <section className="w-full relative pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[550px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-[140px] pointer-events-none"></div>
        <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none"></div>

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                <span>ACTIVE AUTONOMOUS PERIMETER SURVEILLANCE</span>
              </div>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.15] sm:leading-[1.1]">
                Defend What Matters.
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Before Adversaries
                </span>{' '}
                Breach It.
              </h1>

              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Autonomous threat intelligence, 24/7 Managed SOC, and elite offensive red-teaming designed to neutralize nation-state adversaries and zero-day exploits in under 12 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => {
                    setCurrentPage('services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-950" />
                  <span>Explore Security Solutions</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>

                <button
                  onClick={() => {
                    setCurrentPage('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Request Security Audit</span>
                </button>
              </div>

              <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-[10px] sm:text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>Zero-Trust Architecture</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>15-Min Containment SLA</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>100% Sovereign Data</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Kernel Terminal */}
            <div className="lg:col-span-5 w-full">
              <div className="relative rounded-2xl bg-[#090D18] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
                <div className="bg-[#05070D] px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="ml-1 sm:ml-2 text-[10.5px] sm:text-xs font-mono text-slate-400 flex items-center gap-1 sm:gap-1.5 truncate">
                      <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">vortex-soc-kernel://live</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-emerald-400 shrink-0">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ACTIVE</span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3 font-mono text-[10.5px] sm:text-xs">
                  <div className="text-slate-500 text-[9.5px] sm:text-[11px] pb-1.5 sm:pb-2 border-b border-slate-800/80 flex justify-between">
                    <span>SENSOR: APEX-GATEWAY-US</span>
                    <span>ML-CONFIDENCE: 99.9%</span>
                  </div>

                  <div className="space-y-2 min-h-[200px] sm:min-h-[220px]">
                    {terminalLogs.map((log) => (
                      <div key={log.id} className="p-2 sm:p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 leading-relaxed text-[10px] sm:text-[11.5px] animate-fadeIn">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <span className="text-slate-500 text-[9.5px] sm:text-[11px]">{log.time}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold ${
                              log.level === 'BLOCKED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : log.level === 'WARN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}
                          >
                            {log.level}
                          </span>
                        </div>
                        <p className="text-slate-300 break-words">{log.msg}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Radar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 animate-radar" />
                      <span className="hidden xs:inline">eBPF Heuristics Active</span>
                      <span className="xs:hidden">eBPF Active</span>
                    </div>
                    <button
                      onClick={openLoginModal}
                      className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      Console View
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Metrics Ribbon */}
      <section className="w-full border-y border-slate-800/80 bg-[#060910]/80 backdrop-blur-md py-6 sm:py-8 relative">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-2 sm:p-3">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-cyan-400 font-mono">
                2.4M+
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-0.5 sm:mt-1 font-medium">
                Threats Neutralized Daily
              </p>
            </div>
            <div className="p-2 sm:p-3">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-emerald-400 font-mono">
                &lt; 12 min
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-0.5 sm:mt-1 font-medium">
                Average Containment Time
              </p>
            </div>
            <div className="p-2 sm:p-3">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-blue-400 font-mono">
                99.999%
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-0.5 sm:mt-1 font-medium">
                SOC Availability SLA
              </p>
            </div>
            <div className="p-2 sm:p-3">
              <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-cyan-300 font-mono">
                $0
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 mt-0.5 sm:mt-1 font-medium">
                Ransom Paid by Clients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 2: 3D Radial Rosette Fanned Card Deck Carousel */}
      <RadialRosetteCardDeck
        eyebrow="DEFENSIVE ARCHITECTURE DOCTRINE"
        title="CORE SECURITY FUNDAMENTALS"
      />

      {/* Interactive External Perimeter Risk Scanner */}
      <section className="w-full py-14 sm:py-20 relative">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          <div className="w-full rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0c1220]/90 border border-cyan-500/30 p-5 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs font-mono mb-2.5 sm:mb-3 border border-cyan-500/30">
                <Search className="w-3 h-3" />
                <span>INTERACTIVE RECON DIAGNOSTIC</span>
              </div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Simulate Your Perimeter Defense Score
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 sm:mt-2">
                Evaluate how vulnerable your organization's web infrastructure, DNS records, and SSL endpoints appear to external threat actors.
              </p>
            </div>

            <form onSubmit={handleRunScan} className="max-w-2xl mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-3.5 text-slate-500 font-mono text-xs">
                    https://
                  </div>
                  <input
                    type="text"
                    required
                    value={scanDomain}
                    onChange={(e) => setScanDomain(e.target.value)}
                    placeholder="yourcompany.com"
                    className="w-full bg-[#070b13] border border-slate-700/80 rounded-xl pl-20 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scanning}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {scanning ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Scanning Surface...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Run Surface Scan</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {scanResult && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 md:p-8 rounded-2xl bg-[#070b14] border border-cyan-500/40 animate-fadeIn">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <span className="text-xl font-mono font-bold text-emerald-400">{scanResult.grade}</span>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white font-mono break-all">{scanResult.domain}</h4>
                      <p className="text-xs text-slate-400">External Recon Finished • Score: {scanResult.score}/100</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-mono font-semibold">
                    {scanResult.riskLevel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-5 sm:pt-6 text-xs font-mono">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-400">SSL / TLS Encryption:</span>
                    <span className="text-cyan-300">{scanResult.ssl}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-400">DNSSEC Integrity:</span>
                    <span className="text-emerald-400">{scanResult.dnssec}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-400">Firewall Perimeter:</span>
                    <span className="text-emerald-400">{scanResult.exposedPorts}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-400">Security Headers:</span>
                    <span className="text-cyan-300">{scanResult.headers}</span>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <p className="text-slate-400 text-center sm:text-left">
                    Want deep internal penetration testing & active credential leak monitoring?
                  </p>
                  <button
                    onClick={() => {
                      setCurrentPage('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request Full Pentest</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 sm:mt-6 text-[10px] sm:text-xs text-slate-500 font-mono">
              <span>Non-intrusive scan</span>
              <span>•</span>
              <span>100% Passive Recon</span>
              <span>•</span>
              <span>Zero Payload Execution</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Solutions Preview */}
      <section className="w-full py-14 sm:py-20 relative bg-[#060910]/50">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-mono mb-2.5 sm:mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>COMPREHENSIVE THREAT SPECTRUM</span>
              </div>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Architected for High-Stakes Environments
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm md:text-base mt-1.5 sm:mt-2 max-w-2xl">
                Deploy end-to-end cyber resilience across multi-cloud environments, distributed workstations, and sensitive digital infrastructure.
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentPage('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-xs sm:text-sm cursor-pointer group self-start md:self-auto"
            >
              <span>View All 6 Defense Practices</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#090D18] border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                  24/7 Managed SOC & MDR
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Continuous AI telemetry aggregation and human security triage. We inspect over 50,000 events/second and isolate unauthorized endpoints instantly.
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-400">
                <span>&lt;15m Response SLA</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#090D18] border border-slate-800/80 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
                  <Terminal className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                  Red Teaming & Offensive Pen Testing
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Battle-tested ethical hackers simulate nation-state breach paths, credential stuffing, API bypasses, and lateral privilege escalation.
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-blue-400">
                <span>CREST & OSCP Certified</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#090D18] border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-5 group-hover:bg-indigo-500/20 transition-colors">
                  <Lock className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                  Zero Trust Architecture & IAM
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Eliminate implicit perimeter trust. We enforce microsegmentation, cryptographic identity proofing, and continuous session posture verification.
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-indigo-400">
                <span>FIDO2 / NIST SP 800-207</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Legacy vs Autonomous Grid */}
      <section className="w-full py-14 sm:py-20 relative">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Why Traditional Security Solutions Fail
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-1.5 sm:mt-2">
              Legacy antivirus and reactive ticketing systems are built for yesterday's threats. Vortex was engineered for automated, AI-driven cyber warfare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Legacy IT & Antivirus Tools</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Signature-Based:</strong> Fails against novel polymorphic malware and zero-day memory exploits.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Alert Fatigue:</strong> Drowns internal teams in 5,000+ uncontextualized false positives every day.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Slow Ticketing:</strong> 24 to 48 hours mean time to contain a breach—long after exfiltration is complete.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Implicit Network Trust:</strong> Once inside the VPN, an attacker has open lateral access to internal servers.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-cyan-950/30 border border-cyan-500/40 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>The Vortex Autonomous Grid</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Heuristic & eBPF Telemetry:</strong> Detects kernel anomalies and memory injections in sub-50 milliseconds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Automated Triage:</strong> Contextual correlation eliminates 99.4% of false alerts before human review.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Sub-12 Minute Containment:</strong> Host micro-isolation executes autonomously while DFIR responders dispatch.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Zero-Trust Microsegmentation:</strong> Every packet, user identity, and token must be continuously validated.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Endorsements / Testimonials */}
      <section className="w-full py-14 sm:py-20 border-t border-slate-800/80 bg-[#060910]/80">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Defending Over $40 Billion in Client Assets
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-1.5 sm:mt-2">
              Read how leading institutions rely on Vortex Cyber to safeguard critical customer data and maintain flawless uptime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0f1c] border border-slate-800 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "During our Series C fundraise, our infrastructure faced a coordinated nation-state DDoS and credential brute-force storm. Vortex contained the threat in 8 minutes with zero downtime. They are our indispensable cyber shield."
              </p>
              <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 font-bold flex items-center justify-center font-mono text-xs shrink-0">
                  MN
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Marcus Vance</h4>
                  <p className="text-[11px] text-slate-400">Chief Information Security Officer, NexaPay Global</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0f1c] border border-slate-800 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "Vortex's offensive red team exposed three critical zero-day API authorization bypasses that two prior top-tier audit firms completely missed. Their technical rigor is extraordinary."
              </p>
              <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center font-mono text-xs shrink-0">
                  EL
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Dr. Elena Rostova</h4>
                  <p className="text-[11px] text-slate-400">VP of Engineering, BioGenesis Cloud Systems</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0f1c] border border-slate-800 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "Moving our 2,400 employees to full Zero-Trust seemed impossible until Vortex took the helm. Smooth rollout, zero productivity friction, and 100% compliance with SOC 2 Type II and HIPAA."
              </p>
              <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center font-mono text-xs shrink-0">
                  DK
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">David Kelling</h4>
                  <p className="text-[11px] text-slate-400">Director of Infrastructure, Meridian Logistics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 3: Giant Interactive Brand Wordmark with Hover Physics */}
      <InteractiveBrandWordmark
        primaryWord="VORTEX"
        secondaryWord="CYBER"
        primaryColor="text-slate-800"
        primaryHoverGlow="hover:text-white hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.95)] active:drop-shadow-[0_0_30px_rgba(255,255,255,1)]"
        secondaryColor="text-cyan-500/25"
        secondaryHoverGlow="hover:text-cyan-400 hover:drop-shadow-[0_0_35px_rgba(0,240,255,0.95)] active:drop-shadow-[0_0_30px_rgba(0,240,255,1)]"
        tagline="AUTONOMOUS THREAT INTELLIGENCE & ZERO-TRUST DEFENSE GRID"
      />

      {/* High-Impact Bottom Call To Action */}
      <section className="w-full py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-950 pointer-events-none"></div>
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-mono mb-4 sm:mb-6">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>ENTERPRISE ONBOARDING IN AS LITTLE AS 48 HOURS</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Stop Hoping Your Perimeter Holds.
            <br />
            <span className="text-cyan-400">Know It Does.</span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto mt-3 sm:mt-4 leading-relaxed">
            Speak directly with our senior defensive architects. Receive a comprehensive threat posture assessment tailored to your cloud and hybrid infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={() => {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_30px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              Schedule Security Briefing
            </button>

            <button
              onClick={openEmergencyModal}
              className="w-full sm:w-auto px-6 sm:px-6 py-3.5 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/50 transition-all cursor-pointer"
            >
              Report Active Incident (24/7)
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
