import React from "react";
import { motion } from "framer-motion";
import { Compass, Thermometer, Wind, Eye, ArrowUpRight, Award, Layers, CheckCircle } from "lucide-react";

export default function WorldCard({ world, isActive, onSelect, index }) {
  const getStatIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes("tiến độ") || l.includes("progress")) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (l.includes("số thẻ") || l.includes("cards")) return <Layers className="w-4 h-4 text-cyan-400" />;
    return <Award className="w-4 h-4 text-amber-400" />;
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
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-950 via-stone-950/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-stone-950/25 z-0" />
          
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
              [ HỌC PHẦN 0{index + 1} ]
            </span>
            <span className="py-0.5 px-2 rounded bg-stone-900/90 border border-stone-800/80 text-[10px] font-mono text-stone-300 font-medium tracking-widest uppercase">
              {world.tag}
            </span>
          </div>
        </div>

        {/* BOTTOM CONTENT PACK */}
        <div className="relative z-10 mt-auto w-full flex items-center justify-between">
          <motion.h2 
            animate={{ 
              y: isActive ? 0 : 5,
              opacity: isActive ? 1 : 0.7 
            }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight"
          >
            {world.title}
          </motion.h2>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-stone-300 hover:text-stone-950 transition-colors duration-200 flex items-center justify-center border border-stone-800 flex-shrink-0"
          >
            <ArrowUpRight className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
