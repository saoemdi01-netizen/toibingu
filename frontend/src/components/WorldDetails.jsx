import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, X } from "lucide-react";

export default function WorldDetails({ world, onClose, onStartModule }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-sm rounded-[24px] border border-stone-850 bg-[#06060c]/92 p-6 md:p-8 text-center shadow-[0_30px_70px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.06)] relative"
      >
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-550 hover:text-stone-300 transition-colors p-1 cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Pulsing Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5 flex items-center justify-center relative">
          <span className="absolute inset-0 rounded-full bg-emerald-400/5 animate-pulse" />
          <GraduationCap className="w-7 h-7 text-emerald-400" />
        </div>

        {/* Modal Info */}
        <div className="space-y-1 mb-6">
          <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-emerald-400">Xác nhận học phần</span>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">
            {world.title}
          </h2>
          <p className="text-[11px] text-stone-500 font-light">
            Nhấp Bắt đầu để tải bộ thẻ từ vựng học tập.
          </p>
        </div>

        {/* Stacked Actions */}
        <div className="space-y-2.5">
          <button
            onClick={onStartModule}
            className="w-full h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Bắt đầu học ngay
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl border border-stone-850 hover:border-stone-700 hover:bg-[#0a0a0c]/80 text-stone-450 hover:text-white text-xs transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            Hủy bỏ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
