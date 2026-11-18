import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand, Layers, ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Card themes calibrated for both Dark and Light modes
const getThemeStyles = (isLight) => ({
  white: {
    cardBg: isLight
      ? "bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#f1f5f9]"
      : "bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#eef2f6]",
    cardBorder: isLight
      ? "border-slate-300/90 shadow-xl"
      : "border-slate-300/90 shadow-2xl",
    shadow: isLight
      ? "shadow-[0_15px_35px_-5px_rgba(0,0,0,0.12)]"
      : "shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]",
    pillBg: "bg-slate-950 text-white font-semibold",
    titleText: "text-slate-950",
    descText: "text-slate-700",
    numberText: "text-slate-500",
    divider: "border-slate-200",
  },
  blue: {
    cardBg: isLight
      ? "bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985]"
      : "bg-gradient-to-br from-[#0052fe] via-[#0047df] to-[#0235a8]",
    cardBorder: isLight
      ? "border-sky-300/50 shadow-xl"
      : "border-blue-400/40 shadow-2xl",
    shadow: isLight
      ? "shadow-[0_15px_35px_-5px_rgba(2,132,199,0.35)]"
      : "shadow-[0_20px_50px_-10px_rgba(0,82,254,0.45)]",
    pillBg: "bg-white text-[#0052fe] font-bold shadow-xs",
    titleText: "text-white",
    descText: "text-blue-100",
    numberText: "text-blue-200",
    divider: "border-white/20",
  },
  slate: {
    cardBg: isLight
      ? "bg-gradient-to-br from-[#334155] via-[#1e293b] to-[#0f172a]"
      : "bg-gradient-to-br from-[#1e293b] via-[#172033] to-[#0f172a]",
    cardBorder: isLight
      ? "border-slate-500/50 shadow-xl"
      : "border-slate-600/60 shadow-2xl",
    shadow: isLight
      ? "shadow-[0_15px_35px_-5px_rgba(15,23,42,0.3)]"
      : "shadow-[0_20px_50px_-10px_rgba(0,0,0,0.65)]",
    pillBg: "bg-slate-700/90 text-slate-100 border border-slate-500/50 font-semibold",
    titleText: "text-white",
    descText: "text-slate-300",
    numberText: "text-slate-400",
    divider: "border-white/15",
  },
  carbon: {
    cardBg: isLight
      ? "bg-gradient-to-br from-[#1e293b] via-[#111827] to-[#030712]"
      : "bg-gradient-to-br from-[#12161f] via-[#0d1118] to-[#07090e]",
    cardBorder: isLight
      ? "border-slate-700/80 shadow-xl"
      : "border-slate-700/70 shadow-2xl",
    shadow: isLight
      ? "shadow-[0_15px_35px_-5px_rgba(3,7,18,0.4)]"
      : "shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)]",
    pillBg: "bg-white/15 text-slate-100 border border-white/25 font-semibold",
    titleText: "text-white",
    descText: "text-slate-300",
    numberText: "text-slate-400",
    divider: "border-white/15",
  },
});

const CYBER_FUNDAMENTALS = [
  {
    id: "fund-1",
    tag: "ZERO TRUST",
    number: "01",
    title: "Why is continuous session verification mandatory over legacy perimeter VPNs?",
    description:
      "Legacy VPNs grant open lateral movement once through the perimeter. Zero Trust enforces continuous identity attestation, micro-posture verification, and ephemeral session tokens on every packet.",
    colorTheme: "blue",
  },
  {
    id: "fund-2",
    tag: "KERNEL DEFENSE",
    number: "02",
    title: "How does eBPF runtime process inspection halt memory injection in under 38ms?",
    description:
      "By running sandboxed bytecode verifiers directly in the OS kernel, eBPF intercepts unmanaged DLL injections and privilege escalations before user-space telemetry alerts trigger.",
    colorTheme: "slate",
  },
  {
    id: "fund-3",
    tag: "POST-QUANTUM",
    number: "03",
    title: "Why must hybrid Kyber-768 key exchanges be deployed before quantum decoders arrive?",
    description:
      "Nation-state adversaries actively harvest encrypted enterprise traffic today to decrypt post-Q-Day. Lattice cryptography provides immediate mathematical forward secrecy against Shor's algorithm.",
    colorTheme: "white",
  },
  {
    id: "fund-4",
    tag: "FORENSICS & DFIR",
    number: "04",
    title: "What makes volatile RAM reconstruction critical during active ransomware extortion?",
    description:
      "Modern double-extortion ransomware scrubs event logs before detonation. Deep volatile memory forensics extract active C2 beacon IP addresses and adversary decryption keys directly from memory tables.",
    colorTheme: "carbon",
  },
  {
    id: "fund-5",
    tag: "RED TEAMING",
    number: "05",
    title: "Why do automated compliance scanners miss 85% of multi-stage privilege escalation chains?",
    description:
      "Automated vulnerability scanners check static banner versions. Human ethical red teams chain subtle logic flaws, token impersonation, and trust relationships to simulate actual APT41 playbooks.",
    colorTheme: "blue",
  },
  {
    id: "fund-6",
    tag: "SUPPLY CHAIN",
    number: "06",
    title: "How does cryptographic SBOM validation prevent upstream software dependency poisoning?",
    description:
      "Cryptographic software bills of materials (CycloneDX/SPDX) guarantee reproducible builds and isolate malicious third-party open-source payload tampering prior to production pipeline deployment.",
    colorTheme: "slate",
  },
  {
    id: "fund-7",
    tag: "MICROSEGMENTATION",
    number: "07",
    title: "Why does identity-aware network microsegmentation prevent lateral ransomware spread?",
    description:
      "Enforcing strict East-West host-to-host isolation policies ensures a single compromised developer workstation cannot probe, exploit SMB, or pivot into Active Directory domain controllers.",
    colorTheme: "white",
  },
  {
    id: "fund-8",
    tag: "THREAT INTEL",
    number: "08",
    title: "Why is automated MITRE ATT&CK adversary mapping superior to static signature matching?",
    description:
      "Hashes and IP addresses change within minutes. Mapping observable adversary Tactics, Techniques, and Procedures (TTPs) identifies stealth attacker intrusion campaigns regardless of tooling.",
    colorTheme: "carbon",
  },
  {
    id: "fund-9",
    tag: "AIR-GAPPED VAULTS",
    number: "09",
    title: "How do immutable WORM storage vaults neutralize double-extortion malware?",
    description:
      "Write-Once-Read-Many (WORM) hardware immutability prevents ransomware operators with compromised root domain privileges from wiping, encrypting, or tampering with disaster recovery archives.",
    colorTheme: "blue",
  },
  {
    id: "fund-10",
    tag: "PERIMETER POSTURE",
    number: "10",
    title: "Why must external attack surface monitoring discover shadow cloud assets in under 60 minutes?",
    description:
      "Adversaries scan new IPv4 ranges within 15 minutes of DNS assignment. Continuous EASM flags misconfigured S3 buckets, exposed dev ports, and dangling CNAME subdomains instantly.",
    colorTheme: "slate",
  },
];

export default function TopFundamentals({
  eyebrow = "DEFENSE PRINCIPLES",
  title = "TOP 10 CYBER DEFENSE FUNDAMENTALS",
  subtitle = "Core engineering laws governing deterministic zero-trust, kernel-level containment, cryptographic forward secrecy, and enterprise resilience.",
  items = CYBER_FUNDAMENTALS,
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const themeStyles = getThemeStyles(isLight);

  const totalCards = items.length;
  // Initialize to 2 so card 03 is showcased front and center as in the screenshot
  const [activeIndex, setActiveIndex] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tossingCard, setTossingCard] = useState(null);
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Dynamic tilt angle during drag
  const dynamicRotate = useTransform([dragX, dragY], ([x, y]) => x * 0.07 + y * 0.02);

  // Clockwise fan step angle around center pivot (50% 50%)
  const STEP_ANGLE = 8.5;

  const triggerSwap = useCallback(
    (tossParams = null, direction = 1) => {
      if (isTransitioningRef.current || totalCards === 0) return;
      isTransitioningRef.current = true;
      setIsTransitioning(true);

      const currentCard = items[activeIndex];
      const finalOrder = totalCards - 1;
      const finalRotate = -finalOrder * STEP_ANGLE;

      const toss = tossParams || {
        dropX: 0,
        dropY: 0,
        dropRotate: 0,
        flyOutX: direction === 1 ? 380 : -380,
        flyOutY: 15,
      };

      setTossingCard({
        id: currentCard?.id || String(activeIndex),
        dropX: toss.dropX,
        dropY: toss.dropY,
        dropRotate: toss.dropRotate,
        flyOutX: toss.flyOutX,
        flyOutY: toss.flyOutY,
        finalRotate,
      });

      setActiveIndex((prev) =>
        direction === 1 ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
      );
      dragX.set(0);
      dragY.set(0);

      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = setTimeout(() => {
        setTossingCard(null);
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }, 530);
    },
    [activeIndex, items, totalCards, dragX, dragY]
  );

  const handleNext = useCallback(() => {
    triggerSwap(null, 1);
  }, [triggerSwap]);

  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current || totalCards === 0) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    dragX.set(0);
    dragY.set(0);
    setTossingCard(null);

    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      isTransitioningRef.current = false;
      setIsTransitioning(false);
    }, 380);
  }, [totalCards, dragX, dragY]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") handleNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  // Center-Pivot Clockwise Spiral Geometry
  const getCardStyle = (index) => {
    const order = (index - activeIndex + totalCards) % totalCards;
    const isFront = order === 0;
    const rotateAngle = isFront ? 0 : -order * STEP_ANGLE;
    const zIndex = 50 - order;
    const opacity = isFront ? 1 : Math.max(0.85, 1 - order * 0.015);
    return { isFront, rotateAngle, zIndex, opacity, order };
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);
    const dropX = info.offset.x;
    const dropY = info.offset.y;
    const dist = Math.hypot(dropX, dropY);
    const vel = Math.hypot(info.velocity.x, info.velocity.y);

    if (dist >= 45 || vel >= 180) {
      const isRight = dropX !== 0 ? dropX > 0 : info.velocity.x >= 0;
      const flyOutX = isRight ? Math.max(dropX + 160, 380) : Math.min(dropX - 160, -380);
      const flyOutY =
        dropY * 0.5 + (info.velocity.y ? Math.max(-80, Math.min(80, info.velocity.y * 0.08)) : 10);
      const dropRotate = dropX * 0.07 + dropY * 0.02;

      triggerSwap(
        {
          dropX,
          dropY,
          dropRotate,
          flyOutX,
          flyOutY,
        },
        1
      );
    } else {
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 28 });
      animate(dragY, 0, { type: "spring", stiffness: 400, damping: 28 });
    }
  };

  const activeFormattedNumber = String(activeIndex + 1).padStart(2, "0");
  const totalFormattedNumber = String(totalCards).padStart(2, "0");

  return (
    <section
      id="sec-top-fundamentals"
      className={`relative w-full py-10 xs:py-12 sm:py-16 md:py-20 rounded-2xl sm:rounded-3xl overflow-hidden select-none flex flex-col items-center border transition-colors duration-300 shadow-2xl ${
        isLight
          ? "bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] text-slate-900 border-slate-300/80"
          : "bg-gradient-to-b from-[#05070D] via-[#04060A] to-[#020306] text-white border-slate-800/80"
      }`}
    >
      {/* Background Ambient Glow & Cyber Grid */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] xs:w-[480px] sm:w-[650px] h-[380px] xs:h-[480px] sm:h-[650px] rounded-full blur-[140px] pointer-events-none transition-all duration-300 ${
          isLight ? "bg-cyan-500/10" : "bg-blue-600/15"
        }`}
      />
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isLight ? "cyber-grid opacity-25" : "cyber-grid opacity-15"
        }`}
      />

      {/* Header */}
      <div className="text-center mb-6 xs:mb-8 sm:mb-12 md:mb-14 z-10 px-4 max-w-3xl">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold mb-2.5 shadow-sm transition-colors ${
            isLight
              ? "bg-white/90 text-cyan-800 border border-cyan-400/30"
              : "bg-slate-900/90 text-cyan-400 border border-slate-800"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>{eyebrow}</span>
        </div>
        <h2
          className={`text-2xl xs:text-3xl sm:text-4xl font-black uppercase tracking-tight transition-colors ${
            isLight ? "text-slate-950" : "text-white"
          }`}
        >
          {title}
        </h2>
        <p
          className={`text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed transition-colors ${
            isLight ? "text-slate-600" : "text-slate-400"
          }`}
        >
          {subtitle}
        </p>
      </div>

      {/* Unified Deck Container - Center-Pivot Spiral */}
      <div className="relative w-full flex items-center justify-center min-h-[380px] xs:min-h-[410px] sm:min-h-[450px] md:min-h-[490px] pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6 z-10 overflow-visible px-2">
        <div className="relative w-[280px] xs:w-[310px] sm:w-[350px] md:w-[380px] h-[340px] xs:h-[370px] sm:h-[400px] md:h-[430px] flex items-center justify-center">
          {items.map((item, idx) => {
            const { isFront, rotateAngle, zIndex, opacity } = getCardStyle(idx);
            const themeKey = item.colorTheme || "white";
            const theme = themeStyles[themeKey] || themeStyles.blue;

            // 1. TOSSING CARD ANIMATION
            if (tossingCard && item.id === tossingCard.id) {
              return (
                <motion.div
                  key={`tossing-${tossingCard.id}`}
                  initial={{
                    x: tossingCard.dropX,
                    y: tossingCard.dropY,
                    rotate: tossingCard.dropRotate,
                    zIndex: 55,
                  }}
                  animate={{
                    x: [tossingCard.dropX, tossingCard.flyOutX, 0],
                    y: [tossingCard.dropY, tossingCard.flyOutY, 0],
                    rotate: [tossingCard.dropRotate, tossingCard.finalRotate],
                    zIndex: [55, 55, 40],
                    opacity: [1, 0.85, 0.85],
                  }}
                  transition={{
                    x: { duration: 0.52, times: [0, 0.36, 1], ease: ["easeOut", "easeInOut"] },
                    y: { duration: 0.52, times: [0, 0.36, 1], ease: ["easeOut", "easeInOut"] },
                    rotate: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
                    zIndex: { duration: 0.52, times: [0, 0.36, 1] },
                    opacity: { duration: 0.52, ease: "easeOut" },
                  }}
                  style={{
                    transformOrigin: "50% 50%",
                    touchAction: "none",
                  }}
                  className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 flex flex-col justify-between border ${theme.cardBorder} ${theme.cardBg} ${theme.shadow} pointer-events-none`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span
                      className={`text-[10px] sm:text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${theme.pillBg}`}
                    >
                      {item.tag}
                    </span>
                    <span className={`font-mono font-bold text-xs tracking-widest ${theme.numberText}`}>
                      {item.number || String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="my-auto py-2 sm:py-3">
                    <h3 className={`text-base xs:text-lg sm:text-xl md:text-[22px] font-black leading-snug sm:leading-tight tracking-tight ${theme.titleText}`}>
                      {item.title}
                    </h3>
                  </div>
                  <div className={`pt-2.5 sm:pt-3 border-t ${theme.divider} flex flex-col gap-1.5`}>
                    <p className={`text-[11px] sm:text-xs md:text-[13px] leading-relaxed line-clamp-3 ${theme.descText}`}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            }

            // 2. ACTIVE FRONT CARD
            if (isFront) {
              return (
                <motion.div
                  key={item.id || idx}
                  drag={!isTransitioning}
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.85}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  style={{
                    x: dragX,
                    y: dragY,
                    rotate: isDragging ? dynamicRotate : undefined,
                    zIndex: 50,
                    transformOrigin: "50% 50%",
                    touchAction: "none",
                  }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{
                    rotate: { duration: 0.32, ease: "easeOut" },
                  }}
                  className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 flex flex-col justify-between cursor-grab active:cursor-grabbing border ${theme.cardBorder} ${theme.cardBg} ${theme.shadow} backdrop-blur-sm`}
                  role="region"
                  aria-label={`Fundamental card ${idx + 1}: ${item.title}`}
                >
                  {/* Top Header Row */}
                  <div className="flex justify-between items-center gap-2">
                    <span
                      className={`text-[10px] sm:text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${theme.pillBg}`}
                    >
                      {item.tag}
                    </span>
                    <span className={`font-mono font-bold text-xs tracking-widest ${theme.numberText}`}>
                      {item.number || String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Main Question / Title */}
                  <div className="my-auto py-2 sm:py-3">
                    <h3 className={`text-base xs:text-lg sm:text-xl md:text-[22px] font-black leading-snug sm:leading-tight tracking-tight ${theme.titleText}`}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Bottom Answer / Technical Explanation */}
                  <div className={`pt-2.5 sm:pt-3 border-t ${theme.divider} flex flex-col gap-1.5`}>
                    <p className={`text-[11px] sm:text-xs md:text-[13px] leading-relaxed line-clamp-3 ${theme.descText}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Drag Prompt Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl sm:rounded-3xl flex items-center justify-center pointer-events-none">
                      <div className="px-3.5 py-1.5 rounded-full bg-black/90 text-white text-[11px] font-mono flex items-center gap-1.5 border border-white/20 shadow-xl">
                        <Hand className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                        <span>Release to swap card</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            }

            // 3. STACKED CARDS
            return (
              <motion.div
                key={item.id || idx}
                initial={{
                  rotate: rotateAngle,
                  opacity,
                }}
                onClick={() => {
                  if (!isTransitioningRef.current) {
                    setActiveIndex(idx);
                  }
                }}
                animate={{
                  rotate: rotateAngle,
                  opacity,
                }}
                transition={{
                  rotate: { duration: 0.32, ease: "easeOut" },
                }}
                style={{
                  zIndex,
                  transformOrigin: "50% 50%",
                }}
                className={`absolute inset-0 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 flex flex-col justify-between border cursor-pointer ${theme.cardBorder} ${theme.cardBg} ${theme.shadow} hover:opacity-100 transition-opacity`}
                role="button"
                tabIndex={0}
                aria-label={`Jump to card ${idx + 1}: ${item.tag}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (!isTransitioningRef.current) setActiveIndex(idx);
                  }
                }}
              >
                {/* Header peek */}
                <div className="flex justify-between items-center pointer-events-none">
                  <span
                    className={`text-[10px] sm:text-xs uppercase tracking-wider px-3 py-1 rounded-full ${theme.pillBg}`}
                  >
                    {item.tag}
                  </span>
                  <span className={`font-mono font-bold text-xs ${theme.numberText}`}>
                    {item.number || String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Question peek */}
                <div className="my-auto py-2 sm:py-3 pointer-events-none">
                  <h3 className={`text-base xs:text-lg sm:text-xl md:text-[22px] font-black leading-snug sm:leading-tight tracking-tight line-clamp-3 ${theme.titleText}`}>
                    {item.title}
                  </h3>
                </div>

                {/* Bottom line peek */}
                <div className={`pt-2.5 sm:pt-3 border-t ${theme.divider} flex flex-col gap-1.5 pointer-events-none`}>
                  <p className={`text-[11px] sm:text-xs md:text-[13px] leading-relaxed ${theme.descText} line-clamp-2`}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Swipe Controls & Counter */}
      <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2.5 sm:gap-3 z-10 px-4">
        <div
          className={`inline-flex items-center gap-4 sm:gap-5 px-5 sm:px-6 py-2 rounded-full border shadow-md transition-colors ${
            isLight
              ? "bg-white border-slate-300 text-slate-800"
              : "bg-slate-900 border-slate-800 text-slate-300"
          }`}
        >
          <button
            onClick={handlePrev}
            disabled={isTransitioning}
            className="p-1 hover:text-cyan-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-cyan-500" />
          </button>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-semibold">
            Swipe or Drag Deck
          </span>
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="p-1 hover:text-cyan-500 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-cyan-500" />
          </button>
        </div>

        {/* Counter & Indicator dots */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span
            className={`text-[11px] sm:text-xs font-mono tracking-widest ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              {activeFormattedNumber}
            </span>{" "}
            / {totalFormattedNumber}
          </span>
          <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!isTransitioningRef.current) setActiveIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? "w-5 sm:w-6 bg-cyan-500"
                    : isLight
                    ? "w-1.5 bg-slate-300 hover:bg-slate-400"
                    : "w-1.5 bg-slate-800 hover:bg-slate-600"
                }`}
                aria-label={`Jump to card ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
