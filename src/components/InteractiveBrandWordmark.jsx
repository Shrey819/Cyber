import React from "react";

export default function InteractiveBrandWordmark({
  primaryWord = "VORTEX",
  secondaryWord = "CYBER",
  primaryColor = "text-slate-800",
  primaryHoverGlow = "hover:text-white hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.95)] active:drop-shadow-[0_0_30px_rgba(255,255,255,1)]",
  secondaryColor = "text-cyan-500/25",
  secondaryHoverGlow = "hover:text-cyan-400 hover:drop-shadow-[0_0_35px_rgba(0,240,255,0.95)] active:drop-shadow-[0_0_30px_rgba(0,240,255,1)]",
  tagline = "AUTONOMOUS THREAT INTELLIGENCE & ZERO-TRUST DEFENSE GRID",
}) {
  return (
    <section className="w-full py-14 sm:py-20 bg-[#04060B] border-t border-b border-slate-900 text-center overflow-hidden relative select-none">
      {/* Background ambient cyber glow */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[300px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
        
        {/* Giant Interactive Letter Wordmark */}
        <div className="text-[12vw] sm:text-[10vw] md:text-[8.5vw] font-black tracking-tighter leading-none select-none font-mono flex justify-center items-center flex-wrap gap-x-4 sm:gap-x-8 md:gap-x-12">
          
          {/* First Word ("VORTEX") */}
          <div className="flex gap-x-0.5 sm:gap-x-1">
            {Array.from(primaryWord).map((char, i) => (
              <span
                key={`p-${i}`}
                className={`${primaryColor} cursor-pointer transition-all duration-300 hover:text-white hover:-translate-y-3 sm:hover:-translate-y-4 hover:scale-110 ${primaryHoverGlow} inline-block touch-manipulation select-none`}
              >
                {char}
              </span>
            ))}
          </div>

          {/* Second Word ("CYBER") */}
          <div className="flex gap-x-0.5 sm:gap-x-1">
            {Array.from(secondaryWord).map((char, i) => (
              <span
                key={`s-${i}`}
                className={`${secondaryColor} cursor-pointer transition-all duration-300 hover:text-cyan-400 hover:-translate-y-3 sm:hover:-translate-y-4 hover:scale-110 ${secondaryHoverGlow} inline-block touch-manipulation select-none`}
              >
                {char}
              </span>
            ))}
          </div>

        </div>

        {/* Dynamic Tagline & Status */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-slate-500 text-[10px] sm:text-xs font-mono tracking-widest uppercase">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>SECURE INFRASTRUCTURE PROTOCOL</span>
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span>{tagline}</span>
        </div>

      </div>
    </section>
  );
}
