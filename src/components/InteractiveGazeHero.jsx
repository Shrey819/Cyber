import React, { useState, useEffect, useRef } from "react";
import { Shield, Sparkles, ArrowRight, Check, Copy } from "lucide-react";

// Typewriter Hook
export function useTypewriter(text, speed = 28, startDelay = 400) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId = null;
    const timeoutId = setTimeout(() => {
      let currentIndex = 0;
      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayed(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setDone(true);
          if (intervalId) clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function InteractiveGazeHero({
  badge = "AUTONOMOUS CYBER DEFENSE MESH",
  subheading = "Autonomous Threat Intelligence & Sovereign Zero-Trust Defense",
  typewriterText = "Engineered for 99.999% sovereign uptime. Real-time autonomous eBPF kernel mitigation and sub-12 minute breach containment. What infrastructure are we safeguarding today?",
  ctaText = "Request Security Audit",
  videoSrc = "/videos/Character_horizontal_eye_scan.mp4",
  statusBadgeText = "Vortex AI Sentinel • Biometric Watch",
  pills = [
    { id: "services", label: "24/7 Managed SOC & MDR" },
    { id: "services", label: "Offensive Red Teaming" },
    { id: "services", label: "Cloud DevSecOps & CSPM" },
    { id: "services", label: "Zero Trust Architecture" },
  ],
  contactEmail = "soc@vortex-defense.com",
  setCurrentPage,
  openEmergencyModal,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const isSeekingRef = useRef(false);
  const targetProgressRef = useRef(0.5);
  const currentProgressRef = useRef(0.5);
  const [copied, setCopied] = useState(false);

  const { displayed, done } = useTypewriter(typewriterText, 25, 300);

  // Calibration timestamps from original video
  const SCAN_START = 0.0;
  const SCAN_CENTER = 0.78;
  const SCAN_END = 1.9;

  const calculateTargetTime = (progress) => {
    if (progress <= 0.5) {
      return SCAN_START + (progress / 0.5) * (SCAN_CENTER - SCAN_START);
    }
    return SCAN_CENTER + ((progress - 0.5) / 0.5) * (SCAN_END - SCAN_CENTER);
  };

  // Smooth gaze animation loop
  useEffect(() => {
    let animId;
    const tick = () => {
      const video = videoRef.current;
      if (video && !isSeekingRef.current) {
        const diff = targetProgressRef.current - currentProgressRef.current;
        if (Math.abs(diff) > 0.001) {
          currentProgressRef.current += diff * 0.45;
          const targetTime = Math.min(
            Math.max(SCAN_START, calculateTargetTime(currentProgressRef.current)),
            SCAN_END
          );
          if (Math.abs(video.currentTime - targetTime) > 0.008) {
            isSeekingRef.current = true;
            if ("fastSeek" in video && typeof video.fastSeek === "function") {
              try {
                video.fastSeek(targetTime);
              } catch {
                video.currentTime = targetTime;
              }
            } else {
              video.currentTime = targetTime;
            }
          }
        }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Pointer & Touch tracking
  useEffect(() => {
    const handleMove = (clientX) => {
      const container = containerRef.current;
      let center = window.innerWidth * 0.5;
      if (container) {
        const rect = container.getBoundingClientRect();
        center = rect.left + rect.width * 0.5;
      }
      const delta = clientX - center;
      let progress = 0.5;
      if (delta < 0) {
        const maxRange = Math.max(180, center);
        progress = 0.5 + Math.max(-1, delta / maxRange) * 0.5;
      } else {
        const maxRange = Math.max(180, window.innerWidth - center);
        progress = 0.5 + Math.min(1, delta / maxRange) * 0.5;
      }
      targetProgressRef.current = progress;
    };

    const onMouse = (e) => handleMove(e.clientX);
    const onTouch = (e) => e.touches.length && handleMove(e.touches[0].clientX);

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-24 bg-[#080B11] border-b border-slate-800/80 text-white overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none"></div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* Left: Text & Typewriter */}
          <div className="lg:col-span-4 flex flex-col items-start text-left space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10.5px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {badge}
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              {subheading}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base min-h-[76px] sm:min-h-[84px] leading-relaxed font-normal">
              {displayed}
              {!done && <span className="inline-block w-0.5 h-4 sm:h-5 bg-cyan-400 ml-1 animate-pulse align-middle" />}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (setCurrentPage) setCurrentPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] cursor-pointer group"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  if (openEmergencyModal) openEmergencyModal();
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <span>Report Incident</span>
              </button>
            </div>
          </div>

          {/* Center: Character Video with Real-Time Gaze Tracking */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div
              ref={containerRef}
              className="relative w-full max-w-[340px] xs:max-w-[390px] sm:max-w-[430px] lg:max-w-[460px] aspect-4/3 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.18)] bg-[#070B13] transition-transform duration-300 hover:scale-[1.015]"
            >
              <video
                ref={videoRef}
                src={videoSrc}
                muted
                playsInline
                preload="auto"
                onSeeked={() => (isSeekingRef.current = false)}
                className="w-full h-full object-cover pointer-events-none select-none"
              />

              {/* Pulsing Cyber Security Status Badge */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-[#080B13]/90 backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-mono flex items-center gap-2 border border-cyan-500/30 shadow-lg pointer-events-none select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-cyan-300 font-semibold">{statusBadgeText}</span>
              </div>

              {/* Top Gaze Tracker Live Indicator */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400 flex items-center gap-1.5 border border-slate-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>GAZE_TRACK: ON</span>
              </div>
            </div>
          </div>

          {/* Right: Floating Pill Links & Quick SOC Email Copy */}
          <div className="lg:col-span-3 flex flex-col gap-2.5 sm:gap-3 items-stretch lg:items-start w-full">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1">
              DIRECT DEFENSE CAPABILITIES
            </span>

            {pills.map((pill, i) => (
              <button
                key={i}
                onClick={() => {
                  if (setCurrentPage) setCurrentPage(pill.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-left inline-flex items-center justify-between bg-slate-900/80 hover:bg-cyan-500/15 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer group"
              >
                <span>{pill.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}

            {/* Email Copy Pill */}
            <button
              onClick={copyEmail}
              className="w-full inline-flex items-center justify-between bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all cursor-pointer mt-1"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400">SOC Dispatch:</span>
                <span className="text-cyan-400 underline font-mono text-xs truncate">{contactEmail}</span>
              </div>
              {copied ? (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
