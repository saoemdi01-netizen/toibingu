import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Sparkles, Compass, AlertCircle, ArrowRight } from "lucide-react";

// Generate premium Keplerian-ish orbiting space dust particles with custom speeds and sizes (dense, high-precision 4K stream)
const orbitalParticles = Array.from({ length: 48 }).map((_, i) => {
  const radius = 120 + i * 5; // extremely dense spacing for a continuous, flowing lensed stream
  const speed = 4.5 + i * 0.45; // Keplerian decay: inner parts orbital speed is faster
  const colorType = i % 4; // 0: white-hot, 1: rich gold, 2: warm amber, 3: plasma blue-cyan
  return {
    id: i,
    radius,
    duration: speed,
    colorType,
    delay: -i * 0.35,
    size: 1 + (i % 2), // razor thin 1px to 2px microscopic space grains
  };
});

// Generate twinkling stars for realistic 4K stellar background depth
const backgroundStars = Array.from({ length: 120 }).map((_, i) => {
  const size = 0.8 + (i % 3) * 0.4; // super fine 0.8px, 1.2px, 1.6px points of light
  return {
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size,
    delay: `${(i % 8) * 0.95}s`,
    opacity: 0.15 + (i % 5) * 0.16,
  };
});

export default function LoginScreen({
  usernameInput,
  setUsernameInput,
  passwordInput,
  setPasswordInput,
  loginError,
  loginSuccessMsg,
  handleLogin,
  handleQuickLogin,
  isLoading,
  hasLoggedOut = false,
  isSucking,
  setIsSucking,
  onLoginSuccess,
  startMusicOnInputFocus
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  // Dynamic list of orbiting/flyby space objects
  const [spaceObjects, setSpaceObjects] = useState([]);

  // Mouse coordinate state for drifting background glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);
  const [suctionStreaks, setSuctionStreaks] = useState([]);
  const [dissolveParticles, setDissolveParticles] = useState([]);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate dissolve particles representing Hawking Radiation flow
  useEffect(() => {
    if (isSucking) {
      const desktop = window.innerWidth >= 768;
      const startX = desktop ? window.innerWidth * 0.25 : window.innerWidth * 0.5;
      const startY = window.innerHeight * 0.5;
      const targetX = desktop ? window.innerWidth * 0.68 : window.innerWidth * 0.5;
      const targetY = window.innerHeight * 0.5;

      const width = 410;
      const height = 450;

      const particles = Array.from({ length: 60 }).map((_, i) => {
        const offsetX = (Math.random() - 0.5) * width;
        const offsetY = (Math.random() - 0.5) * height;
        const pStartX = startX + offsetX;
        const pStartY = startY + offsetY;

        const midX = (pStartX + targetX) / 2 + (Math.random() - 0.5) * 150;
        const midY = (pStartY + targetY) / 2 + (Math.random() - 0.5) * 150;

        return {
          id: i,
          x: [pStartX, midX, targetX],
          y: [pStartY, midY, targetY],
          scale: [Math.random() * 1.5 + 1, Math.random() * 2 + 1, 0],
          opacity: [0, 1, 0.8, 0],
          color: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#34d399" : "#06b6d4",
          delay: Math.random() * 0.6,
          duration: 1.2 + Math.random() * 1.0,
        };
      });
      setDissolveParticles(particles);
    } else if (hasLoggedOut) {
      const desktop = window.innerWidth >= 768;
      const targetX = desktop ? window.innerWidth * 0.25 : window.innerWidth * 0.5;
      const targetY = window.innerHeight * 0.5;
      const startX = desktop ? window.innerWidth * 0.68 : window.innerWidth * 0.5;
      const startY = window.innerHeight * 0.5;

      const width = 410;
      const height = 450;

      const particles = Array.from({ length: 60 }).map((_, i) => {
        const offsetX = (Math.random() - 0.5) * width;
        const offsetY = (Math.random() - 0.5) * height;
        const pTargetX = targetX + offsetX;
        const pTargetY = targetY + offsetY;

        const midX = (startX + pTargetX) / 2 + (Math.random() - 0.5) * 150;
        const midY = (startY + pTargetY) / 2 + (Math.random() - 0.5) * 150;

        return {
          id: i,
          x: [startX, midX, pTargetX],
          y: [startY, midY, pTargetY],
          scale: [0, Math.random() * 2 + 1, Math.random() * 1.5 + 0.5],
          opacity: [0, 0.9, 0.6, 0],
          color: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#34d399" : "#06b6d4",
          delay: Math.random() * 0.8,
          duration: 1.4 + Math.random() * 1.2,
        };
      });
      setDissolveParticles(particles);
      const timer = setTimeout(() => setDissolveParticles([]), 3000);
      return () => clearTimeout(timer);
    } else {
      setDissolveParticles([]);
    }
  }, [isSucking, hasLoggedOut]);

  useEffect(() => {
    if (isSucking) {
      const desktop = window.innerWidth >= 768;
      const targetX = desktop ? 68 : 50; 
      const targetY = 50; 
      const startX = desktop ? 25 : 50; 
      const startY = 50;

      const newStreaks = Array.from({ length: 32 }).map((_, i) => {
        const id = i;
        const angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.4;
        const midSpread = 12 + Math.random() * 22;
        const controlX = (startX + targetX) / 2 + Math.sin(angle) * midSpread + (Math.random() - 0.5) * 8;
        const controlY = (startY + targetY) / 2 + Math.cos(angle) * midSpread + (Math.random() - 0.5) * 8;

        return {
          id,
          path: `M ${startX}vw ${startY}vh Q ${controlX}vw ${controlY}vh ${targetX}vw ${targetY}vh`,
          duration: 0.45 + Math.random() * 0.45,
          delay: Math.random() * 0.35,
          color: i % 4 === 0 ? "#10b981" : i % 4 === 1 ? "#06b6d4" : i % 4 === 2 ? "#34d399" : "#ffffff", 
          strokeWidth: 1.2 + Math.random() * 2.8,
        };
      });
      setSuctionStreaks(newStreaks);
    }
  }, [isSucking]);

  useEffect(() => {
    let active = true;
    const types = [
      "spaceship",
      "shuttle",
      "ufo",
      "asteroid",
    ];
    const trajectories = ["sucked", "flyby", "sucked"];

    const spawnObject = () => {
      if (!active) return;

      const id = Math.random().toString(36).substring(2, 9);
      const type = types[Math.floor(Math.random() * types.length)];
      const trajectory = trajectories[Math.floor(Math.random() * trajectories.length)];
      const size = 18 + Math.floor(Math.random() * 16); 
      const duration = 5.0 + Math.random() * 3.0; 
      const rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 270);

      const desktopState = window.innerWidth >= 768;
      const tgX = desktopState ? 68 : 50;
      const tgY = 50;

      const startSide = Math.floor(Math.random() * 4);
      let startPctX = 0;
      let startPctY = 0;

      if (startSide === 0) {
        startPctX = -15;
        startPctY = 10 + Math.random() * 80;
      } else if (startSide === 1) {
        startPctX = 115;
        startPctY = 10 + Math.random() * 80;
      } else if (startSide === 2) {
        startPctX = 10 + Math.random() * 80;
        startPctY = -15;
      } else {
        startPctX = 10 + Math.random() * 80;
        startPctY = 115;
      }

      let keyframesX = [];
      let keyframesY = [];
      let keyframesScale = [];
      let keyframesOpacity = [];

      if (trajectory === "sucked") {
        const dx = tgX - startPctX;
        const dy = tgY - startPctY;
        const isClockwise = Math.random() > 0.5;
        
        const factor = 0.25;
        const midPctX = (startPctX + tgX) / 2 + (isClockwise ? -dy : dy) * factor;
        const midPctY = (startPctY + tgY) / 2 + (isClockwise ? dx : -dx) * factor;

        keyframesX = [`${startPctX}vw`, `${midPctX}vw`, `${tgX}vw`];
        keyframesY = [`${startPctY}vh`, `${midPctY}vh`, `${tgY}vh`];
        keyframesScale = [0.2, 1.0, 0.6, 0.1, 0];
        keyframesOpacity = [0, 1.0, 1.0, 0.6, 0];
      } else {
        const endSide = (startSide + 1 + Math.floor(Math.random() * 2)) % 4; 
        let endPctX = 0;
        let endPctY = 0;

        if (endSide === 0) {
          endPctX = -15;
          endPctY = 10 + Math.random() * 80;
        } else if (endSide === 1) {
          endPctX = 115;
          endPctY = 10 + Math.random() * 80;
        } else if (endSide === 2) {
          endPctX = 10 + Math.random() * 80;
          endPctY = -15;
        } else {
          endPctX = 10 + Math.random() * 80;
          endPctY = 115;
        }

        const straightMidX = (startPctX + endPctX) / 2;
        const straightMidY = (startPctY + endPctY) / 2;
        const midPctX = straightMidX + (tgX - straightMidX) * 0.45;
        const midPctY = straightMidY + (tgY - straightMidY) * 0.45;

        keyframesX = [`${startPctX}vw`, `${midPctX}vw`, `${endPctX}vw`];
        keyframesY = [`${startPctY}vh`, `${midPctY}vh`, `${endPctY}vh`];
        keyframesScale = [0.2, 0.85, 0.2];
        keyframesOpacity = [0, 0.95, 0.95, 0];
      }

      const newObj = {
        id,
        type,
        trajectory,
        size,
        duration,
        rotationSpeed,
        keyframesX,
        keyframesY,
        keyframesScale,
        keyframesOpacity,
      };

      setSpaceObjects((prev) => [...prev, newObj]);

      const nextDelay = 4500 + Math.random() * 2000;
      setTimeout(spawnObject, nextDelay);
    };

    const timer = setTimeout(spawnObject, 2000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(e);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center md:justify-start md:pl-[8%] lg:pl-[12%] xl:pl-[15%] bg-[#020204] transition-all duration-500 crisp-4k-rendering">
      <style>{`
        .crisp-4k-rendering {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.9) translate3d(0,0,0); }
          50% { opacity: 0.95; transform: scale(1.15) translate3d(0,0,0); }
        }
        .star-item {
          animation: twinkle 6s ease-in-out infinite alternate;
          backface-visibility: hidden;
        }
        @keyframes led-glow-shift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .led-active-glow {
          animation: led-glow-shift 12s linear infinite;
        }
        @keyframes lens-flare-pulse {
          0%, 100% { opacity: 0.92; filter: brightness(1.0); }
          50% { opacity: 1.0; filter: brightness(1.25) drop-shadow(0 0 18px rgba(16,185,129,0.75)); }
        }
        .photon-ring-pulse {
          animation: lens-flare-pulse 4s ease-in-out infinite alternate;
        }
      `}</style>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-black">
        <div 
          className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none" 
          style={{
            background: "radial-gradient(circle at 75% 50%, rgba(16,185,129,0.22) 0%, rgba(6,182,212,0.12) 45%, rgba(99,102,241,0.03) 75%, transparent 100%)",
            filter: "blur(60px)",
          }} 
        />
        <div 
          className="absolute inset-0 opacity-35 mix-blend-screen pointer-events-none" 
          style={{
            background: "radial-gradient(circle at 25% 60%, rgba(16,185,129,0.12) 0%, rgba(139,92,246,0.05) 55%, transparent 100%)",
            filter: "blur(80px)",
          }} 
        />
        
        {backgroundStars.map((star) => (
          <div
            key={star.id}
            className="absolute star-item rounded-full bg-white/80"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: star.delay,
              boxShadow: star.size > 1 ? "0 0 5px rgba(255,255,255,0.7)" : "none",
            }}
          />
        ))}
      </div>

      {/* Accretion Disk Black Hole */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[58%] overflow-visible pointer-events-none z-1 flex items-center justify-center">
        <motion.div
          animate={{
            x: mousePos.x * -20,
            y: mousePos.y * -20,
            scale: 1.02 + Math.abs(mousePos.x) * 0.01,
          }}
          transition={{ type: "spring", damping: 75, stiffness: 25 }}
          className="relative flex items-center justify-center md:translate-x-[-3%] lg:translate-x-[-5%] xl:translate-x-[-7%] transition-all duration-700"
        >
          <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[520px] md:h-[520px] lg:w-[620px] lg:h-[620px] flex items-center justify-center led-active-glow">
            <div className="absolute w-[350%] h-[350%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22)_0%,rgba(6,182,212,0.15)_35%,rgba(99,102,241,0.05)_65%,transparent_80%)] blur-[95px] mix-blend-screen" />
            <div className="absolute w-[280%] h-[280%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14)_0%,rgba(139,92,246,0.08)_45%,transparent_70%)] blur-[105px] mix-blend-screen translate-y-[35px]" />

            {/* Back Loops Upper arch */}
            <div className="absolute top-[18%] md:top-[16%] w-[82%] h-[40%] rounded-[50%] border-t-[8px] md:border-t-[12px] border-l-[3px] border-r-[1px] border-emerald-400 bg-gradient-to-b from-emerald-400/10 via-transparent to-transparent opacity-95 blur-[0.6px] shadow-[0_-12px_45px_rgba(16,185,129,0.7),inset_0_4px_12px_rgba(255,255,255,0.95)] transform -rotate-[5deg]" />
            <div className="absolute top-[19.5%] md:top-[17.5%] w-[80%] h-[37%] rounded-[50%] border-t-[3px] md:border-t-[4px] border-white opacity-95 blur-[0.3px]" />
            <div className="absolute top-[14%] md:top-[12%] w-[86%] h-[45%] rounded-[50%] border-t-[20px] border-emerald-500/12 blur-[10px] opacity-75 animate-pulse" style={{ animationDuration: '6s' }} />

            {/* Back Loops Lower arch */}
            <div className="absolute bottom-[23%] md:bottom-[21%] w-[72%] h-[34%] rounded-[50%] border-b-[6px] md:border-b-[8px] border-l-[2px] border-r-[1px] border-[#10b981] bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-85 blur-[0.8px] shadow-[0_10px_35px_rgba(16,185,129,0.55)] transform rotate-[3deg]" />
            <div className="absolute bottom-[24.5%] md:bottom-[22.5%] w-[70%] h-[31%] rounded-[50%] border-b-[2px] md:border-b-[2.5px] border-emerald-300 opacity-90 blur-[0.4px]" />

            {/* Event Horizon Core */}
            <div className="absolute w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[260px] md:h-[260px] lg:w-[300px] lg:h-[300px] rounded-full bg-[#000000] shadow-[0_0_90px_rgba(0,0,0,1),0_0_120px_rgba(16,185,129,0.18)] border border-emerald-500/35 flex items-center justify-center z-10 select-none">
              <div className="absolute inset-[-1px] rounded-full border border-emerald-400/50 opacity-95 pointer-events-none z-20 photon-ring-pulse" />
              <div className="absolute inset-[1px] rounded-full border border-emerald-400/20 opacity-95 blur-[1px]" />
              <div className="absolute inset-[3px] rounded-full bg-black shadow-[inset_0_0_35px_rgba(0,0,0,1)]" />
            </div>

            <div className="absolute left-[22%] md:left-[26%] w-[12%] h-[35%] rounded-full bg-emerald-400/25 blur-[10px] z-10 pointer-events-none" />

            {/* Accretion Disk in Front */}
            <div className="absolute w-[150%] h-[40px] sm:h-[55px] md:h-[65px] z-20 flex items-center justify-center transform -rotate-[5.5deg] pointer-events-none">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-[12px] opacity-90 mix-blend-screen" />
              <div className="absolute inset-x-[5%] h-[16px] md:h-[22px] rounded-full bg-gradient-to-r from-green-600/40 via-emerald-400/80 to-green-600/25 blur-[4px] opacity-95 mix-blend-screen" />
              <div className="absolute left-[3%] right-[8%] h-[3px] md:h-[5px] bg-gradient-to-r from-emerald-200 via-white to-cyan-300 rounded-full shadow-[0_0_12px_rgba(255,255,255,1),0_0_24px_rgba(16,185,129,0.95)] opacity-100 mix-blend-screen animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute left-[8%] right-[14%] h-[0.75px] md:h-[1.5px] bg-white rounded-full opacity-95" />
              <div className="absolute left-[5%] w-[40%] h-[240%] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.32)_0%,transparent_75%)] blur-[10px] rounded-full mix-blend-screen" />
              <div className="absolute left-[12%] w-[20%] h-[180%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22)_0%,transparent_60%)] blur-[6px] rounded-full mix-blend-screen" />
            </div>

            {/* Space dust particles */}
            <div className="absolute w-[120%] h-[120%] pointer-events-none z-20 opacity-80">
              {orbitalParticles.map((p) => {
                let particleColor = "#ffffff"; 
                let particleGlow = "0 0 4px #ffffff";
                if (p.colorType === 1) {
                  particleColor = "#10b981"; 
                  particleGlow = "0 0 6px rgba(16,185,129,0.9)";
                } else if (p.colorType === 2) {
                  particleColor = "#34d399"; 
                  particleGlow = "0 0 5px rgba(52,211,153,0.85)";
                } else if (p.colorType === 3) {
                  particleColor = "#06b6d4"; 
                  particleGlow = "0 0 8px rgba(34,211,238,0.95)";
                }
                return (
                  <motion.div
                    key={p.id}
                    className="absolute top-1/2 left-1/2 rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      background: particleColor,
                      boxShadow: particleGlow,
                      x: "-50%",
                      y: "-50%",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: p.duration,
                      repeat: Infinity,
                      ease: "linear",
                      delay: p.delay,
                    }}
                  >
                    <div 
                      className="absolute rounded-full"
                      style={{
                        transform: `translate(${p.radius}px, 0px)`,
                        width: "100%",
                        height: "100%",
                        background: "inherit",
                        boxShadow: "inherit"
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Flyby Space Objects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
        <AnimatePresence>
          {spaceObjects.map((obj) => {
            const isSucked = obj.trajectory === "sucked";
            return (
              <motion.div
                key={obj.id}
                initial={{ 
                  x: obj.keyframesX[0], 
                  y: obj.keyframesY[0], 
                  scale: obj.keyframesScale[0], 
                  rotate: 90, 
                  opacity: 0 
                }}
                animate={{
                  x: obj.keyframesX,
                  y: obj.keyframesY,
                  scale: obj.keyframesScale,
                  rotate: [90, 90 + obj.rotationSpeed],
                  opacity: obj.keyframesOpacity,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: obj.duration,
                  ease: isSucked ? "easeIn" : "easeInOut",
                }}
                onAnimationComplete={() => {
                  setSpaceObjects((prev) => prev.filter((p) => p.id !== obj.id));
                }}
                className="absolute flex items-center justify-center pointer-events-none"
                style={{
                  width: obj.size,
                  height: obj.size,
                  transformOrigin: "center center",
                }}
              >
                {isSucked && (
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-md animate-ping" style={{ animationDuration: "2.5s" }} />
                )}
                {renderSpaceObjectIcon(obj.type)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Suction light trails */}
      {isSucking && (
        <svg className="absolute inset-0 w-full h-full z-[8] pointer-events-none mix-blend-screen">
          <AnimatePresence>
            {suctionStreaks.map((streak) => (
              <motion.path
                key={streak.id}
                d={streak.path}
                fill="none"
                stroke={streak.color}
                strokeWidth={streak.strokeWidth}
                strokeLinecap="round"
                initial={{ strokeDasharray: "180 180", strokeDashoffset: 180, opacity: 0 }}
                animate={{ 
                  strokeDashoffset: -180,
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: streak.duration,
                  delay: streak.delay,
                  repeat: 3,
                  ease: "easeIn",
                }}
              />
            ))}
          </AnimatePresence>
        </svg>
      )}

      {/* Dissolution Hawking Particles Layer */}
      {dissolveParticles.length > 0 && (
        <div className="absolute inset-0 w-full h-full z-[9] pointer-events-none overflow-hidden">
          {dissolveParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ 
                x: p.x[0], 
                y: p.y[0], 
                scale: p.scale[0], 
                opacity: p.opacity[0] 
              }}
              animate={{
                x: p.x,
                y: p.y,
                scale: p.scale,
                opacity: p.opacity,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.25, 1, 0.5, 1], // easeOut
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: p.color,
                boxShadow: `0 0 10px ${p.color}, 0 0 4px ${p.color}`,
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>
      )}

      {/* Shadows / Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020204]/30 via-transparent to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-y-0 left-0 w-full md:w-[48%] bg-gradient-to-r from-[#020204]/40 via-transparent to-transparent opacity-50 pointer-events-none z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-[#020204]/50 to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-x-0 top-0 h-[15%] bg-gradient-to-b from-[#020204]/50 to-transparent pointer-events-none z-[1]" />

      {/* Login Card */}
      <motion.div
        initial={
          hasLoggedOut
            ? { opacity: 0, scale: 0.96, filter: "blur(8px)" }
            : { opacity: 0, scale: 0.96, filter: "blur(8px)" }
        }
        animate={
          isSucking
            ? {
                scale: 0.9,
                opacity: 0,
                filter: "blur(12px)",
              }
            : { 
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
              }
        }
        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        style={{ willChange: "transform, opacity, filter" }}
        transition={{
          duration: 1.4, // slower, majestic transitions
          delay: hasLoggedOut ? 1.8 : 0, // delay card appearance when logging out to match Hawking particle waves
          ease: [0.16, 1, 0.3, 1], // easeOutExpo
        }}
        onAnimationComplete={() => {
          if (isSucking) {
            onLoginSuccess(usernameInput || "Guest");
          } else {
            setIsSettled(true);
          }
        }}
        className={`w-full h-full sm:h-[450px] sm:w-[410px] relative z-10 px-8 py-6 flex flex-col justify-between sm:rounded-[32px] sm:border-[8px] sm:border-[#0f0e13]/40 bg-[#040407]/12 ${isSettled ? "backdrop-blur-[28px]" : "backdrop-blur-none"} sm:shadow-[0_45px_100px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.005] pointer-events-none z-10 sm:rounded-[30px]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center h-full">
          <div className="mb-6 text-center select-none">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-emerald-400">EVENT HORIZON</span>
            </div>
            <h2 className="text-xl font-bold tracking-[0.12em] text-white font-mono bg-clip-text text-transparent bg-gradient-to-r from-white via-stone-200 to-stone-400">
              WELCOME
            </h2>
            <p className="text-[9px] text-stone-500 mt-1 uppercase tracking-[0.15em] font-light">
              Cognitive Singularity Portal
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tên tài khoản"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onFocus={startMusicOnInputFocus}
                disabled={isLoading}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-850 bg-[#050508]/60 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all duration-200"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onFocus={startMusicOnInputFocus}
                disabled={isLoading}
                className="w-full h-11 pl-10 pr-12 rounded-xl border border-stone-850 bg-[#050508]/60 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors duration-150 p-1 flex items-center justify-center cursor-pointer focus:outline-none select-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-red-955/25 border border-red-900/40 text-red-400 text-[11px] shadow-inner"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                  <p className="leading-relaxed font-light">{loginError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {loginSuccessMsg && (
              <p style={{ color: '#86efac', fontSize: '0.82rem', fontWeight: '600', marginTop: '1rem', background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>✓ {loginSuccessMsg}</p>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-white text-stone-950 font-semibold text-xs hover:bg-stone-100 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(255,255,255,0.05)] cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Đăng Nhập
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoading}
                className="w-full h-10 rounded-xl border border-stone-850 bg-[#0a0a0c]/20 hover:bg-[#0a0a0c]/80 hover:border-stone-700 hover:text-white text-stone-450 text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                Truy cập thử nghiệm nhanh
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// 4. Custom SVG vector renders representing modern, high-fidelity cosmic elements
function renderSpaceObjectIcon(type) {
  switch (type) {
    case "spaceship":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.85)] filter">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="currentColor" />
          <path d="M12 6L14 11L19 12L14 13L12 18L10 13L5 12L10 11Z" fill="#ffffff" opacity="0.9" />
          <circle cx="12" cy="12" r="2.5" fill="#22d3ee" className="animate-pulse" />
          <path d="M12 22L10 24L12 23L14 24Z" fill="#ef4444" className="animate-pulse" />
        </svg>
      );
    case "shuttle":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.85)] filter">
          <path d="M12 2L15 6L15 14L21 17L21 19L15 17L12 21L9 17L3 19L3 17L9 14L9 6Z" fill="currentColor" />
          <path d="M12 4L13.5 7L13.5 14L18 16.5L13.5 15.5L12 19.5L10.5 15.5L6 16.5L10.5 14L10.5 7Z" fill="#ffffff" />
          <path d="M12 21L10.5 24L12 22.5L13.5 24Z" fill="#f97316" className="animate-pulse" />
        </svg>
      );
    case "ufo":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-fuchsia-400 drop-shadow-[0_0_14px_rgba(232,121,249,0.9)] filter">
          <path d="M12 4C14.5 4 16.5 5.2 17 6.8C19.8 7.3 22 9.4 22 12C22 14.8 17.5 17 12 17C6.5 17 2 14.8 2 12C2 9.4 4.2 7.3 7 6.8C7.5 5.2 9.5 4 12 4Z" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="7" ry="2.5" fill="#ffffff" opacity="0.8" />
          <circle cx="6" cy="12" r="1.2" fill="#06b6d4" className="animate-ping" style={{ animationDuration: "1s" }} />
          <circle cx="12" cy="13.5" r="1.5" fill="#eab308" className="animate-ping" style={{ animationDuration: "0.8s" }} />
          <circle cx="18" cy="12" r="1.2" fill="#ef4444" className="animate-ping" style={{ animationDuration: "1.2s" }} />
          <path d="M8 8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
        </svg>
      );
    case "asteroid":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] filter">
          <path d="M12 3L16 4.5L20 8L21 12L19 17L15 20L10 21L5 18L3 13L4 8L8 4Z" fill="currentColor" />
          <path d="M12 5L15 6L18 9L19 12L17.5 15.5L14 18L10 19L6.5 16.5L5 12.5L5.5 9L8.5 6Z" fill="#78350f" opacity="0.4" />
          <circle cx="9" cy="9" r="1.8" fill="#1e1b4b" opacity="0.6" />
          <circle cx="15" cy="14" r="2.2" fill="#1e1b4b" opacity="0.5" />
          <circle cx="10" cy="15" r="1.2" fill="#1e1b4b" opacity="0.7" />
          <circle cx="4" cy="5" r="1" fill="#f59e0b" className="animate-pulse" />
          <circle cx="2" cy="8" r="1.5" fill="#f97316" className="animate-pulse" />
        </svg>
      );
  }
}