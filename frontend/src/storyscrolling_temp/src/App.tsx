import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, LogOut, Sparkles, Sliders, ChevronDown, Sparkle, User, ArrowUp, Zap } from "lucide-react";
import { ATTRACTION_WORLDS, WorldInfo } from "./data";
import LoginScreen from "./components/LoginScreen";
import WorldCard from "./components/WorldCard";
import WorldDetails from "./components/WorldDetails";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [explorerName, setExplorerName] = useState("");
  const [activeWorldIndex, setActiveWorldIndex] = useState(0);
  const [selectedWorld, setSelectedWorld] = useState<WorldInfo | null>(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  
  // Dropdown & Navigation states
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // All distinct worlds are fully accessible in our premium route thám hiểm selector
  const filteredWorlds = ATTRACTION_WORLDS;

  // Scroll snapping position updater logic based on highly precise screen coordinates
  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    const container = scrollContainerRef.current;
    const containerTop = container.getBoundingClientRect().top;
    const children = container.children;
    if (!children || children.length === 0) return;

    let minDiff = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const childTop = child.getBoundingClientRect().top;
      // Precise offset of the child relative to the container's visible top boundary
      const diff = Math.abs(childTop - containerTop);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeWorldIndex) {
      setActiveWorldIndex(closestIndex);
    }
  };

  // Initialize screen state
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Global event listener for keyboard arrows navigation
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent event interception if the user is typing in a form input or editable area
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        (activeEl as HTMLElement).isContentEditable
      )) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIdx = (activeWorldIndex + 1) % filteredWorlds.length;
        scrollToItem(nextIdx);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIdx = (activeWorldIndex - 1 + filteredWorlds.length) % filteredWorlds.length;
        scrollToItem(prevIdx);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoggedIn, activeWorldIndex, filteredWorlds.length]);

  // Handle jump action from clicking arrow controls, progress dots, or dropdown selection
  const scrollToItem = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const children = container.children;
    if (children && children[idx]) {
      const targetElement = children[idx] as HTMLElement;
      
      const targetTop = targetElement.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
      // Perfect offset independent of layout offsetParent bugs
      const targetScrollTop = (targetTop - containerTop) + container.scrollTop;
      
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth"
      });
      setActiveWorldIndex(idx);

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 750); // Safe duration for smooth transition to complete
    }
  };

  // Get current active background hex or default
  const getActiveBg = () => {
    if (!isLoggedIn) return "#070709";
    if (filteredWorlds[activeWorldIndex]) {
      return filteredWorlds[activeWorldIndex].bgHex;
    }
    return "#0c0a09";
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden transition-colors duration-1000 ease-out flex flex-col"
      style={{ backgroundColor: getActiveBg() }}
    >
      {/* Deep space stars & dynamic black hole overlay background for maximum post-login interaction */}
      {isLoggedIn && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Constellations */}
          <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(#ffffff0c_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
          
          {/* Glowing gas cloud that reacts according to active world */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: filteredWorlds[activeWorldIndex]?.id === "gargantua-00" ? 0.35 : 0.1,
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_65%)]"
          />

          {/* Deep Gargantua faint orbital reflection if selected */}
          <AnimatePresence>
            {filteredWorlds[activeWorldIndex]?.id === "gargantua-00" && (
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.18, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 flex items-center justify-center saturate-[1.2] brightness-50 mix-blend-screen"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Black_hole_Gargantua_Interstellar.png"
                  alt="Background Horizon Flare"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Immersive Dashboard Container */}
      <AnimatePresence>
        {isLoggedIn && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: "-100vw", filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: "-100vw", filter: "blur(12px)" }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full flex flex-col relative"
          >
            {/* TOP NAVIGATION HEADBOARD */}
            <header className="absolute top-0 inset-x-0 z-30 h-20 px-6 md:px-12 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-stone-950/40 via-stone-950/10 to-transparent">
              <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-white text-stone-950 flex items-center justify-center">
                  <Compass className="w-4.5 h-4.5 animate-spin-slow" />
                </div>
                <span className="font-display font-medium tracking-tight text-white text-sm hidden sm:inline-block">
                  SORA EXPEDITIONS
                </span>
              </div>

              {/* CENTER COMPACT LOCATION SELECTOR (4K Premium Design) */}
              <div className="relative flex items-center justify-center pointer-events-auto">
                <div className="flex items-center gap-1.5 bg-stone-950/55 backdrop-blur-xl border border-stone-800/60 p-1 rounded-full px-2 shadow-[0_12px_24px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.06)]">
                  {/* Left Navigation Arrow */}
                  <button
                    onClick={() => {
                      const prevIdx = (activeWorldIndex - 1 + ATTRACTION_WORLDS.length) % ATTRACTION_WORLDS.length;
                      scrollToItem(prevIdx);
                    }}
                    className="w-7 h-7 rounded-full bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-800/20 text-xs"
                    title="Địa điểm trước"
                  >
                    ←
                  </button>

                  {/* Main Dropdown Trigger Button */}
                  <button
                    onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-stone-900/50 transition-all cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4] animate-pulse" />
                      <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#06b6d4] opacity-75 animate-ping" />
                    </div>
                    
                    <span className="text-[11px] font-medium text-stone-250 select-none">
                      {ATTRACTION_WORLDS[activeWorldIndex]?.title}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200 transition-transform duration-350 ${isLocationDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Right Navigation Arrow */}
                  <button
                    onClick={() => {
                      const nextIdx = (activeWorldIndex + 1) % ATTRACTION_WORLDS.length;
                      scrollToItem(nextIdx);
                    }}
                    className="w-7 h-7 rounded-full bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-800/20 text-xs"
                    title="Địa điểm tiếp theo"
                  >
                    →
                  </button>
                </div>

                {/* Dropdown Menu Portal-like Frame */}
                <AnimatePresence>
                  {isLocationDropdownOpen && (
                    <>
                      {/* Invisible backdrop to capture clicks */}
                      <div 
                        className="fixed inset-0 z-40 pointer-events-auto" 
                        onClick={() => setIsLocationDropdownOpen(false)} 
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-12 w-[310px] sm:w-[400px] max-h-[440px] overflow-y-auto no-scrollbar z-50 rounded-2xl border border-stone-800/80 bg-[#06060c]/98 backdrop-blur-3xl p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.06)] pointer-events-auto flex flex-col gap-1.5"
                      >
                        <div className="px-3 py-1.5 border-b border-stone-900 mb-1 flex items-center justify-between text-stone-500 text-[9px] font-mono tracking-wider uppercase">
                          <span>Hệ Thống Bản Đồ Thám Hiểm</span>
                          <span>{ATTRACTION_WORLDS.length} TỌA ĐỘ</span>
                        </div>

                        {ATTRACTION_WORLDS.map((world, idx) => {
                          const isActive = idx === activeWorldIndex;
                          return (
                            <button
                              key={world.id}
                              onClick={() => {
                                scrollToItem(idx);
                                setIsLocationDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group border cursor-pointer ${
                                isActive
                                  ? "bg-stone-900/85 border-[#06b6d4]/40"
                                  : "bg-transparent border-transparent hover:bg-stone-900/30 hover:border-stone-850"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Compact visual thumb preview frame */}
                                <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-stone-800 flex-shrink-0 bg-stone-950">
                                  <img 
                                    src={world.coverImage} 
                                    alt={world.title} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                  />
                                  {isActive && (
                                    <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-cyan-500 font-semibold flex-shrink-0">
                                      0{idx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-stone-100 group-hover:text-white truncate">
                                      {world.title}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-stone-550 mt-0.5 tracking-tight truncate max-w-[150px] sm:max-w-[210px]">
                                    {world.coords}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 font-mono text-[9px] flex-shrink-0 pl-2">
                                <span className="py-0.5 px-1.5 rounded bg-stone-950 text-stone-500 border border-stone-850 uppercase text-[8px]">
                                  {world.tag}
                                </span>
                                {isActive && (
                                  <span className="text-cyan-400 text-[8px] tracking-wide animate-pulse font-bold">ACTIVE</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* USER PANEL TRIGGER SECTION */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-stone-900/40 px-3 py-1.5 rounded-full border border-stone-800/40 text-stone-300">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-medium max-w-[100px] truncate">
                    {explorerName}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setExplorerName("");
                    setActiveWorldIndex(0);
                    setHasLoggedOut(true);
                  }}
                  className="w-9 h-9 rounded-full border border-stone-800 bg-stone-950/40 text-stone-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/10 transition-colors flex items-center justify-center cursor-pointer"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* DYNAMIC SCROLL CONTAINER ROW */}
            <div className="flex-1 relative flex items-center justify-center z-10 w-full h-full pt-16">
              
              {/* LEFT FLOATING PROGRESS VERTICAL INDICATORS TRACKER */}
              <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center space-y-6">
                <div className="flex flex-col space-y-3 relative">
                  {/* Slim central alignment bar */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-[1px] bg-stone-800" />
                  
                  {filteredWorlds.map((world, idx) => (
                    <button
                      key={world.id}
                      onClick={() => scrollToItem(idx)}
                      className="group flex items-center gap-3 py-1 relative z-10 focus:outline-none cursor-pointer"
                    >
                      <span className={`text-[9px] font-mono transition-all duration-300 ${
                        activeWorldIndex === idx ? "text-cyan-400" : "text-stone-600 opacity-0 group-hover:opacity-100"
                      }`}>
                        0{idx + 1}
                      </span>
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: activeWorldIndex === idx ? 1.2 : 0.8,
                            backgroundColor: activeWorldIndex === idx ? "#06b6d4" : "rgba(120, 113, 108, 0.4)"
                          }}
                          className="w-2.5 h-2.5 rounded-full border border-stone-950"
                        />
                        {activeWorldIndex === idx && (
                          <motion.div
                            layoutId="active-dot-outline"
                            className="absolute -inset-1.5 rounded-full border border-cyan-400/40"
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          />
                        )}
                      </div>
                      <span className={`text-[10px] font-mono tracking-wider hidden md:inline-block transition-colors duration-300 select-none ${
                        activeWorldIndex === idx ? "text-cyan-400 font-semibold" : "text-stone-500 group-hover:text-stone-300"
                      }`}>
                        {world.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Micro compass alignment stats */}
                <span className="hidden md:block transform -rotate-90 mt-8 font-mono text-[9px] text-stone-600 tracking-widest whitespace-nowrap">
                  ALTITUDE SNAP PROTOCOL ACTIVE
                </span>
              </div>

              {/* THE CORE VERTICAL VIEWPORT STORYSCROLL CONTAINER */}
              {filteredWorlds.length > 0 ? (
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="story-scroll-container no-scrollbar"
                >
                  {filteredWorlds.map((world, index) => (
                    <WorldCard
                      key={world.id}
                      world={world}
                      index={index}
                      isActive={activeWorldIndex === index}
                      onSelect={() => setSelectedWorld(world)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 py-20 text-center">
                  <div className="w-12 h-12 rounded-full border border-stone-800 flex items-center justify-center">
                    <Sparkle className="w-5 h-5 text-stone-600" />
                  </div>
                  <p className="text-stone-400 text-xs font-light">
                    Không tìm thấy vùng không gian thám hiểm tương ứng.
                  </p>
                  <button
                    onClick={() => scrollToItem(0)}
                    className="text-xs text-cyan-400 border border-cyan-500/20 px-3.5 py-1.5 rounded-full hover:bg-cyan-500/10 cursor-pointer"
                  >
                    Quay lại đầu trang
                  </button>
                </div>
              )}

              {/* FLOATING INERTIA HINT INDICATORS */}
              <div className="absolute bottom-6 right-6 md:right-12 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
                <div className="flex items-center gap-2 bg-stone-900/80 backdrop-blur border border-stone-800/80 py-1.5 px-3 rounded-full text-[10px] font-mono text-stone-400">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>PHÍM LÊN-XUỐNG ĐỂ LIÊN KẾT NHANH</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC EXPANDED STATE (MODAL OVERLAYS WITH HERO MOTION LIFECYCLE) */}
            <AnimatePresence>
              {selectedWorld && (
                <WorldDetails
                  world={selectedWorld}
                  userEmail={explorerName || "guest"}
                  onClose={() => setSelectedWorld(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Login Curtain Overlay */}
      <AnimatePresence>
        {!isLoggedIn && (
          <motion.div
            key="login-curtain"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ 
              opacity: 0,
              filter: "blur(8px)",
              transition: { 
                duration: 1.0, 
                ease: "easeOut"
              } 
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-50 w-full h-full bg-[#030305] origin-center"
          >
            <LoginScreen 
              hasLoggedOut={hasLoggedOut}
              onLoginSuccess={(name) => {
                setExplorerName(name);
                setIsLoggedIn(true);
                setHasLoggedOut(false);
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
