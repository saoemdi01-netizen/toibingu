import React from "react";
import { motion } from "motion/react";
import { Compass, Thermometer, Wind, Eye, ArrowUpRight, Lock } from "lucide-react";
import { WorldInfo } from "../data";

interface WorldCardProps {
  world: WorldInfo;
  isActive: boolean;
  onSelect: () => void;
  index: number;
  key?: React.Key | null;
}

export default function WorldCard({ world, isActive, onSelect, index }: WorldCardProps) {
  // Select matching metadata icons for display stats
  const getStatIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("temp") || l.includes("nhiệt")) return <Thermometer className="w-4 h-4" />;
    if (l.includes("wind") || l.includes("gió") || l.includes("velocity")) return <Wind className="w-4 h-4" />;
    return <Compass className="w-4 h-4" />;
  };

  return (
    <div className="story-scroll-item flex items-center justify-center p-4 md:p-8">
      {/* Outer focus glow background wrapping the card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className={`w-full max-w-4xl aspect-[16/10] md:aspect-[16/9] rounded-[36px] blur-3xl opacity-20 transition-all duration-1000 ${
            isActive ? "scale-105" : "scale-95"
          }`}
          style={{ background: `radial-gradient(circle, ${world.bgHex} 0%, transparent 70%)` }}
        />
      </div>

      {/* Main Interactive Card */}
      <motion.div
        layoutId={`world-card-${world.id}`}
        onClick={onSelect}
        className={`w-full max-w-4xl aspect-[4/5] md:aspect-[16/10] rounded-[32px] border relative overflow-hidden select-none cursor-pointer flex flex-col justify-between p-6 md:p-10 transition-all duration-700 ${
          isActive 
            ? "border-stone-700/80 shadow-[0_30px_70px_rgba(0,0,0,0.8)]" 
            : "border-stone-900/40 opacity-40 scale-[0.97] saturate-50 hover:opacity-75 hover:scale-[0.99] hover:border-stone-800"
        }`}
        style={{
          background: `linear-gradient(210deg, rgba(28, 25, 23, 0.45) 0%, rgba(12, 10, 9, 0.95) 100%)`
        }}
      >
        {/* Parallax Cover Image layer controlled by states */}
        <div className="absolute inset-x-0 top-0 bottom-1/3 md:bottom-0 md:inset-y-0 md:w-3/5 md:left-auto right-0 overflow-hidden rounded-t-[28px] md:rounded-t-none md:rounded-r-[30px] z-0">
          {/* Subtle gradient overlay to fade into dark background */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-950 via-stone-950/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-stone-950/25 z-0" /> {/* Dark general screen tint */}
          
          <motion.img
            src={world.coverImage}
            alt={world.title}
            referrerPolicy="no-referrer"
            animate={{
              scale: isActive ? 1.05 : 1.15,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-full h-full object-cover origin-center"
          />
        </div>

        {/* TOP RAIL HEADER CONTENT */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-stone-500 tracking-wider">
              [ 0{index + 1} / SERIES ]
            </span>
            <span className="py-0.5 px-2 rounded bg-stone-900/90 border border-stone-800/80 text-[10px] font-mono text-stone-300 font-medium tracking-widest uppercase">
              {world.tag}
            </span>
          </div>
          
          <div className="font-mono text-xs text-stone-500 tracking-tight flex items-center gap-2 bg-stone-950/60 backdrop-blur-md py-1 px-3 rounded-full border border-stone-800/40">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {world.coords}
          </div>
        </div>

        {/* BOTTOM CONTENT PACK */}
        <div className="relative z-10 mt-auto md:max-w-[48%] flex flex-col justify-end">
          {/* Tag & Animated Title */}
          <div className="space-y-2">
            <motion.h2 
              animate={{ 
                y: isActive ? 0 : 10,
                opacity: isActive ? 1 : 0.7 
              }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight"
            >
              {world.title}
            </motion.h2>
            
            <motion.p
              animate={{ 
                y: isActive ? 0 : 14,
                opacity: isActive ? 1 : 0.5 
              }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm text-stone-400 font-light leading-relaxed tracking-wide"
            >
              {world.subtitle}
            </motion.p>
          </div>

          {/* Quick Active stats Dashboard */}
          <div className="grid grid-cols-3 gap-3 my-6 border-t border-b border-stone-800/60 py-4">
            {world.stats.map((stat, i) => (
              <div key={i} className="flex flex-col space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-mono text-stone-500 flex items-center gap-1">
                  {getStatIcon(stat.label)}
                  {stat.label}
                </span>
                <span className="text-sm font-semibold text-stone-200">
                  {stat.value}
                  {stat.unit && <span className="text-[10px] font-normal text-stone-500 ml-0.5">{stat.unit}</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Expanded button with arrow action */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Click/Cuộn để khám phá sâu hơn
            </span>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-stone-300 hover:text-stone-950 transition-colors duration-200 flex items-center justify-center border border-stone-800"
            >
              <ArrowUpRight className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
