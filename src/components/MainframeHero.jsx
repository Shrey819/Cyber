import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Copy, Check, Shield, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Custom hook for typewriter effect with configurable start delay and typing speed
export function useTypewriter(
  text,
  speed = 28,
  startDelay = 350
) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId = null;
    setDisplayed("");
    setDone(false);

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

export default function MainframeHero({
  eyebrow = "AUTONOMOUS CYBER DEFENSE SYSTEM",
  subheading = "Autonomous Threat Intelligence, Zero-Trust Architecture & Continuous Auditing",
  headline = "Engineered for 99.999% sovereign uptime. Real-time autonomous eBPF kernel mitigation and sub-12 minute breach containment. What infrastructure are we safeguarding today?",
  ctaText = "Request Security Audit",
  videoUrl = "/videos/Character_horizontal_eye_scan.mp4",
  statusBadgeText = "Vortex Cyber Sentinel • Biometric Watch",
  navPills = [
    { label: "24/7 Managed SOC & MDR", url: "#" },
    { label: "Offensive Red Teaming", url: "#" },
    { label: "Cloud DevSecOps & CSPM", url: "#" },
    { label: "Zero-Trust Network Access", url: "#" },
  ],
  salesEmail = "soc@vortex-defense.com",
  salesEmailText = "Reach SOC Desk:",
  onCtaClick,
  onPillClick,
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const isSeekingRef = useRef(false);
  const targetProgressRef = useRef(0.5);
  const currentProgressRef = useRef(0.5);
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { displayed, done } = useTypewriter(headline, 28, 300);

  // Reveal pill buttons after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSeeked = () => {
    isSeekingRef.current = false;
  };

  // Video eye scan calibration:
  // 0.00s = Far Left, 0.78s = Exact Center Eye Contact, 1.90s = Far Right
  const SCAN_START = 0.00;
  const SCAN_CENTER = 0.78;
  const SCAN_END = 1.90;

  const calculateTargetTime = (progress) => {
    if (progress <= 0.5) {
      return SCAN_START + (progress / 0.5) * (SCAN_CENTER - SCAN_START);
    } else {
      return SCAN_CENTER + ((progress - 0.5) / 0.5) * (SCAN_END - SCAN_CENTER);
    }
  };

  // IntersectionObserver to pause tracking RAF when character frame is out of viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Set video frame statically to SCAN_CENTER if reduced motion is requested
  useEffect(() => {
    if (shouldReduceMotion && videoRef.current) {
      videoRef.current.currentTime = SCAN_CENTER;
      currentProgressRef.current = 0.5;
      targetProgressRef.current = 0.5;
    }
  }, [shouldReduceMotion]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      if (shouldReduceMotion) {
        video.currentTime = SCAN_CENTER;
        currentProgressRef.current = 0.5;
        targetProgressRef.current = 0.5;
        return;
      }
      const initialTime = calculateTargetTime(targetProgressRef.current);
      video.currentTime = initialTime;
      currentProgressRef.current = targetProgressRef.current;
    }
  };

  // Continuous animation loop for smooth eye-contact tracking on mouse pointer
  useEffect(() => {
    if (shouldReduceMotion || !isVisible) return;
    let animationFrameId;

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
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [shouldReduceMotion, isVisible]);

  // Track mouse/touch pointer relative to the character's center position on screen
  useEffect(() => {
    if (shouldReduceMotion) return;
    const updatePointerGaze = (clientX) => {
      const container = containerRef.current;
      let characterCenterX = window.innerWidth * 0.5;

      if (container) {
        const rect = container.getBoundingClientRect();
        characterCenterX = rect.left + rect.width * 0.5;
      }

      const deltaX = clientX - characterCenterX;

      let progress = 0.5;
      if (deltaX < 0) {
        const maxRangeLeft = Math.max(160, characterCenterX);
        const normalized = Math.max(-1, deltaX / maxRangeLeft);
        progress = 0.5 + normalized * 0.5;
      } else {
        const maxRangeRight = Math.max(160, window.innerWidth - characterCenterX);
        const normalized = Math.min(1, deltaX / maxRangeRight);
        progress = 0.5 + normalized * 0.5;
      }

      targetProgressRef.current = progress;
    };

    const handleMouseMove = (e) => {
      updatePointerGaze(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        updatePointerGaze(e.touches[0].clientX);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [shouldReduceMotion]);

  // Copy email handler
  const handleCopyEmail = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(salesEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  return (
    <div
      data-scene="mainframe-hero"
      className={`mainframe-hero-wrapper relative w-full rounded-2xl sm:rounded-3xl select-none overflow-hidden transition-colors duration-300 ${
        isLight
          ? "bg-gradient-to-b from-[#FAF9F6] via-white to-[#F5F3ED] text-slate-900 border border-slate-200/90 shadow-xl"
          : "bg-gradient-to-b from-[#0B0F19] via-[#090D16] to-[#060911] text-white border border-slate-800 shadow-2xl"
      }`}
    >
      <style>{`
        @keyframes mainframe-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .mainframe-cursor-blink {
          animation: mainframe-blink 1s step-end infinite;
        }
      `}</style>

      {/* Cyber Grid & Ambient Lighting */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isLight ? "cyber-grid opacity-25" : "cyber-grid opacity-20"
        }`}
      />
      <div
        className={`absolute top-0 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[140px] pointer-events-none ${
          isLight ? "bg-cyan-500/10" : "bg-cyan-500/15"
        }`}
      />

      {/* HERO SECTION CONTENT */}
      <div className="relative w-full py-8 xs:py-10 sm:py-14 md:py-16 px-4 xs:px-5 sm:px-8 md:px-10 lg:px-12 z-10">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT: Eyebrow, Heading & Typewriter Text */}
          <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left order-1">
            {/* Eyebrow Badge */}
            <div className="mb-3.5 select-none flex justify-center lg:justify-start">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                  isLight
                    ? "bg-cyan-500/15 text-cyan-900 border border-cyan-500/30 shadow-xs"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
                }`}
              >
                <Shield className="w-3.5 h-3.5 animate-pulse text-cyan-500" />
                <span>{eyebrow}</span>
              </span>
            </div>

            {/* Subheading Title */}
            <h2
              className={`font-black text-xl xs:text-2xl sm:text-3xl lg:text-[32px] leading-snug tracking-tight mb-3 transition-colors ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            >
              {subheading}
            </h2>

            {/* Typewriter Dynamic Copy */}
            <p
              className={`mb-5 min-h-[68px] sm:min-h-[76px] font-normal leading-relaxed text-sm xs:text-base sm:text-lg transition-colors ${
                isLight ? "text-slate-700" : "text-slate-300"
              }`}
            >
              {displayed}
              {!done && (
                <span
                  className={`inline-block w-[2px] h-[1.1em] align-middle ml-[2px] mainframe-cursor-blink ${
                    isLight ? "bg-slate-900" : "bg-cyan-400"
                  }`}
                />
              )}
            </p>

            {/* Primary Action Button */}
            {ctaText && (
              <div className="flex items-center justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    if (onCtaClick) onCtaClick();
                  }}
                  className={`inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer shadow-lg active:scale-95 group ${
                    isLight
                      ? "bg-slate-950 hover:bg-slate-800 text-white shadow-slate-900/20"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-cyan-500/25"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* MIDDLE: Centered Character Frame with Real-Time Gaze Tracking */}
          <div className="lg:col-span-4 flex items-center justify-center order-2">
            <div
              ref={containerRef}
              className={`relative w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[400px] lg:max-w-[420px] aspect-4/3 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                isLight
                  ? "border border-slate-300/80 shadow-2xl bg-[#EFECE6]"
                  : "border border-slate-700/70 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)] bg-[#070B13]"
              }`}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                preload="auto"
                onSeeked={handleSeeked}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full object-cover object-center pointer-events-none select-none"
              />

              {/* Status Badge */}
              <div
                className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-mono flex items-center gap-2 border shadow-md pointer-events-none select-none ${
                  isLight
                    ? "bg-slate-900/90 text-white border-white/20"
                    : "bg-slate-950/90 text-white border-cyan-500/30"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold tracking-wide">{statusBadgeText}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: High-Impact Category Actions & One-Click Contact */}
          <div className="lg:col-span-3 flex flex-col justify-center items-center lg:items-start order-3 w-full">
            <div
              className="grid grid-cols-1 xs:grid-cols-2 md:flex md:flex-row lg:flex-col md:flex-wrap gap-2.5 sm:gap-3 items-stretch lg:items-start w-full max-w-sm sm:max-w-md md:max-w-none mx-auto lg:mx-0"
              style={{
                opacity: pillsVisible ? 1 : 0,
                transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              {/* Category Nav Pills */}
              {navPills.map((pill, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    if (onPillClick) onPillClick(pill);
                  }}
                  className={`w-full md:w-auto inline-flex items-center justify-center text-center rounded-xl sm:rounded-full text-xs sm:text-sm px-4 sm:px-5 py-2.5 font-semibold transition-all duration-200 cursor-pointer last:odd:col-span-2 truncate ${
                    isLight
                      ? "bg-white text-slate-800 border border-slate-300 hover:bg-slate-950 hover:text-white hover:border-slate-950 shadow-xs"
                      : "bg-[#0F1420] text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-cyan-300 hover:border-cyan-500/40 shadow-sm"
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              {/* Reach Desk & Copy Email Pill */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className={`w-full md:w-auto inline-flex items-center justify-center text-center rounded-xl sm:rounded-full text-xs sm:text-sm px-4 sm:px-5 py-2.5 gap-2 font-semibold transition-all duration-200 cursor-pointer group last:odd:col-span-2 shadow-xs ${
                  isLight
                    ? "bg-slate-100/90 text-slate-900 border border-slate-400/60 hover:bg-slate-950 hover:text-white hover:border-slate-950"
                    : "bg-slate-900/60 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-cyan-400"
                }`}
                title={`Copy ${salesEmail}`}
              >
                <span className="truncate">
                  {salesEmailText}{" "}
                  <span className="underline underline-offset-2">
                    {salesEmail}
                  </span>
                  {copied && (
                    <span className="ml-1 text-[11px] font-bold text-emerald-500">
                      (copied!)
                    </span>
                  )}
                </span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
