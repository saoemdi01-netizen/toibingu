import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Compass, ShieldCheck, MapPin, Map, ArrowRight, CheckCircle2, ChevronRight, User } from "lucide-react";
import { WorldInfo } from "../data";

interface WorldDetailsProps {
  world: WorldInfo;
  onClose: () => void;
  userEmail?: string;
}

export default function WorldDetails({ world, onClose, userEmail = "guest@sora.world" }: WorldDetailsProps) {
  const [selectedCompanion, setSelectedCompanion] = useState("Xe Điện Rover");
  const [stayDuration, setStayDuration] = useState(3);
  const [isBooked, setIsBooked] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Compute luxury energy cost based on stay duration and vehicle
  const computePrice = () => {
    let base = stayDuration * 1250;
    if (selectedCompanion === "Tàu Bay Bay Thấp (Low-grav)") base += 4500;
    if (selectedCompanion === "Tàu Quạt Phản Lực") base += 2500;
    return base;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
  };

  const transportPresets = [
    { name: "Xe Điện Rover", desc: "Thám hiểm mặt đất êm ái, bám đường ưu việt", premium: "+0 USD" },
    { name: "Tàu Quạt Phản Lực", desc: "Tối ưu hóa các khe núi hẹp, tốc độ trung bình", premium: "+2,500 USD" },
    { name: "Tàu Bay Thấp (Low-grav)", desc: "Bay phản trọng lực tầm gần siêu cấp thoải mái", premium: "+4,500 USD" },
  ];

  return (
    <motion.div
      layoutId={`world-card-${world.id}`}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950 flex flex-col md:flex-row text-white font-sans selection:bg-cyan-500/30"
    >
      {/* LEFT SECTION: IMMERSIVE GALLERIES */}
      <div className="relative w-full md:w-[55%] h-[40vh] md:h-screen shrink-0 overflow-hidden bg-stone-900 border-r border-stone-900">
        <div className="absolute inset-x-0 bottom-0 top-1/4 bg-gradient-to-t from-stone-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-stone-950/20 z-10 pointer-events-none" />

        <img
          src={world.detailImage}
          alt={world.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />

        {/* Float action banner with specs */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2.5"
          >
            <span className="py-1 px-2.5 rounded bg-cyan-400 font-mono text-[10px] text-stone-950 font-bold tracking-widest uppercase">
              ACTIVE WORLD ID
            </span>
            <span className="font-mono text-xs text-stone-300 drop-shadow flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {world.coords}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl font-display font-medium tracking-tight text-white drop-shadow-lg"
          >
            {world.title}
          </motion.h1>
        </div>

        {/* Escape top button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-30 w-11 h-11 rounded-full bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 hover:bg-white hover:text-stone-950 transition-colors duration-250 flex items-center justify-center cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* RIGHT SECTION: DETAILED TRAVEL PLANNING */}
      <div className="flex-1 min-h-screen bg-stone-950 flex flex-col p-6 md:p-12 relative z-10">
        {/* Right Head close action for desktop */}
        <div className="hidden md:flex justify-end mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 py-1 px-4 rounded-full border border-stone-800 hover:border-stone-600 bg-stone-900/30 hover:bg-stone-900/80 text-stone-400 hover:text-white transition-all text-xs font-mono cursor-pointer"
          >
            [ ESCAPE WINDOW ]
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Narrative & Timeline row */}
        <div className="space-y-8 flex-1 max-w-2xl">
          {/* Main Description text */}
          <div className="space-y-3">
            <h3 className="text-stone-400 font-mono text-xs uppercase tracking-widest">
              Tổng quan trải nghiệm
            </h3>
            <p className="text-stone-300 font-light text-[15px] leading-relaxed">
              {world.overview}
            </p>
          </div>

          {/* Timetable / Exploration list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-stone-400 font-mono text-xs uppercase tracking-widest">
                Lịch trình Thám Hiểm
              </h3>
              <span className="text-[10px] text-stone-500 font-mono">
                Click từng mốc để xem chi tiết
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {world.explorationSteps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                    activeStepIndex === idx
                      ? "border-cyan-500/60 bg-cyan-950/10 shadow-[0_4px_16px_rgba(6,182,212,0.06)]"
                      : "border-stone-900/60 bg-stone-900/20 hover:border-stone-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-stone-900 px-1.5 py-0.5 rounded leading-none">
                      {step.time}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 text-stone-600 transition-transform ${
                      activeStepIndex === idx ? "rotate-90 text-cyan-400" : ""
                    }`} />
                  </div>
                  <h4 className="text-xs font-medium text-stone-100 line-clamp-1">
                    {step.title}
                  </h4>
                  <AnimatePresence mode="wait">
                    {activeStepIndex === idx && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[11px] text-stone-400 mt-2 font-light leading-relaxed font-sans"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive configurator Form */}
          <div className="border-t border-stone-900 pt-8 mt-4 space-y-6">
            <h3 className="text-stone-300 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <Map className="w-4 h-4 text-cyan-400" />
              Thiết lập hành trình đặt chân
            </h3>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Duration slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-400 font-light font-sans">Thời gian cư trú</span>
                  <span className="font-mono text-cyan-400 font-semibold text-sm">
                    {stayDuration} ngày / {stayDuration - 1} đêm
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  value={stayDuration}
                  onChange={(e) => setStayDuration(Number(e.target.value))}
                  className="w-full h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-600">
                  <span>2 ngày (Tối thiểu)</span>
                  <span>14 ngày (Hạn mức tối đa)</span>
                </div>
              </div>

              {/* Vehicle Options */}
              <div className="space-y-2.5">
                <span className="text-xs text-stone-400 font-light">Phương tiện di chuyển nội khu</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {transportPresets.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedCompanion(v.name)}
                      className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                        selectedCompanion === v.name
                          ? "border-stone-600 bg-stone-900/40 text-stone-100"
                          : "border-stone-900/60 bg-transparent text-stone-400 hover:border-stone-800"
                      }`}
                    >
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-medium font-sans block">{v.name}</span>
                        <span className="text-[10px] text-stone-500 font-light block">{v.desc}</span>
                      </div>
                      <span className="font-mono text-xs text-stone-400">{v.premium}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing section and Submit Button */}
              <div className="p-5.5 rounded-2xl bg-stone-900/30 border border-stone-900/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block">Ước lượng năng lượng phí</span>
                  <span className="text-2xl font-semibold text-white tracking-tight">
                    {computePrice().toLocaleString()} USD
                    <span className="text-xs font-light text-stone-400 font-mono ml-1">/ Toàn khóa</span>
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-stone-950 font-medium text-xs hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  Đăng Ký Đặt Chân Ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom micro security label */}
        <div className="mt-8 border-t border-stone-900/40 pt-4 flex justify-between text-[10px] text-stone-600 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Protocol SORA-2026
          </span>
          <span>Logged as: {userEmail}</span>
        </div>
      </div>

      {/* SUCCESS POPUP COMPONENT (isBooked) */}
      <AnimatePresence>
        {isBooked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md p-8 rounded-3xl border border-stone-800 bg-stone-900/90 shadow-[0_24px_50px_rgba(0,0,0,0.8)] text-center flex flex-col items-center space-y-5"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-display font-medium text-white">Hành trình đã đăng lý thành công!</h2>
                <p className="text-xs text-stone-400 font-light leading-relaxed px-2">
                  Hệ thống Sora đã xác nhận lịch trình thám hiểm tại <span className="text-stone-200 font-medium">{world.title}</span> của bạn ({stayDuration} ngày cư trú bằng {selectedCompanion}).
                </p>
              </div>

              <div className="w-full bg-stone-950 p-4 rounded-xl border border-stone-800/60 space-y-2 text-left text-xs font-mono text-stone-400">
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="text-emerald-400 font-semibold">ĐÃ KÍCH HOẠT</span>
                </div>
                <div className="flex justify-between">
                  <span>Vị trí:</span>
                  <span className="text-stone-200">{world.coords}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phản hồi gửi về:</span>
                  <span className="text-stone-300">{userEmail}@sora.world</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsBooked(false);
                  onClose();
                }}
                className="w-full h-11 rounded-xl bg-white text-stone-950 font-medium text-xs hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Quay Lại Sảnh Đợi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
