import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand, Layers, Sparkles } from "lucide-react";

// Themes designed to match the alternating colors (White, Blue, Slate, Carbon)
const THEME_STYLES = {
  white: {
    cardBg: "bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#eef2f6]",
    cardBorder: "border-slate-300/90 shadow-2xl",
    shadow: "shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)]",
    pillBg: "bg-slate-900 text-white font-semibold",
    titleText: "text-slate-950",
    descText: "text-slate-600",
    numberText: "text-slate-400",
    divider: "border-slate-200",
  },
  blue: {
    cardBg: "bg-gradient-to-br from-[#0052fe] via-[#0047df] to-[#0235a8]",
    cardBorder: "border-blue-400/40 shadow-2xl",
    shadow: "shadow-[0_20px_50px_-10px_rgba(0,82,254,0.45)]",
    pillBg: "bg-white text-[#0052fe] font-bold",
    titleText: "text-white",
    descText: "text-blue-100/90",
    numberText: "text-blue-200/60",
    divider: "border-white/15",
  },
  slate: {
    cardBg: "bg-gradient-to-br from-[#1e293b] via-[#172033] to-[#0f172a]",
    cardBorder: "border-slate-600/60 shadow-2xl",
    shadow: "shadow-[0_20px_50px_-10px_rgba(0,0,0,0.65)]",
    pillBg: "bg-slate-700/80 text-slate-200 border border-slate-500/40 font-semibold",
    titleText: "text-white",
    descText: "text-slate-300",
    numberText: "text-slate-400",
    divider: "border-white/10",
  },
  carbon: {
    cardBg: "bg-gradient-to-br from-[#12161f] via-[#0d1118] to-[#07090e]",
    cardBorder: "border-slate-700/70 shadow-2xl",
    shadow: "shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)]",
    pillBg: "bg-white/10 text-slate-200 border border-white/20 font-semibold",
    titleText: "text-white",
    descText: "text-slate-400",
    numberText: "text-slate-500",
    divider: "border-white/10",
  },
};

const CYBER_CARDS = [
  {
    id: "1",
    tag: "Zero Trust",
    number: "01",
    title: "Why is continuous session verification mandatory over legacy perimeter VPNs?",
    description: "Legacy VPNs grant open lateral access once through the gate. Zero Trust requires continuous identity attestation and micro-posture verification on every single packet.",
    colorTheme: "white",
  },
  {
    id: "2",
    tag: "Kernel Defense",
    number: "02",
    title: "How does eBPF runtime process inspection halt memory injection in under 38ms?",
    description: "By running sandbox verifiers directly in the Linux/Windows OS kernel, eBPF catches unmanaged DLL injections and privilege escalations before user-space telemetry alerts trigger.",
    colorTheme: "blue",
  },
  {
    id: "3",
    tag: "Post-Quantum",
    number: "03",
    title: "Why must hybrid Kyber-768 key exchanges be deployed before quantum decoders arrive?",
    description: "Nation-state adversaries actively harvest encrypted enterprise traffic today to decrypt post-Q-Day. Lattice cryptography provides immediate mathematical forward secrecy.",
    colorTheme: "slate",
  },
  {
    id: "4",
    tag: "Forensics & DFIR",
    number: "04",
    title: "What makes volatile RAM reconstruction critical during active ransomware extortion?",
    description: "Modern ransomware scrubs event logs before detonation. Deep volatile memory forensics extract active C2 beacon IP addresses and adversary decryption keys.",
    colorTheme: "carbon",
  },
  {
    id: "5",
    tag: "Red Teaming",
    number: "05",
    title: "Why do automated compliance scanners miss 85% of multi-stage privilege escalation chains?",
    description: "Scanners check static banner versions. Human ethical hackers chain subtle logic flaws, token impersonation, and trust relationships to simulate actual APT41 playbooks.",
    colorTheme: "white",
  },
  {
    id: "6",
    tag: "Supply Chain",
    number: "06",
    title: "How does cryptographic SBOM validation prevent upstream software dependency poisoning?",
    description: "Cryptographic software bills of materials guarantee reproducible builds and isolate malicious third-party open-source payload tampering prior to production deployment.",
    colorTheme: "blue",
  },
  {
    id: "7",
    tag: "Microsegmentation",
    number: "07",
    title: "Why does subnet micro-isolation stop ransomware from jumping between hypervisors?",
    description: "Software-defined firewall micro-boundaries contain compromised containers or virtual machines, starving ransomware of lateral SMB, RDP, and RPC propagation paths.",
    colorTheme: "slate",
  },
  {
    id: "8",
    tag: "Cloud Posture",
    number: "08",
    title: "Why must over-privileged IAM cloud roles and permission leaks be auto-remediated in 30s?",
    description: "Automated cloud exploit scripts weaponize misconfigured security groups within minutes of exposure. Deterministic policy engines enforce least privilege instantly.",
    colorTheme: "carbon",
  },
  {
    id: "9",
    tag: "Edge Heuristics",
    number: "09",
    title: "Why run real-time anomaly inference at the network edge rather than central cloud SIEM?",
    description: "Centralized cloud ingest adds 5 to 30 seconds of transit delay. Local edge ML models detect and throttle high-speed volumetric attacks and credential stuffing in milliseconds.",
    colorTheme: "white",
  },
  {
    id: "10",
    tag: "Hardware FIDO2",
    number: "10",
    title: "How do hardware-bound security keys eliminate credential harvesting and session replay?",
    description: "FIDO2 WebAuthn keys bind cryptographic private nonces directly to the verified browser origin, rendering adversary reverse-proxy phishing completely ineffective.",
    colorTheme: "blue",
  },
];

export default function RadialRosetteCardDeck({
  eyebrow = "CORE ARCHITECTURE DOCTRINE",
  title = "TOP DEFENSE FUNDAMENTALS",
  cards = CYBER_CARDS,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tossingCard, setTossingCard] = useState(null);
  const isTransitioningRef = useRef(false);
  const totalCards = cards.length;

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Dynamic tilt angle during drag
  const dynamicRotate = useTransform([dragX, dragY], ([x, y]) => x * 0.07 + y * 0.02);

  // Wider step angle: 8.5 degrees clockwise fan around center pivot
  const STEP_ANGLE = 8.5;

  const triggerSwap = useCallback((tossParams = null, direction = 1) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const currentCard = cards[activeIndex];
    const finalOrder = totalCards - 1; // 9 (bottom of the deck)
    const finalRotate = -finalOrder * STEP_ANGLE; // -76.5°

    const toss = tossParams || {
      dropX: 0,
      dropY: 0,
      dropRotate: 0,
      flyOutX: direction === 1 ? 390 : -390,
      flyOutY: 15,
    };

    // Card starts from the EXACT dropped position (dropX, dropY, dropRotate) without resetting
    setTossingCard({
      id: currentCard.id,
      dropX: toss.dropX,
      dropY: toss.dropY,
      dropRotate: toss.dropRotate,
      flyOutX: toss.flyOutX,
      flyOutY: toss.flyOutY,
      finalRotate,
    });

    // Advance to the NEXT card (1 -> 2 -> 3 -> 4... -> 10 -> 1)
    setActiveIndex((prev) => (direction === 1 ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards));
    dragX.set(0);
    dragY.set(0);

    // Settle into final resting slot at the bottom of the deck (smooth transition without mid-flight state interruptions)
    setTimeout(() => {
      setTossingCard(null);
      isTransitioningRef.current = false;
    }, 530);
  }, [activeIndex, cards, totalCards, dragX, dragY]);

  const handleNext = useCallback(() => {
    triggerSwap(null, 1);
  }, [triggerSwap]);

  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 350);
  }, [totalCards]);

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

  // Center-Pivot Clockwise Spiral Geometry: Pure Rotation around 50% 50%
  const getCardStyle = (index) => {
    const order = (index - activeIndex + totalCards) % totalCards;
    const isFront = order === 0;

    // Clockwise rotation: -order * 8.5deg gives generous spacing between layers
    const rotateAngle = isFront ? 0 : -order * STEP_ANGLE;

    // Z-Index descends from 50 down to 41
    const zIndex = 50 - order;

    // Subtle opacity for depth
    const opacity = isFront ? 1 : Math.max(0.85, 1 - order * 0.015);

    return { isFront, rotateAngle, zIndex, opacity, order };
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);

    // Capture the exact drop position in pixels where user released the card
    const dropX = info.offset.x;
    const dropY = info.offset.y;
    const dist = Math.hypot(dropX, dropY);
    const vel = Math.hypot(info.velocity.x, info.velocity.y);

    if (dist >= 48 || vel >= 200) {
      // User dropped with swipe intent: continue animation directly from (dropX, dropY, dropRotate)
      const isRight = dropX !== 0 ? dropX > 0 : info.velocity.x >= 0;
      const flyOutX = isRight ? Math.max(dropX + 160, 390) : Math.min(dropX - 160, -390);
      const flyOutY = dropY * 0.5 + (info.velocity.y ? Math.max(-80, Math.min(80, info.velocity.y * 0.08)) : 10);
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
      // User cancelled drag: smoothly spring back to center directly from current drop position
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 28 });
      animate(dragY, 0, { type: "spring", stiffness: 400, damping: 28 });
    }
  };

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#05070D] text-white overflow-hidden select-none flex flex-col items-center border-b border-slate-800/80">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none"></div>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 z-10 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-cyan-400 text-xs font-mono mb-3 shadow-md">
          <Layers className="w-3.5 h-3.5" />
          <span>{eyebrow}</span>
        </div>
        <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Swipe or drag the front card to watch it realistic fly out and tuck behind into the 10-card clockwise spiral.
        </p>
      </div>

      {/* 1 Unified Deck Container - Center-Pivot Clockwise Swirl (With Wider Separation & Realistic Tuck Under) */}
      <div className="relative w-full flex items-center justify-center min-h-[480px] xs:min-h-[520px] sm:min-h-[560px] md:min-h-[600px] py-6 z-10 overflow-visible">
        <div className="relative w-[280px] xs:w-[310px] sm:w-[350px] md:w-[390px] h-[390px] xs:h-[430px] sm:h-[470px] md:h-[510px] flex items-center justify-center">
          
          {cards.map((item, idx) => {
            const { isFront, rotateAngle, zIndex, opacity } = getCardStyle(idx);
            const theme = THEME_STYLES[item.colorTheme || "white"];

            // 1. TOSSING CARD: Continuously animates from the exact drop coordinates (dropX, dropY, dropRotate)
            // through the flyOut apex and tucks into the final resting slot at the bottom of the rosette
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
                  className={`absolute inset-0 rounded-[32px] p-6 sm:p-8 md:p-9 flex flex-col justify-between border ${theme.cardBorder} ${theme.cardBg} ${theme.shadow} pointer-events-none`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[11px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm ${theme.pillBg}`}>
                      {item.tag}
                    </span>
                    <span className={`font-mono font-bold text-xs tracking-widest ${theme.numberText}`}>
                      {item.number}
                    </span>
                  </div>
                  <div className="my-auto py-3 sm:py-4">
                    <h3 className={`text-xl xs:text-2xl sm:text-[26px] md:text-[28px] font-black leading-tight tracking-tight ${theme.titleText}`}>
                      {item.title}
                    </h3>
                  </div>
                  <div className={`pt-4 border-t ${theme.divider} flex flex-col gap-2`}>
                    <p className={`text-xs sm:text-sm leading-relaxed ${theme.descText}`}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            }

            // 2. ACTIVE FRONT CARD: When arriving from underneath, behaves like Card 3 with a simple normal rotation to 0°
            if (isFront) {
              return (
                <motion.div
                  key={item.id}
                  drag={!isTransitioningRef.current}
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
                  className={`absolute inset-0 rounded-[32px] p-6 sm:p-8 md:p-9 flex flex-col justify-between cursor-grab active:cursor-grabbing border ${theme.cardBorder} ${theme.cardBg} ${theme.shadow} backdrop-blur-sm`}
                >
                  {/* Top Header Row */}
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[11px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm ${theme.pillBg}`}>
                      {item.tag}
                    </span>
                    <span className={`font-mono font-bold text-xs tracking-widest ${theme.numberText}`}>
                      {item.number}
                    </span>
                  </div>

                  {/* Main Question / Title */}
                  <div className="my-auto py-3 sm:py-4">
                    <h3 className={`text-xl xs:text-2xl sm:text-[26px] md:text-[28px] font-black leading-tight tracking-tight ${theme.titleText}`}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Bottom Answer / Technical Note */}
                  <div className={`pt-4 border-t ${theme.divider} flex flex-col gap-2`}>
                    <p className={`text-xs sm:text-sm leading-relaxed ${theme.descText}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Drag Prompt Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-black/35 rounded-[32px] flex items-center justify-center pointer-events-none">
                      <div className="px-3.5 py-1.5 rounded-full bg-black/90 text-white text-xs font-mono flex items-center gap-2 border border-white/20 shadow-xl">
                        <Hand className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                        <span>Release to swap card</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            }

            // 3. STACKED CARDS: Clockwise Center-Pivot Spiral. Normal rotation.
            return (
              <motion.div
                key={item.id}
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
                className={`absolute inset-0 rounded-[32px] p-6 sm:p-8 md:p-9 flex flex-col justify-between border cursor-pointer ${theme.cardBorder} ${theme.cardBg} ${theme.shadow} hover:opacity-100 transition-opacity`}
              >
                {/* Header peek */}
                <div className="flex justify-between items-center pointer-events-none">
                  <span className={`text-[11px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full ${theme.pillBg}`}>
                    {item.tag}
                  </span>
                  <span className={`font-mono font-bold text-xs ${theme.numberText}`}>
                    {item.number}
                  </span>
                </div>

                {/* Question peek */}
                <div className="my-auto py-3 sm:py-4 pointer-events-none">
                  <h3 className={`text-xl xs:text-2xl sm:text-[26px] md:text-[28px] font-black leading-tight tracking-tight line-clamp-3 ${theme.titleText}`}>
                    {item.title}
                  </h3>
                </div>

                {/* Bottom line peek */}
                <div className={`pt-4 border-t ${theme.divider} flex flex-col gap-2 pointer-events-none`}>
                  <p className={`text-xs sm:text-sm leading-relaxed ${theme.descText} line-clamp-2`}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

        </div>
      </div>

      {/* Swipe Controls & Counter */}
      <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4 z-10 px-4">
        <div className="inline-flex items-center gap-5 sm:gap-6 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 shadow-md">
          <button 
            onClick={handlePrev} 
            disabled={isTransitioningRef.current}
            className="p-1 hover:text-white transition-colors cursor-pointer disabled:opacity-50" 
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
          </button>
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-slate-400">
            Swipe or Drag Deck
          </span>
          <button 
            onClick={handleNext} 
            disabled={isTransitioningRef.current}
            className="p-1 hover:text-white transition-colors cursor-pointer disabled:opacity-50" 
            aria-label="Next card"
          >
            <ChevronRight className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
          </button>
        </div>

        {/* Counter & Indicator dots */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-widest text-slate-400">
            <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, "0")}</span> /{" "}
            {String(totalCards).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!isTransitioningRef.current) setActiveIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex ? "w-6 bg-cyan-400" : "w-1.5 bg-slate-800 hover:bg-slate-600"
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
