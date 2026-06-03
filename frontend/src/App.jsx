import React, { useState, useEffect, useMemo, useRef } from 'react';
import FlashcardPlayer from './components/FlashcardPlayer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const medicalSpecialties = [
  "Innere Medizin", "Infektion", "Pädiatrie", "Humangentik", "Dermatologie",
  "Anästhesis", "Intesiv- und Notfallmedizin", "Chirurgie", "Orthopädie",
  "Gynäkologie", "Urologie", "HNO", "Augenheilkunde", "Neurologie",
  "Psychiatrie", "Pharmakologie", "Arbeits- und Umweiltmedizin", "Rechtsmedizin",
  "Pathologie", "Epidemiologie", "Sozialmedizin und Alternative Heilverfharen und Rehabilitation"
];

const getCardSubTopic = (card) => {
  if (card.category === 'General') {
    return card.translation.replace(/^###\s+.*?\n/i, '').replace(/###/g, '').replace(/\*\*/g, '').trim();
  }
  const cardNumMatch = card.word.match(/\(Card\s*#(\d+)\)/i);
  const cardNumStr = cardNumMatch ? `(#${cardNumMatch[1]}) ` : '';
  const text = (card.word + ' ' + card.translation).toLowerCase();
  if (text.includes('therapie') || text.includes('behandlung') || text.includes('medikament') || text.includes('wirkstoff') || text.includes('dosis') || text.includes('dosierung') || text.includes('antibiose') || text.includes('antibiotik') || text.includes('resektion') || text.includes('antikoagulation') || text.includes('thrombolyse') || text.includes('thrombektomie') || text.includes('nadeldekompression')) {
    return `${cardNumStr}💊 Therapie`;
  }
  if (text.includes('diagnostik') || text.includes('diagnose') || text.includes('ekg') || text.includes('cct') || text.includes('mrt') || text.includes('ultraschall') || text.includes('labor') || text.includes('score') || text.includes('kriterien') || text.includes('zeichen')) {
    return `${cardNumStr}🔍 Diagnostik`;
  }
  if (text.includes('klinik') || text.includes('symptom') || text.includes('schmerz') || text.includes('fieber') || text.includes('leitsymptom') || text.includes('ausfall') || text.includes('parese') || text.includes('meningismus') || text.includes('anästhesie')) {
    return `${cardNumStr}🩺 Klinik & Symptome`;
  }
  return `${cardNumStr}📋 Allgemein`;
};

// Returns just the section label without the card number (for group header)
const getSubtopicLabel = (card) => {
  const text = (card.word + ' ' + card.translation).toLowerCase();
  if (text.includes('therapie') || text.includes('behandlung') || text.includes('medikament') || text.includes('wirkstoff') || text.includes('dosis') || text.includes('dosierung') || text.includes('antibiose') || text.includes('antibiotik') || text.includes('resektion') || text.includes('antikoagulation') || text.includes('thrombolyse') || text.includes('thrombektomie') || text.includes('nadeldekompression')) return '💊 Therapie';
  if (text.includes('diagnostik') || text.includes('diagnose') || text.includes('ekg') || text.includes('cct') || text.includes('mrt') || text.includes('ultraschall') || text.includes('labor') || text.includes('score') || text.includes('kriterien') || text.includes('zeichen')) return '🔍 Diagnostik';
  if (text.includes('klinik') || text.includes('symptom') || text.includes('schmerz') || text.includes('fieber') || text.includes('leitsymptom') || text.includes('ausfall') || text.includes('parese') || text.includes('meningismus') || text.includes('anästhesie')) return '🩺 Klinik & Symptome';
  return '📋 Allgemein';
};

// Meditricks M2 Top 100 Chapters ordered array
const meditricksM2Order = [
  "Ischämischer Schlaganfall",
  "Epidemiologie und Wahrscheinlichkeit",
  "Pneumonie",
  "Lungenkarzinom",
  "MammaKarzinom",
  "Meningitis",
  "Diabetes mellitus",
  "Bandscheibenprolaps",
  "Humangenetik (Klinik)",
  "Lyme-Borreliose",
  "Sepsis",
  "Vorhofflimmern",
  "Myokardinfarkt",
  "Reaktionen auf schwere Belastungen und Anpassungsstörungen",
  "Divertikulitis",
  "Orale Antikoagulanzien",
  "pAVK",
  "Subarachnoidalblutung",
  "Kolorektales Karzinom",
  "Nosokomiale Infektionen",
  "Studientypen der medizinischen Forschung",
  "Essstörungen",
  "Bakterielle Infektionen von Haut und Weichgewebe",
  "Angststörungen",
  "Lungenembolie",
  "Thanatologie",
  "Magenkarzinom",
  "Phlebothrombose",
  "Cholezystitis",
  "Hyperthyreose",
  "Arterielle Hypertonie",
  "Hyperurikämie und Gicht",
  "Zervixkarzinom",
  "Morbus Crohn",
  "Pneumothorax",
  "Antidiabetika",
  "Herzinsuffizienz",
  "Rheumatoide Arthritis",
  "Gesetzliche Krankenversicherung",
  "Riesenzellarteriitis",
  "Tuberkulose",
  "Zystische Fibrose",
  "Allergische Erkrankungen",
  "HIV-Infektion",
  "Psychopathologischer Befund",
  "Osteoporose",
  "Nierenzellkarzinom",
  "Ärztliche Rechtskunde",
  "Migräne",
  "Unipolare Depression",
  "Infektiöse Endokarditis",
  "COPD",
  "Zwangsstörungen",
  "Antibiotika",
  "Chronische Wunden und Wundheilung",
  "Lupus erythematodes",
  "Parkinson-Syndrom",
  "Sterilität, Infertilität und Impotenz",
  "Zytostatika",
  "EBV Infektiöse Mononukleose",
  "Polyneuropathie",
  "Guillain-Barré-Syndrom (GBS)",
  "Herpes zoster",
  "Masern",
  "Malignes Melanom",
  "Diagnostik in der Gynäkologie",
  "Axiale Spondylarthritis (M. Bechterew)",
  "Ovarialkarzinom",
  "Arthrose",
  "Sklerodermie",
  "Asthma bronchiale",
  "Epilepsien",
  "Rehabilitation",
  "Endometriose",
  "Sarkoidose",
  "Zöliakie",
  "Weichteilläsion der Schulter",
  "Alkoholabhängigkeit",
  "Schizophrenie",
  "Megaloblastäre Anämien",
  "Benignes Prostatasyndrom (BPS)",
  "Astrozytome & Glioblastom",
  "Multiple Sklerose",
  "Glaukom",
  "Psychotherapeutische Verfahren",
  "Morbus Perthes",
  "Antipsychotika / Neuroleptika",
  "Aortendissektion",
  "Neurologische Untersuchung",
  "Bakterielle Durchfallerkrankungen",
  "Soziale Sicherung",
  "Multiples Myelom",
  "Alzheimer-Krankheit",
  "Adrenogenitales Syndrom (AGS)",
  "Präklinische Traumaversorgung",
  "Nicht-Opioid-Analgetika",
  "Metabolisches Syndrom",
  "Akute Leukämien",
  "Cushing-Syndrom",
  "Mesenteriale Ischämie"
];

const normalizedMeditricksM2Order = meditricksM2Order.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''));

const getMeditricksTopicNumber = (name) => {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const idx = normalizedMeditricksM2Order.findIndex(normT => {
    if (norm === "humangentik" && normT.includes("humangenetik")) return true;
    if (norm === "mammakarzinom" && normT.includes("mammakarzinom")) return true;
    if (norm === "phlebothrombose" && normT.includes("phlebothrombose")) return true;
    if (norm === "benignesprostatasyndrombps" && normT.includes("benignesprostatasynd")) return true;
    if (norm.includes(normT) || normT.includes(norm)) return true;
    return false;
  });
  return idx !== -1 ? idx + 1 : 999;
};

// Groups clinical cards by disease name, sorted and prefixed by Meditricks TOP 100 numbering
// Returns array of { diseaseName, cards[] }
const groupCardsByClinicalTopic = (cards) => {
  const map = new Map();
  cards.forEach(card => {
    // Extract disease name: everything BEFORE "(Card #N)" — greedy match
    const nameMatch = card.word.match(/^([^(]+)\s*\(Card\s*#\d+\)/i);
    const diseaseName = nameMatch
      ? nameMatch[1].trim()
      : card.word.split('\n')[0].split('(')[0].trim();
    if (!map.has(diseaseName)) {
      map.set(diseaseName, { diseaseName, cards: [] });
    }
    map.get(diseaseName).cards.push(card);
  });

  return Array.from(map.values())
    .map(group => {
      const num = getMeditricksTopicNumber(group.diseaseName);
      const prefix = num && num !== 999 ? `${num}. ` : '';
      return {
        ...group,
        num: num,
        displayName: `${prefix}${group.diseaseName}`
      };
    })
    .sort((a, b) => a.num - b.num);
};


const playGentleClickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {
    console.warn("AudioContext blocked:", e);
  }
};


// ── Neon Wave Canvas (login + module picker background) ──────────────────────
const NeonWaveCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = 380;
    };
    resize();
    window.addEventListener('resize', resize);

    const waves = [
      { color: '#00f5ff', amplitude: 38, frequency: 0.0075, speed:  0.018, phase: 0,    width: 2,   opacity: 0.9  },
      { color: '#ff00e5', amplitude: 26, frequency: 0.011,  speed: -0.024, phase: 1.3,  width: 1.8, opacity: 0.8  },
      { color: '#39ff14', amplitude: 48, frequency: 0.0055, speed:  0.013, phase: 2.5,  width: 2.2, opacity: 0.75 },
      { color: '#ff2d6f', amplitude: 20, frequency: 0.015,  speed: -0.030, phase: 0.7,  width: 1.5, opacity: 0.7  },
      { color: '#b44fff', amplitude: 55, frequency: 0.0045, speed:  0.009, phase: 3.8,  width: 2.5, opacity: 0.65 },
      { color: '#ffae00', amplitude: 16, frequency: 0.019,  speed: -0.015, phase: 1.9,  width: 1.5, opacity: 0.6  },
    ];

    const centerY = 190;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      waves.forEach(w => {
        w.phase += w.speed;

        // Glow halo pass (extremely thick, soft fog glow)
        ctx.beginPath();
        ctx.lineWidth   = w.width * 16;
        ctx.strokeStyle = w.color;
        ctx.globalAlpha = w.opacity * 0.08;
        ctx.shadowBlur  = 35;
        ctx.shadowColor = w.color;
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = centerY + Math.sin(x * w.frequency + w.phase) * w.amplitude;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Core bright line pass (softened and highly blurred)
        ctx.beginPath();
        ctx.lineWidth   = w.width * 1.2;
        ctx.strokeStyle = w.color;
        ctx.globalAlpha = w.opacity * 0.32; // Lower opacity for dreamy mist
        ctx.shadowBlur  = 75; // Giant soft blur
        ctx.shadowColor = w.color;
        for (let x = 0; x <= canvas.width; x += 2) {
          const y = centerY + Math.sin(x * w.frequency + w.phase) * w.amplitude;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        width: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
};


export default function App() {
  const [selectedModule, setSelectedModule] = useState(null); // null = 2-square picker

  // Background music state (desktop login only)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const ytPlayerRef = useRef(null);
  const ytReadyRef = useRef(false);
  const musicContainerRef = useRef(null);
  
  // Auth & Login States
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('current_user') || '';
    if (!user) {
      localStorage.removeItem('is_logged_in');
    }
    return user;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const user = localStorage.getItem('current_user') || '';
    const logged = localStorage.getItem('is_logged_in') === 'true';
    return !!(user && logged);
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Desktop check for music
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 1024 && !/Mobi|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent);

  // Nhạc chạy ở login + module picker, tắt khi vào học phần, bật lại khi back ra
  const musicShouldPlay = isDesktop && selectedModule === null;

  useEffect(() => {
    if (!isDesktop) return;

    if (!musicShouldPlay) {
      // Vào học phần — tạm dừng nhạc
      if (ytPlayerRef.current && ytReadyRef.current) {
        try { ytPlayerRef.current.pauseVideo(); } catch(e) {}
        setIsMusicPlaying(false);
      }
      return;
    }

    // Load YT script nếu chưa có
    if (!window.YT && !document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = 'yt-iframe-api';
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      // Ensure the player container exists in body (not in React tree, so it never unmounts)
      let div = document.getElementById('yt-music-player');
      if (!div) {
        div = document.createElement('div');
        div.id = 'yt-music-player';
        div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
        document.body.appendChild(div);
      }
      if (ytPlayerRef.current) {
        // Player exists (returning from study module) — resume
        try {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(25);
          ytPlayerRef.current.playVideo();
          setIsMusicPlaying(true);
        } catch(e) {}
        return;
      }
      ytPlayerRef.current = new window.YT.Player('yt-music-player', {
        height: '1',
        width: '1',
        videoId: 'SlQR9iu09bQ',
        playerVars: {
          autoplay: 1,
          start: 107,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          mute: 1,
        },
        events: {
          onReady: (event) => {
            ytReadyRef.current = true;
            event.target.setVolume(25);
            event.target.playVideo();
            // Unmute khi click vào ô tài khoản (login) hoặc bất kỳ tương tác nào (module picker)
          },
          onStateChange: (event) => {
            if (event.data === 0) {
              event.target.seekTo(25, true);
              event.target.playVideo();
            }
            if (event.data === 1 && !ytPlayerRef.current.isMuted()) setIsMusicPlaying(true);
            if (event.data === 2) setIsMusicPlaying(false);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        initPlayer();
      };
    }
  }, [musicShouldPlay, isDesktop]);

  // Gọi khi user click vào ô nhập tài khoản — browser cho phép phát tiếng
  const startMusicOnInputFocus = () => {
    if (!ytPlayerRef.current || !ytReadyRef.current) return;
    try {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.setVolume(25);
      ytPlayerRef.current.playVideo();
      setIsMusicPlaying(true);
    } catch(e) {}
  };

  const toggleMusic = () => {
    if (!ytPlayerRef.current || !ytReadyRef.current) return;
    if (isMusicPlaying) {
      ytPlayerRef.current.pauseVideo();
      setIsMusicPlaying(false);
    } else {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.setVolume(25);
      ytPlayerRef.current.playVideo();
      setIsMusicPlaying(true);
    }
  };

  // 2nd layer PIN verification states for admin1 onwards
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingModule, setPendingModule] = useState(null);
  const [failedPinAttempts, setFailedPinAttempts] = useState(0);

  const handleLogin = () => {
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) {
      setLoginError('Vui lòng nhập tên tài khoản.');
      setLoginSuccessMsg('');
      return;
    }
    
    // Only allow admin and admin1
    if (trimmedUsername !== 'admin' && trimmedUsername !== 'admin1') {
      setLoginError('Tài khoản không tồn tại trên hệ thống.');
      setLoginSuccessMsg('');
      return;
    }
    
    if (passwordInput === '123') {
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('current_user', trimmedUsername);
      setLoginSuccessMsg('Đăng nhập thành công! Đang tải...');
      setLoginError('');
      playGentleClickSound();
      
      setTimeout(() => {
        setCurrentUser(trimmedUsername);
        setIsLoggedIn(true);
        setLoginSuccessMsg('');
      }, 800);
    } else {
      setLoginError('Mật khẩu không chính xác.');
      setLoginSuccessMsg('');
    }
  };

  const handleLogout = () => {
    playGentleClickSound();
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('current_user');
    setIsLoggedIn(false);
    setCurrentUser('');
    setUsernameInput('');
    setPasswordInput('');
    setLoginError('');
    setLoginSuccessMsg('');
    setSelectedModule(null);
    setPinInput('');
    setPinError('');
    setPendingModule(null);
  };

  const handleModuleClick = (moduleNum) => {
    // Only require 4-digit PIN for 'admin1' onwards
    if (currentUser !== 'admin') {
      setPendingModule(moduleNum);
      setPinInput('');
      setPinError('');
      playGentleClickSound();
    } else {
      setSelectedModule(moduleNum);
      playGentleClickSound();
    }
  };

  const handleVerifyPIN = (val = pinInput, isAutoSubmit = false) => {
    // Nếu là auto-submit và chưa nhập đủ 4 số, không làm gì cả
    if (isAutoSubmit && val.length < 4) {
      return;
    }

    // Check if input is a 4-digit number
    if (!/^\d{4}$/.test(val)) {
      if (!isAutoSubmit) {
        setPinError('Mật khẩu 2 lớp phải gồm đúng 4 ký tự số.');
      }
      return;
    }

    // Module 1 PIN: 2309, Module 2 PIN: 1603
    const requiredPin = pendingModule === 1 ? '2309' : '1603';

    if (val === requiredPin) {
      setSelectedModule(pendingModule);
      setPendingModule(null);
      setPinInput('');
      setPinError('');
      setFailedPinAttempts(0); // Reset attempts on successful entry
      playGentleClickSound();
    } else {
      // Nếu tự động kiểm tra lúc gõ đủ 4 số nhưng không khớp, ta CHỈ im lặng không báo lỗi
      if (isAutoSubmit) return;

      const nextAttemptsCount = failedPinAttempts + 1;
      setFailedPinAttempts(nextAttemptsCount);
      setPinInput(''); // Clear wrong input so user can re-type immediately
      
      if (nextAttemptsCount >= 3) {
        // Enforce logout instantly
        handleLogout();
        alert('Bạn đã nhập sai mật khẩu 2 lớp quá 3 lần. Hệ thống tự động đăng xuất để bảo mật.');
      } else {
        setPinError(`Mật khẩu 2 lớp không chính xác. (Sai ${nextAttemptsCount}/3 lần)`);
      }
    }
  };

  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wörten/Schlusswörten settings state
  const [studyCount, setStudyCount] = useState(10);
  const [studyStateFilter, setStudyStateFilter] = useState('unlearned'); // 'all', 'learned', 'unlearned'
  const [studyWordClassFilter, setStudyWordClassFilter] = useState('all'); // 'all', 'noun', 'verb', 'adjective', 'adverb', 'preposition'
  const [studyWordClasses, setStudyWordClasses] = useState([]);
  const [studySpecialties, setStudySpecialties] = useState([]);
  
  // Flashcard active session state (Inline player)
  const [activeSessionCards, setActiveSessionCards] = useState(null);

  // Bibliothek Modal Player state (Popup/Bump-up modal)
  const [modalSessionCards, setModalSessionCards] = useState(null);
  const [modalStartIndex, setModalStartIndex] = useState(0);

  // Unfinished session cache (in localStorage)
  const [unfinishedSession, setUnfinishedSession] = useState(null);

  // Navigation Panel Mode
  const [rightPanelMode, setRightPanelMode] = useState('worten'); // 'worten', 'bibliothek', 'flashcard'
  const [showCongrats, setShowCongrats] = useState(false);
  
  // Bibliothek search and filter states
  const [libSearchQuery, setLibSearchQuery] = useState('');
  const [libLetterFilter, setLibLetterFilter] = useState('All');
  const [libStatusFilter, setLibStatusFilter] = useState('all'); // 'all', 'learned', 'unlearned'
  const [libCategoryFilter, setLibCategoryFilter] = useState('All'); // For Y Khoa specialty filtering
  const [libWordClassFilter, setLibWordClassFilter] = useState('all'); // 'all', 'noun', 'verb', 'adjective', 'adverb', 'preposition'
  const [studyHistory, setStudyHistory] = useState([]);
  
  // Bibliothek Pagination States
  const [libCurrentPage, setLibCurrentPage] = useState(1);
  const libraryListRef = useRef(null);
  
  // Automatically reset to page 1 whenever any search or filter state changes
  useEffect(() => {
    setLibCurrentPage(1);
  }, [libSearchQuery, libLetterFilter, libStatusFilter, libCategoryFilter, libWordClassFilter, selectedModule]);

  // Smooth scroll library container to the top using premium ease-out cubic animation curve
  useEffect(() => {
    const element = libraryListRef.current;
    if (!element) return;
    
    const start = element.scrollTop;
    if (start === 0) return;
    
    const change = -start;
    const duration = 380; // 380ms is visually ideal for fluid deceleration
    let startTime = null;

    const animateScroll = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const time = Math.min(progress / duration, 1);
      
      // Cubic Ease-Out curve for organic deceleration
      const easeOutCubic = 1 - Math.pow(1 - time, 3);
      element.scrollTop = start + change * easeOutCubic;

      if (progress < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, [libCurrentPage]);

  // Load history dynamically based on selectedModule and currentUser
  useEffect(() => {
    if (selectedModule && currentUser) {
      const saved = localStorage.getItem(`study_history_words_user_${currentUser}_module_${selectedModule}`);
      setStudyHistory(saved ? JSON.parse(saved) : []);
    } else {
      setStudyHistory([]);
    }
  }, [selectedModule, currentUser]);

  // Fetch cards from API and override with user-specific progress from localStorage
  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/cards`);
      if (!res.ok) throw new Error('Không thể kết nối đến máy chủ.');
      const data = await res.json();
      
      // Apply user progress override
      if (currentUser) {
        const userProgressStr = localStorage.getItem(`progress_${currentUser}`);
        const userProgressMap = userProgressStr ? JSON.parse(userProgressStr) : {};
        
        const overriddenData = data.map(card => {
          const cardId = card._id || card.id;
          if (userProgressMap[cardId] !== undefined) {
            return { ...card, isLearned: userProgressMap[cardId] };
          }
          return card;
        });
        setAllCards(overriddenData);
      } else {
        setAllCards(data);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchCards();
    }
  }, [isLoggedIn, currentUser]);

  // Reset local active state when switching modules
  useEffect(() => {
    setActiveSessionCards(null);
    setModalSessionCards(null);
    setRightPanelMode('worten');
    setLibLetterFilter('All');
    setLibStatusFilter('all');
    setLibCategoryFilter('All');
    setLibWordClassFilter('all');
    setLibSearchQuery('');
    setStudySpecialties([]);
    setStudyWordClasses([]);

    if (selectedModule && currentUser) {
      const cacheKey = `unfinished_session_user_${currentUser}_module_${selectedModule}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setUnfinishedSession(JSON.parse(cached));
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      } else {
        setUnfinishedSession(null);
      }
    } else {
      setUnfinishedSession(null);
    }
  }, [selectedModule, currentUser]);

  // Global keydown listener for starting a session with Enter on Wörten Setup screen
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (rightPanelMode === 'worten' && !activeSessionCards && !modalSessionCards && !showCongrats) {
        if (e.code === 'Enter') {
          e.preventDefault();
          startNewSession();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [rightPanelMode, activeSessionCards, modalSessionCards, showCongrats, allCards, studyCount, studyStateFilter, studyWordClassFilter]);

  // Update card learned status instantly (for checkboxes) in localStorage
  const handleUpdateSingleCard = async (cardId, isLearned) => {
    if (!currentUser) return;
    
    // Save to user progress map in localStorage
    const userProgressStr = localStorage.getItem(`progress_${currentUser}`);
    const userProgressMap = userProgressStr ? JSON.parse(userProgressStr) : {};
    userProgressMap[cardId] = isLearned;
    localStorage.setItem(`progress_${currentUser}`, JSON.stringify(userProgressMap));

    // Update state instantly
    setAllCards(prev => prev.map(card => {
      const currentId = card._id || card.id;
      if (currentId === cardId) {
        return { ...card, isLearned };
      }
      return card;
    }));
  };

  // Launch a new session
  const startNewSession = () => {
    let pool = [];
    if (selectedModule === 1) {
      pool = allCards.filter(card => card.category === 'General');
    } else if (selectedModule === 2) {
      pool = allCards.filter(card => card.category !== 'General');
      if (studySpecialties.length > 0) {
        pool = pool.filter(card => studySpecialties.includes(card.category));
      }
    }

    // Filter by status
    if (studyStateFilter === 'learned') {
      pool = pool.filter(card => card.isLearned === true);
    } else if (studyStateFilter === 'unlearned') {
      pool = pool.filter(card => card.isLearned === false);
    }

    // Filter by word class / part of speech (Only for Module 1 / Tiếng Đức)
    if (selectedModule === 1 && studyWordClasses.length > 0) {
      pool = pool.filter(card => {
        const transLower = card.translation.toLowerCase();
        const wordLower = card.word.toLowerCase();
        return studyWordClasses.some(wc => {
          if (wc === 'noun') {
            return transLower.includes('(danh từ)') || wordLower.startsWith('der ') || wordLower.startsWith('die ') || wordLower.startsWith('das ');
          }
          if (wc === 'verb') {
            return transLower.includes('(động từ)');
          }
          if (wc === 'adjective') {
            return transLower.includes('(tính từ)');
          }
          if (wc === 'adverb') {
            return transLower.includes('(trạng từ)');
          }
          if (wc === 'preposition') {
            return transLower.includes('(giới từ)') || wordLower.includes('+ genitiv') || wordLower.includes('+ dativ');
          }
          return false;
        });
      });
    }

    // Shuffle pool randomly
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Number(studyCount));

    if (selected.length === 0) {
      alert("Không tìm thấy từ vựng nào khớp với bộ lọc.");
      return;
    }

    setActiveSessionCards(selected);
    setRightPanelMode('flashcard');
    
    // Save to local cached unfinished session for the current module & user
    const sessionObj = { cards: selected, timestamp: Date.now() };
    setUnfinishedSession(sessionObj);
    localStorage.setItem(`unfinished_session_user_${currentUser}_module_${selectedModule}`, JSON.stringify(sessionObj));
  };

  // Resume unfinished session
  const resumeSession = () => {
    if (unfinishedSession && unfinishedSession.cards.length > 0) {
      setActiveSessionCards(unfinishedSession.cards);
      setRightPanelMode('flashcard');
    }
  };

  // Complete study session normally: Save all changes to localStorage
  const saveSessionStates = async (statesMap) => {
    setLoading(true);
    try {
      if (!currentUser) return;
      
      const userProgressStr = localStorage.getItem(`progress_${currentUser}`);
      const userProgressMap = userProgressStr ? JSON.parse(userProgressStr) : {};

      // Loop and save each modified state to user local storage
      for (const cardId of Object.keys(statesMap)) {
        userProgressMap[cardId] = statesMap[cardId];
      }
      localStorage.setItem(`progress_${currentUser}`, JSON.stringify(userProgressMap));
      
      // Update studied cards history (capped at 30, newest first)
      const studiedCards = Object.keys(statesMap).map(cardId => {
        return allCards.find(c => (c._id || c.id) === cardId);
      }).filter(Boolean).map(c => ({
        ...c,
        isLearned: statesMap[c._id || c.id]
      }));

      setStudyHistory(prev => {
        const updated = [...studiedCards, ...prev.filter(c => !studiedCards.some(sc => (sc._id || sc.id) === (c._id || c.id)))];
        const sliced = updated.slice(0, 30);
        localStorage.setItem(`study_history_words_user_${currentUser}_module_${selectedModule}`, JSON.stringify(sliced));
        return sliced;
      });

      // Clear cache for this module
      localStorage.removeItem(`unfinished_session_user_${currentUser}_module_${selectedModule}`);
      setUnfinishedSession(null);
      setActiveSessionCards(null);
      setModalSessionCards(null);
      
      // Trigger beautiful Congratulatory modal popup!
      setShowCongrats(true);
      setRightPanelMode('worten');
      
      // Refresh deck list from database overriding with updated localStorage progress
      await fetchCards();
    } catch (err) {
      console.error('Lỗi lưu phiên học:', err);
    } finally {
      setLoading(false);
    }
  };

  // Exit session without saving (Hủy ngang học phần)
  const cancelSessionWithoutSaving = () => {
    setActiveSessionCards(null);
    setModalSessionCards(null);
    setRightPanelMode('worten');
  };

  // Delete cached unfinished session manually
  const discardUnfinishedSession = (e) => {
    e.stopPropagation();
    localStorage.removeItem(`unfinished_session_user_${currentUser}_module_${selectedModule}`);
    setUnfinishedSession(null);
  };

  // Filtered Bibliothek list
  const filteredLibraryCards = useMemo(() => {
    let list = [];
    if (selectedModule === 1) {
      list = allCards.filter(card => card.category === 'General');
    } else if (selectedModule === 2) {
      list = allCards.filter(card => card.category !== 'General');
      // Filter by specific medical specialty if selected
      if (libCategoryFilter !== 'All') {
        list = list.filter(card => card.category === libCategoryFilter);
      }
    }

    // Filter by word class in Library (Only for Module 1 / Tiếng Đức)
    if (selectedModule === 1 && libWordClassFilter !== 'all') {
      list = list.filter(card => {
        const transLower = card.translation.toLowerCase();
        const wordLower = card.word.toLowerCase();
        if (libWordClassFilter === 'noun') {
          return transLower.includes('(danh từ)') || wordLower.startsWith('der ') || wordLower.startsWith('die ') || wordLower.startsWith('das ');
        }
        if (libWordClassFilter === 'verb') {
          return transLower.includes('(động từ)');
        }
        if (libWordClassFilter === 'adjective') {
          return transLower.includes('(tính từ)');
        }
        if (libWordClassFilter === 'adverb') {
          return transLower.includes('(trạng từ)');
        }
        if (libWordClassFilter === 'preposition') {
          return transLower.includes('(giới từ)') || wordLower.includes('+ genitiv') || wordLower.includes('+ dativ');
        }
        return true;
      });
    }

    // Filter by Search Query
    if (libSearchQuery.trim() !== '') {
      const q = libSearchQuery.toLowerCase();
      list = list.filter(card => 
        card.word.toLowerCase().includes(q) || 
        card.translation.toLowerCase().includes(q)
      );
    }

    // Alphabet filter
    if (libLetterFilter !== 'All') {
      list = list.filter(card => {
        const cleanedWord = card.word.replace(/^(der|die|das)\s+/i, '').trim();
        return cleanedWord.charAt(0).toUpperCase() === libLetterFilter;
      });
    }

    // Status filter
    if (libStatusFilter === 'learned') {
      list = list.filter(card => card.isLearned === true);
    } else if (libStatusFilter === 'unlearned') {
      list = list.filter(card => card.isLearned === false);
    }

    return list;
  }, [allCards, selectedModule, libCategoryFilter, libWordClassFilter, libSearchQuery, libLetterFilter, libStatusFilter]);

  // Memoize the grouped clinical topic list for Module 2 to eliminate render blocking lag
  const groupedClinicalCards = useMemo(() => {
    if (selectedModule !== 2) return [];
    return groupCardsByClinicalTopic(filteredLibraryCards);
  }, [filteredLibraryCards, selectedModule]);

  const getModuleProgress = (moduleNum) => {
    let modCards = [];
    if (moduleNum === 1) {
      modCards = allCards.filter(c => c.category === 'General');
    } else {
      modCards = allCards.filter(c => c.category !== 'General');
    }
    if (modCards.length === 0) return 0;
    const learnedCount = modCards.filter(c => c.isLearned).length;
    return Math.round((learnedCount / modCards.length) * 100);
  };

  const getCurrentModuleTotalCardsCount = () => {
    if (selectedModule === 1) {
      return allCards.filter(c => c.category === 'General').length;
    }
    return allCards.filter(c => c.category !== 'General').length;
  };

  if (isLoggedIn && loading && allCards.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', background: '#0a0b10' }}>
        <div style={{ border: '4px solid rgba(255, 255, 255, 0.1)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Đang tải thư viện từ vựng...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isLoggedIn && error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', color: 'white', background: '#0a0b10' }}>
        <h2>Không thể kết nối Backend</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchCards} className="btn-primary" style={{ maxWidth: '200px' }}>Thử lại</button>
      </div>
    );
  }

  // 0. PREMIUM LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* YT player div lives in document.body (created by useEffect) — not in React tree */}
        {/* Music toggle button - desktop only */}
        {isDesktop && (
          <button
            onClick={toggleMusic}
            title={isMusicPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 9999,
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.25)',
              background: isMusicPlaying
                ? 'linear-gradient(135deg, rgba(99,102,241,0.85), rgba(168,85,247,0.85))'
                : 'rgba(30,30,50,0.75)',
              backdropFilter: 'blur(12px)',
              color: 'white',
              fontSize: '1.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isMusicPlaying
                ? '0 0 18px rgba(168,85,247,0.5), 0 4px 15px rgba(0,0,0,0.3)'
                : '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            {isMusicPlaying ? '🎵' : '🔇'}
          </button>
        )}

        {/* === BACKGROUND ANIMATIONS === */}
        <div className="login-aurora" />
        <div className="login-particles">
          {[...Array(12)].map((_, i) => <div key={i} className="login-particle" />)}
        </div>
        <div className="login-led-left" />
        <div className="login-led-right" />
        {/* Neon wave canvas behind card */}
        <NeonWaveCanvas />
        {/* Wave SVG bottom */}
        <div className="login-waves">
          <svg className="login-wave-1" viewBox="0 0 1440 130" preserveAspectRatio="none">
            <path d="M0,64 C240,110 480,20 720,64 C960,110 1200,20 1440,64 L1440,130 L0,130 Z" fill="rgba(99,102,241,0.18)" />
            <path d="M1440,64 C1200,110 960,20 720,64 C480,110 240,20 0,64 L0,130 L1440,130 Z" fill="rgba(99,102,241,0.18)" />
          </svg>
          <svg className="login-wave-2" viewBox="0 0 1440 130" preserveAspectRatio="none">
            <path d="M0,80 C200,30 400,110 600,70 C800,30 1000,100 1200,60 C1300,40 1380,80 1440,70 L1440,130 L0,130 Z" fill="rgba(168,85,247,0.13)" />
            <path d="M1440,80 C1240,30 1040,110 840,70 C640,30 440,100 240,60 C140,40 60,80 0,70 L0,130 L1440,130 Z" fill="rgba(168,85,247,0.13)" />
          </svg>
          <svg className="login-wave-3" viewBox="0 0 1440 130" preserveAspectRatio="none">
            <path d="M0,50 C360,130 720,0 1080,80 C1260,110 1380,40 1440,60 L1440,130 L0,130 Z" fill="rgba(59,130,246,0.1)" />
            <path d="M1440,50 C1080,130 720,0 360,80 C180,110 60,40 0,60 L0,130 L1440,130 Z" fill="rgba(59,130,246,0.1)" />
          </svg>
        </div>

        <div className="login-card-glow" style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.8rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <div>
            <svg width="72" height="48" viewBox="0 0 3 2" style={{ marginBottom: '1.2rem', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 15px rgba(0,0,0,0.5)', display: 'inline-block' }}>
              <rect y="0" width="3" height="0.667" fill="#000000"/>
              <rect y="0.667" width="3" height="0.667" fill="#DD0000"/>
              <rect y="1.333" width="3" height="0.667" fill="#FFCC00"/>
            </svg>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '800', color: 'white' }}>Đăng nhập</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Tài khoản</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nhập tên tài khoản..." 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                onFocus={startMusicOnInputFocus}
                onClick={startMusicOnInputFocus}
                style={{ padding: '0.8rem 1rem', borderRadius: '12px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Mật khẩu</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Nhập mật khẩu..." 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{ padding: '0.8rem 1rem', borderRadius: '12px' }}
              />
            </div>
          </div>

          {loginError && (
            <p style={{ color: '#fca5a5', fontSize: '0.82rem', fontWeight: '600', marginTop: '-0.5rem', background: 'rgba(239, 68, 68, 0.15)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>⚠️ {loginError}</p>
          )}

          {loginSuccessMsg && (
            <p style={{ color: '#86efac', fontSize: '0.82rem', fontWeight: '600', marginTop: '-0.5rem', background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>✓ {loginSuccessMsg}</p>
          )}

          <button 
            className="btn-primary" 
            onClick={handleLogin}
            style={{ padding: '0.9rem', fontSize: '1rem', borderRadius: '12px' }}
          >
            Đăng nhập →
          </button>
        </div>
      </div>
    );
  }

  // MODULE PICKER SCREEN (Home Dashboard)
  if (selectedModule === null) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>

        {/* YT player div lives in document.body (created by useEffect) — not in React tree */}

        {/* Music toggle button — bottom-right, same as login */}
        {isDesktop && (
          <button
            onClick={toggleMusic}
            title={isMusicPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
              width: '52px', height: '52px', borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.25)',
              background: isMusicPlaying
                ? 'linear-gradient(135deg, rgba(99,102,241,0.85), rgba(168,85,247,0.85))'
                : 'rgba(30,30,50,0.75)',
              backdropFilter: 'blur(12px)', color: 'white', fontSize: '1.4rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isMusicPlaying
                ? '0 0 18px rgba(168,85,247,0.5), 0 4px 15px rgba(0,0,0,0.3)'
                : '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            {isMusicPlaying ? '🎵' : '🔇'}
          </button>
        )}

        {/* === BACKGROUND ANIMATIONS === */}
        <div className="login-aurora" />
        <div className="login-particles">
          {[...Array(12)].map((_, i) => <div key={i} className="login-particle" />)}
        </div>
        <div className="login-led-left" />
        <div className="login-led-right" />
        <NeonWaveCanvas />
        <div className="login-waves">
          <svg className="login-wave-1" viewBox="0 0 1440 130" preserveAspectRatio="none">
            <path d="M0,64 C240,110 480,20 720,64 C960,110 1200,20 1440,64 L1440,130 L0,130 Z" fill="rgba(99,102,241,0.18)" />
            <path d="M1440,64 C1200,110 960,20 720,64 C480,110 240,20 0,64 L0,130 L1440,130 Z" fill="rgba(99,102,241,0.18)" />
          </svg>
          <svg className="login-wave-2" viewBox="0 0 1440 130" preserveAspectRatio="none">
            <path d="M0,80 C200,30 400,110 600,70 C800,30 1000,100 1200,60 C1300,40 1380,80 1440,70 L1440,130 L0,130 Z" fill="rgba(168,85,247,0.13)" />
            <path d="M1440,80 C1240,30 1040,110 840,70 C640,30 440,100 240,60 C140,40 60,80 0,70 L0,130 L1440,130 Z" fill="rgba(168,85,247,0.13)" />
          </svg>
          <svg className="login-wave-3" viewBox="0 0 1440 130" preserveAspectRatio="none">
            <path d="M0,50 C360,130 720,0 1080,80 C1260,110 1380,40 1440,60 L1440,130 L0,130 Z" fill="rgba(59,130,246,0.1)" />
            <path d="M1440,50 C1080,130 720,0 360,80 C180,110 60,40 0,60 L0,130 L1440,130 Z" fill="rgba(59,130,246,0.1)" />
          </svg>
        </div>

        {/* User indicator — top RIGHT */}
        <div className="home-user-indicator" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '0.6rem 1.2rem', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'fixed', top: '1.2rem', right: '1.5rem', zIndex: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tài khoản</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>👤 {currentUser}</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Đăng xuất
          </button>
        </div>

        <div className="module-picker-overlay" style={{ position: 'relative', zIndex: 2 }}>
          <svg width="72" height="48" viewBox="0 0 3 2" style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'transform 0.2s', flexShrink: 0 }} onClick={playGentleClickSound} className="logo-german-flag-home">
            <rect y="0" width="3" height="0.667" fill="#000000"/>
            <rect y="0.667" width="3" height="0.667" fill="#DD0000"/>
            <rect y="1.333" width="3" height="0.667" fill="#FFCC00"/>
          </svg>
          <p className="module-picker-subtitle" style={{ marginTop: '0.5rem' }}>
            Chào mừng <span style={{ color: 'var(--accent-active-color)', fontWeight: '700' }}>{currentUser}</span> đến với TÔI BỊ NGU. Hãy chọn một học phần chuyên biệt dưới đây để bắt đầu ôn luyện.
          </p>
          <div className="module-grid" style={{ maxWidth: '600px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            
            {/* Học phần 1: Tiếng Đức */}
            <div className="module-card module-card-deutsch" onClick={() => handleModuleClick(1)} style={{ padding: '3.5rem 2rem' }}>
              <span className="module-num" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '5rem', marginBottom: '0.5rem' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 15px rgba(2, 132, 199, 0.35))', borderRadius: '16px' }}>
                  <rect width="80" height="80" fill="#0083c2" />
                  <polygon points="0,0 80,45 0,60" fill="#0284c7" opacity="0.8" />
                  <polygon points="80,0 80,80 35,45" fill="#0369a1" opacity="0.9" />
                  <polygon points="0,80 80,80 40,30" fill="#075985" opacity="0.95" />
                  <text x="14" y="32" fill="#ffffff" fontFamily="var(--font-body)" fontSize="20" fontWeight="400" letterSpacing="-0.5">Test</text>
                  <text x="14" y="60" fill="#ffffff" fontFamily="var(--font-body)" fontSize="25" fontWeight="500" letterSpacing="-0.5">DaF</text>
                </svg>
              </span>
              <span className="module-name" style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>Học phần 1</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Deutsch</span>
            </div>

            {/* Học phần 2: Y Khoa */}
            <div className="module-card module-card-medical" onClick={() => handleModuleClick(2)} style={{ padding: '3.5rem 2rem' }}>
              <span className="module-num" style={{ fontSize: '3.5rem' }}>🩺</span>
              <span className="module-name" style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>Học phần 2</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>M2</span>
            </div>

          </div>
        </div>

        {/* --- PREMIUM 2ND-LAYER PIN MODAL FOR ADMIN1+ --- */}
        {pendingModule !== null && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 6, 12, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 3000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'overlayFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '3rem 2.5rem',
              textAlign: 'center',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              animation: 'pinModalEntry 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <div>
                <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.4))' }}>🔒</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: 'white', marginTop: '0.6rem' }}>
                  Nhập mã PIN
                </h3>
              </div>

              <div className="form-group" style={{ textAlign: 'center' }}>
                <input 
                  type="password" 
                  maxLength={4}
                  className="form-input" 
                  placeholder="••••" 
                  value={pinInput}
                  onChange={(e) => {
                    const cleanedVal = e.target.value.replace(/\D/g, '');
                    setPinInput(cleanedVal);
                    if (cleanedVal.length === 4) {
                      handleVerifyPIN(cleanedVal, true);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPIN()}
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: '12px', 
                    textAlign: 'center', 
                    fontSize: '1.6rem', 
                    letterSpacing: '0.6rem', 
                    paddingLeft: '0.6rem',
                    fontFamily: 'monospace',
                    background: 'rgba(0,0,0,0.2)'
                  }}
                  autoFocus
                />
              </div>

              {pinError && (
                <p style={{ color: '#fca5a5', fontSize: '0.82rem', fontWeight: '600', marginTop: '-0.5rem', background: 'rgba(239, 68, 68, 0.15)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>⚠️ {pinError}</p>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => { setPendingModule(null); setPinInput(''); setPinError(''); }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleVerifyPIN}
                  style={{
                    flex: 1,
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const selectedModuleVal = selectedModule;

  return (
    <div 
      className={`app-container ${selectedModule === 1 ? 'module-1-active' : selectedModule === 2 ? 'module-2-active' : ''}`}
      style={{
        '--accent-active-color': selectedModule === 2 ? '#10b981' : '#6366f1',
        '--accent-active-glow': selectedModule === 2 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(99, 102, 241, 0.18)',
        '--accent-active-glow-soft': selectedModule === 2 ? 'rgba(16, 185, 129, 0.06)' : 'rgba(99, 102, 241, 0.06)'
      }}
    >
      {/* Header */}
      <header className="app-header">
        <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }} onClick={() => setSelectedModule(null)}>
          <svg width="24" height="16" viewBox="0 0 3 2" style={{ borderRadius: '3px', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,0,0,0.3)', cursor: 'pointer', flexShrink: 0 }} onClick={playGentleClickSound}>
            <rect y="0" width="3" height="0.667" fill="#000000"/>
            <rect y="0.667" width="3" height="0.667" fill="#DD0000"/>
            <rect y="1.333" width="3" height="0.667" fill="#FFCC00"/>
          </svg>
          <span>TÔI BỊ NGU</span>
        </div>

        <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '0.4rem 1rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>👤 {currentUser}</span>
            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: '0.75rem', fontWeight: '600', padding: '0 0.2rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
              title="Đăng xuất khỏi tài khoản"
            >
              (Đăng xuất)
            </button>
          </div>

          <button 
            onClick={() => setSelectedModule(null)}
            className="module-selector-btn-large"
          >
            🔄 {selectedModule === 1 ? 'Deutsch' : 'M2'}
          </button>
        </div>
      </header>

      {/* Main Layout split screen */}
      <div className="main-layout">
        
        {/* Left Side: Sidebar navigation tab buttons */}
        <aside className="sidebar-panel responsive-sidebar" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '-0.4rem' }}>
            Menu điều hướng
          </div>

           {/* Navigation Tab 1: Los geht's Study Center */}
           <div 
             onClick={() => { setActiveSessionCards(null); setRightPanelMode('worten'); }}
             style={{
               background: rightPanelMode === 'worten' || rightPanelMode === 'flashcard' ? 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--accent-active-glow-soft) 100%)' : 'var(--bg-secondary)',
               border: '1px solid var(--glass-border)',
               borderRadius: '16px',
               padding: '1.5rem',
               cursor: 'pointer',
               transition: 'all 0.25s ease-in-out',
               borderColor: rightPanelMode === 'worten' || rightPanelMode === 'flashcard' ? 'var(--accent-active-color)' : 'var(--glass-border)',
               boxShadow: rightPanelMode === 'worten' || rightPanelMode === 'flashcard' ? '0 0 15px var(--accent-active-glow)' : 'none'
             }}
             className="nav-tab-btn"
           >
             <span style={{ fontSize: '2rem' }}>⚡</span>
             <div>
               <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white' }}>
                 Los geht's
               </h3>
               <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                 Thiết lập và ôn tập nhanh hôm nay.
               </p>
             </div>
           </div>

          {/* Navigation Tab 2: Bibliothek Search Library */}
          <div 
            onClick={() => { setActiveSessionCards(null); setRightPanelMode('bibliothek'); }}
            style={{
              background: rightPanelMode === 'bibliothek' ? 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--accent-active-glow-soft) 100%)' : 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderColor: rightPanelMode === 'bibliothek' ? 'var(--accent-active-color)' : 'var(--glass-border)',
              boxShadow: rightPanelMode === 'bibliothek' ? '0 0 15px var(--accent-active-glow)' : 'none'
            }}
            className="nav-tab-btn"
          >
            <span style={{ fontSize: '2rem' }}>📚</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white' }}>
                Bibliothek
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Duyệt & Tìm kiếm {getCurrentModuleTotalCardsCount()} từ vựng.
              </p>
            </div>
          </div>

          {/* Navigation Tab 3: Lịch sử ôn tập (History) */}
          <div 
            onClick={() => { setActiveSessionCards(null); setRightPanelMode('history'); }}
            style={{
              background: rightPanelMode === 'history' ? 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--accent-active-glow-soft) 100%)' : 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderColor: rightPanelMode === 'history' ? 'var(--accent-active-color)' : 'var(--glass-border)',
              boxShadow: rightPanelMode === 'history' ? '0 0 15px var(--accent-active-glow)' : 'none'
            }}
            className="nav-tab-btn"
          >
            <span style={{ fontSize: '2rem' }}>🕒</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white' }}>
                History
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Xem lại {studyHistory.length}/30 từ vựng đã ôn gần đây.
              </p>
            </div>
          </div>

          <div style={{ flex: 1 }}></div>

          {/* Progress display in Sidebar bottom */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: '600', color: 'white', marginBottom: '0.4rem' }}>Tiến độ học tập</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Đã thuộc:</span>
              <span style={{ color: 'var(--status-learned)', fontWeight: '700' }}>{getModuleProgress(selectedModule)}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${getModuleProgress(selectedModule)}%`, height: '100%', background: 'var(--status-learned)' }}></div>
            </div>
          </div>

        </aside>

        {/* Right Side Panel: dynamic workspace */}
        <main className="content-area" style={{ padding: rightPanelMode === 'flashcard' ? '2rem' : '0' }}>
          
          {/* 1. FLASHCARD STUDY MODE */}
          {rightPanelMode === 'flashcard' && activeSessionCards && (
            <FlashcardPlayer 
              cards={activeSessionCards} 
              onSaveSessionStates={saveSessionStates}
              onCancelSession={cancelSessionWithoutSaving}
            />
          )}

          {/* 2. WÖRTEN / SCHLUSSWÖRTEN CONFIGURATION WORKSPACE (Moved to right panel!) */}
          {rightPanelMode === 'worten' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              background: 'var(--bg-secondary)',
              animation: 'fadeIn 0.3s ease-out',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem'
            }}>
              
              <div 
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '24px',
                  padding: '3rem 2.5rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.8rem'
                }}
                className="worten-large-setup-card"
              >
                
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>⚡</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                    Los geht's
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    Thiết lập số lượng câu hỏi và bộ lọc để bắt đầu phiên học flashcard.
                  </p>
                </div>

                {/* Continue Unfinished Session with distinct buttons */}
                {unfinishedSession && (
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(59, 130, 246, 0.15))',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.2rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        📚 Tiếp tục phần học dở
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'white' }}>
                        Có 1 phiên học dở gồm {unfinishedSession.cards.length} từ vựng
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {/* Line 1 button: Tiếp tục */}
                      <button 
                        onClick={resumeSession}
                        style={{
                          flex: 1,
                          background: 'var(--accent-primary)',
                          color: 'white',
                          border: 'none',
                          padding: '0.65rem 1rem',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        ▶ Tiếp tục
                      </button>
                      {/* Line 2 button: Loại bỏ */}
                      <button 
                        onClick={discardUnfinishedSession}
                        style={{
                          flex: 1,
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '0.65rem 1rem',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        🗑 Loại bỏ
                      </button>
                    </div>
                  </div>
                )}

                {/* Setup Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  
                   <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      {selectedModule === 2 ? "Số lượng câu hỏi lâm sàng ôn tập hôm nay" : "Số lượng từ vựng ôn tập hôm nay"}
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      className="form-input" 
                      value={studyCount}
                      onChange={(e) => setStudyCount(e.target.value)}
                      style={{ padding: '0.8rem 1rem', fontSize: '1rem', borderRadius: '12px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      {selectedModule === 2 ? "Trạng thái câu hỏi lâm sàng mục tiêu" : "Trạng thái từ vựng mục tiêu"}
                    </label>
                    <select 
                      className="form-select"
                      value={studyStateFilter}
                      onChange={(e) => setStudyStateFilter(e.target.value)}
                      style={{ padding: '0.8rem', fontSize: '1rem', borderRadius: '12px' }}
                    >
                      <option value="all">Tất cả trạng thái (Tổng hợp)</option>
                      <option value="unlearned">
                        {selectedModule === 2 ? "Chưa thuộc (Khuyên dùng)" : "Chưa học (Đỏ - Khuyên dùng)"}
                      </option>
                      <option value="learned">
                        {selectedModule === 2 ? "Đã thuộc (Ôn tập lại)" : "Đã học (Xanh lá - Ôn tập lại)"}
                      </option>
                    </select>
                  </div>

                  {selectedModule === 1 && (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Loại từ vựng ôn tập (Chọn nhiều loại cùng lúc)</label>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                      }}>
                        <button
                          onClick={() => setStudyWordClasses([])}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            border: studyWordClasses.length === 0 ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                            background: studyWordClasses.length === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                            color: studyWordClasses.length === 0 ? 'white' : 'var(--text-secondary)'
                          }}
                        >
                          Tất cả loại từ
                        </button>
                        {[
                          { id: 'noun', name: 'Danh từ (Nouns)' },
                          { id: 'verb', name: 'Động từ (Verbs)' },
                          { id: 'adjective', name: 'Tính từ (Adjectives)' },
                          { id: 'adverb', name: 'Trạng từ (Adverbs)' },
                          { id: 'preposition', name: 'Giới từ (Prepositions)' }
                        ].map(wc => {
                          const isActive = studyWordClasses.includes(wc.id);
                          return (
                            <button
                              key={wc.id}
                              onClick={() => {
                                setStudyWordClasses(prev => {
                                  if (prev.includes(wc.id)) {
                                    return prev.filter(id => id !== wc.id);
                                  } else {
                                    return [...prev, wc.id];
                                  }
                                });
                              }}
                              style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                color: isActive ? 'white' : 'var(--text-secondary)'
                              }}
                            >
                              {wc.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedModule === 2 && (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Chọn Chuyên Khoa Ôn Tập (Chọn nhiều chuyên khoa cùng lúc)</label>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        padding: '0.8rem',
                        background: 'var(--bg-primary)',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                      }}>
                        <button
                          onClick={() => setStudySpecialties([])}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            border: studySpecialties.length === 0 ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                            background: studySpecialties.length === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                            color: studySpecialties.length === 0 ? 'white' : 'var(--text-secondary)'
                          }}
                        >
                          Tất cả chuyên khoa
                        </button>
                        {medicalSpecialties.map(spec => {
                          const isActive = studySpecialties.includes(spec);
                          return (
                            <button
                              key={spec}
                              onClick={() => {
                                setStudySpecialties(prev => {
                                  if (prev.includes(spec)) {
                                    return prev.filter(s => s !== spec);
                                  } else {
                                    return [...prev, spec];
                                  }
                                });
                              }}
                              style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                color: isActive ? 'white' : 'var(--text-secondary)'
                              }}
                            >
                              {spec}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                <button 
                  className="btn-primary" 
                  onClick={startNewSession} 
                  style={{ padding: '1rem', fontSize: '1.05rem', borderRadius: '12px', marginTop: '0.5rem' }}
                >
                  Bắt đầu ôn Flashcard →
                </button>

              </div>

            </div>
          )}

          {/* 3. BIBLIOTHEK VIEWER */}
          {rightPanelMode === 'bibliothek' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              background: 'var(--bg-secondary)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              
              {/* Header with Search and Quick Filters */}
              <div className="lib-header-container" style={{
                background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem'
              }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>
                      {selectedModule === 2 ? "Thư viện lâm sàng (Klinik)" : "Thư viện từ vựng (Bibliothek)"}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {selectedModule === 2 
                        ? "Duyệt các ca bệnh lâm sàng M2 tinh giản. Nhấp để xem chi tiết dạng Flashcard." 
                        : "Duyệt từ gốc cực kỳ tinh giản. Nhấp để tra cứu chi tiết dạng Flashcard."}
                    </p>
                  </div>
                  <button 
                    onClick={() => setRightPanelMode('worten')}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    ✕ Đóng thư viện
                  </button>
                </div>

                {/* Search input and status filters */}
                <div className="lib-filter-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  
                  {/* Modern Search Bar */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                    <input 
                      type="text" 
                      placeholder={selectedModule === 2 
                        ? "Tìm kiếm nhanh ca bệnh, bệnh học hoặc nghĩa..." 
                        : "Tìm kiếm nhanh bằng từ tiếng Đức hoặc nghĩa tiếng Việt..."}
                      className="form-input" 
                      value={libSearchQuery}
                      onChange={(e) => setLibSearchQuery(e.target.value)}
                      style={{
                        paddingLeft: '2.8rem',
                        background: 'var(--bg-primary)',
                        fontSize: '0.95rem',
                        borderRadius: '10px'
                      }}
                    />
                    {libSearchQuery && (
                      <button 
                        onClick={() => setLibSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Specialty Dropdown for Medicine Module */}
                  {selectedModule === 2 && (
                    <div style={{ width: '280px' }}>
                      <select 
                        className="form-select" 
                        value={libCategoryFilter}
                        onChange={(e) => setLibCategoryFilter(e.target.value)}
                        style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '10px' }}
                      >
                        <option value="All">Tất cả chuyên khoa ({medicalSpecialties.length})</option>
                        {medicalSpecialties.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Word Class Dropdown for German Module */}
                  {selectedModule === 1 && (
                    <div style={{ width: '220px' }}>
                      <select 
                        className="form-select" 
                        value={libWordClassFilter}
                        onChange={(e) => setLibWordClassFilter(e.target.value)}
                        style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '10px' }}
                      >
                        <option value="all">Tất cả loại từ</option>
                        <option value="noun">Danh từ (Nouns)</option>
                        <option value="verb">Động từ (Verbs)</option>
                        <option value="adjective">Tính từ (Adjectives)</option>
                        <option value="adverb">Trạng từ (Adverbs)</option>
                        <option value="preposition">Giới từ (Prepositions)</option>
                      </select>
                    </div>
                  )}

                  {/* Learned Status Filters */}
                  <div className="status-badge-filter" style={{ background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <button 
                      className={`filter-badge ${libStatusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setLibStatusFilter('all')}
                    >
                      Tất cả
                    </button>
                    <button 
                      className={`filter-badge ${libStatusFilter === 'unlearned' ? 'active' : ''}`}
                      onClick={() => setLibStatusFilter('unlearned')}
                    >
                      Chưa học
                    </button>
                    <button 
                      className={`filter-badge ${libStatusFilter === 'learned' ? 'active' : ''}`}
                      onClick={() => setLibStatusFilter('learned')}
                    >
                      Đã học
                    </button>
                  </div>

                </div>

                {/* Alphabet filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>Lọc chữ cái:</span>
                  <div className="alphabet-filter" style={{ flex: 1, marginBottom: 0, paddingBottom: 0 }}>
                    <button 
                      className={`letter-btn ${libLetterFilter === 'All' ? 'active' : ''}`}
                      onClick={() => setLibLetterFilter('All')}
                      style={{ padding: '0.3rem 0.6rem' }}
                    >
                      Tất cả
                    </button>
                    {alphabet.map(letter => (
                      <button 
                        key={letter} 
                        className={`letter-btn ${libLetterFilter === letter ? 'active' : ''}`}
                        onClick={() => setLibLetterFilter(letter)}
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Scrollable Word Grid */}
              <div ref={libraryListRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }} className="library-large-list">

                {filteredLibraryCards.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
                    <h3>Không tìm thấy thẻ nào phù hợp</h3>
                  </div>
                ) : (
                  <>
                    {selectedModule === 2 ? (
                      // ── Module 2: Grouped & Paginated by disease name (8 groups per page) ──
                      (() => {
                        const groupsPerPage = 8;
                        const totalPages = Math.ceil(groupedClinicalCards.length / groupsPerPage);
                        const paginatedGroups = groupedClinicalCards.slice((libCurrentPage - 1) * groupsPerPage, libCurrentPage * groupsPerPage);
                        
                        return (
                          <>
                            {paginatedGroups.map(({ diseaseName, displayName, cards: groupCards }) => {
                              const learnedCount = groupCards.filter(c => c.isLearned).length;
                              const allLearned = learnedCount === groupCards.length;
                              return (
                                 <div key={diseaseName} style={{ marginBottom: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                                  {/* Group header — disease name */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1.1rem', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'white' }}>{displayName}</span>
                                    <span style={{ fontSize: '0.7rem', color: allLearned ? '#34d399' : 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem', fontWeight: '600' }}>
                                      {learnedCount}/{groupCards.length} ✓
                                    </span>
                                  </div>
                                  {/* Cards inside group */}
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {groupCards.map((card, idx) => {
                                      const cardId = card._id || card.id;
                                      const cardNum = card.word.match(/\(Card\s*#(\d+)\)/i);
                                      const num = cardNum ? cardNum[1] : (idx + 1);
                                      const subtopicLabel = getSubtopicLabel(card);
                                      // Extract the question line
                                      const lines = card.word.split('\n').map(l => l.trim()).filter(Boolean);
                                      const questionLine = lines[1] || lines[0] || '';
                                      const preview = questionLine.replace(/\{\{c\d+::[^}]*\}\}/g, '[...]').substring(0, 80);
                                      return (
                                        <div
                                          key={cardId}
                                          className="library-large-card-compact"
                                          onClick={() => {
                                            setModalSessionCards(filteredLibraryCards);
                                            setModalStartIndex(filteredLibraryCards.findIndex(c => (c._id || c.id) === cardId));
                                          }}
                                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.55rem 1.1rem', borderBottom: idx < groupCards.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                        >
                                          {/* Number */}
                                          <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'rgba(165,180,252,0.5)', minWidth: '1.5rem', flexShrink: 0 }}>#{num}</span>
                                          {/* Question preview */}
                                          <span style={{ flex: 1, fontSize: '0.82rem', color: card.isLearned ? '#86efac' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {preview}
                                          </span>
                                          {/* Subtopic badge */}
                                          <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '0.1rem 0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            {subtopicLabel}
                                          </span>
                                          {/* Checkbox */}
                                          <div
                                            onClick={(e) => { e.stopPropagation(); handleUpdateSingleCard(cardId, !card.isLearned); }}
                                            style={{ width: '20px', height: '20px', borderRadius: '5px', border: card.isLearned ? '1.5px solid var(--status-learned)' : '1.5px solid rgba(255,255,255,0.2)', background: card.isLearned ? 'rgba(16,185,129,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--status-learned)', fontWeight: '900', fontSize: '0.8rem', transition: 'all 0.15s', flexShrink: 0 }}
                                          >
                                            {card.isLearned ? '✓' : ''}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                <button disabled={libCurrentPage === 1} onClick={() => setLibCurrentPage(p => Math.max(1, p - 1))} className="btn-nav" style={{ width: '36px', height: '36px' }}>←</button>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                  Chủ đề <span style={{ color: 'var(--accent-active-color)' }}>{(libCurrentPage - 1) * groupsPerPage + 1} - {Math.min(libCurrentPage * groupsPerPage, groupedClinicalCards.length)}</span> trên {groupedClinicalCards.length}
                                </span>
                                <button disabled={libCurrentPage === totalPages} onClick={() => setLibCurrentPage(p => Math.min(totalPages, p + 1))} className="btn-nav" style={{ width: '36px', height: '36px' }}>→</button>
                              </div>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      // ── Module 1: Paginated Flat Grid (32 items per page) ──
                      (() => {
                        const itemsPerPage = 32;
                        const totalPages = Math.ceil(filteredLibraryCards.length / itemsPerPage);
                        const paginatedFlatCards = filteredLibraryCards.slice((libCurrentPage - 1) * itemsPerPage, libCurrentPage * itemsPerPage);
                        
                        return (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem', alignContent: 'start' }}>
                              {paginatedFlatCards.map((card, index) => {
                                const cardId = card._id || card.id;
                                const globalIndex = (libCurrentPage - 1) * itemsPerPage + index;
                                return (
                                  <div key={cardId} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }} className="library-large-card-compact"
                                    onClick={() => { setModalSessionCards(filteredLibraryCards); setModalStartIndex(globalIndex); }}>
                                    <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <h4 style={{ fontSize: '1.08rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.word.split('(')[0].split(',')[0].trim()}</h4>
                                      <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getCardSubTopic(card)}</span>
                                    </div>
                                    <div onClick={(e) => { e.stopPropagation(); handleUpdateSingleCard(cardId, !card.isLearned); }} style={{ width: '24px', height: '24px', borderRadius: '6px', border: card.isLearned ? '1.5px solid var(--status-learned)' : '1.5px solid var(--text-muted)', background: card.isLearned ? 'rgba(16,185,129,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--status-learned)', fontWeight: '900', fontSize: '0.95rem', transition: 'all 0.15s' }} title={card.isLearned ? 'Đã học' : 'Chưa học'}>
                                      {card.isLearned ? '✓' : ''}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                <button disabled={libCurrentPage === 1} onClick={() => setLibCurrentPage(p => Math.max(1, p - 1))} className="btn-nav" style={{ width: '36px', height: '36px' }}>←</button>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                  Từ vựng <span style={{ color: 'var(--accent-active-color)' }}>{(libCurrentPage - 1) * itemsPerPage + 1} - {Math.min(libCurrentPage * itemsPerPage, filteredLibraryCards.length)}</span> trên {filteredLibraryCards.length}
                                </span>
                                <button disabled={libCurrentPage === totalPages} onClick={() => setLibCurrentPage(p => Math.min(totalPages, p + 1))} className="btn-nav" style={{ width: '36px', height: '36px' }}>→</button>
                              </div>
                            )}
                          </>
                        );
                      })()
                    )}
                  </>
                )}

              </div>

            </div>
          )}

          {/* 4. HISTORY VIEWER */}
          {rightPanelMode === 'history' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              background: 'var(--bg-secondary)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              
              {/* Header with Title */}
              <div style={{
                padding: '2rem',
                background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>
                    Lịch sử ôn tập (History)
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Hiển thị tối đa 30 từ vựng bạn vừa ôn tập gần đây. Nhấp vào từ để xem chi tiết hoặc ôn lại.
                  </p>
                </div>
                <button 
                  onClick={() => setRightPanelMode('worten')}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  ✕ Đóng lịch sử
                </button>
              </div>

              {/* Scrollable Word Grid for History */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.2rem',
                alignContent: 'start'
              }} className="library-large-list">
                
                {studyHistory.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🕒</span>
                    <h3>Chưa có từ vựng nào trong lịch sử</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Hãy hoàn thành một phiên học flashcard để các từ học được lưu lại tại đây.
                    </p>
                  </div>
                ) : (
                  studyHistory.map((card, index) => {
                    const cardId = card._id || card.id;
                    return (
                      <div 
                        key={cardId} 
                        style={{
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '16px',
                          padding: '1.2rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        className="library-large-card-compact"
                        onClick={() => {
                          setModalSessionCards(studyHistory);
                          setModalStartIndex(index);
                        }}
                      >
                        <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <h4 style={{ fontSize: '1.08rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={card.word}>
                            {card.word.split('(')[0].split(',')[0].trim()}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getCardSubTopic(card)}
                          </span>
                          <span style={{ alignSelf: 'flex-start', fontSize: '0.6rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '0.05rem 0.35rem', borderRadius: '4px', marginTop: '0.1rem' }}>
                            {card.category === 'General' ? 'Tiếng Đức' : card.category}
                          </span>
                        </div>

                        {/* Direct Tick checkbox */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateSingleCard(cardId, !card.isLearned);
                            // Also update local studyHistory state so the checkbox reflects immediately
                            setStudyHistory(prev => {
                              const updated = prev.map(c => {
                                const cId = c._id || c.id;
                                if (cId === cardId) {
                                  return { ...c, isLearned: !c.isLearned };
                                }
                                return c;
                              });
                              localStorage.setItem(`study_history_words_module_${selectedModule}`, JSON.stringify(updated));
                              return updated;
                            });
                          }}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            border: card.isLearned ? '1.5px solid var(--status-learned)' : '1.5px solid var(--text-muted)',
                            background: card.isLearned ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--status-learned)',
                            fontWeight: '900',
                            fontSize: '0.95rem',
                            transition: 'all 0.15s'
                          }}
                          title={card.isLearned ? "Đã học (Bấm để hủy đánh dấu)" : "Chưa học (Bấm để đánh dấu đã học)"}
                        >
                          {card.isLearned ? '✓' : ''}
                        </div>

                      </div>
                    );
                  })
                )}
                
              </div>

            </div>
          )}

        </main>

      </div>

      {/* --- BUMP-UP OVERLAY MODAL FOR DETAILED TRA CỨU --- */}
      {modalSessionCards && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 6, 12, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'modalBumpUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={() => setModalSessionCards(null)}
        >
          <div 
            style={{
              width: '90%',
              maxWidth: '720px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '2.5rem 2rem 2rem 2rem',
              position: 'relative',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setModalSessionCards(null)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: 'var(--text-secondary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.8rem',
                transition: 'all 0.15s'
              }}
              title="Đóng bảng tra cứu (ESC)"
            >
              ✕
            </button>

            <FlashcardPlayer 
              cards={modalSessionCards}
              startIndex={modalStartIndex}
              onSaveSessionStates={saveSessionStates}
              onCancelSession={() => setModalSessionCards(null)}
            />
          </div>
        </div>
      )}

      {/* --- CONGRATULATIONS POPUP MODAL --- */}
      {showCongrats && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 6, 12, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'modalBumpUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center',
            maxWidth: '460px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(99, 102, 241, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))' }}>🏆</span>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                Ausgezeichnet!
              </h2>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#a5b4fc', marginBottom: '0.8rem' }}>
                Chúc mừng bạn đã hoàn thành!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Toàn bộ từ vựng trong phiên ôn tập vừa rồi đã được lưu và cập nhật đồng bộ thành công vào cơ sở dữ liệu học tập.
              </p>
            </div>
            <button 
              onClick={() => {
                setShowCongrats(false);
                setRightPanelMode('worten');
              }}
              style={{
                width: '100%',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalBumpUp {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pinModalEntry {
          0% { opacity: 0; transform: scale(0.85) translateY(60px); filter: blur(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
         .library-large-card-compact:hover {
          background: var(--bg-tertiary) !important;
          border-color: var(--accent-primary) !important;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
          transform: translateY(-3px);
        }
        .library-large-card-compact:active {
          transform: translateY(-1px) scale(0.985);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
          transition: transform 0.1s ease;
        }
        .nav-tab-btn:hover {
          background: var(--bg-tertiary) !important;
          border-color: var(--accent-primary) !important;
          transform: translateX(4px);
        }
        .nav-tab-btn:active {
          transform: translateX(2px) scale(0.975);
          transition: transform 0.1s ease;
        }
        .module-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .module-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2) !important;
        }
        .module-card:active {
          transform: translateY(-2px) scale(0.975);
          transition: transform 0.1s ease;
        }
        button:active {
          transform: scale(0.96);
          transition: transform 0.1s ease;
        }
        .btn-primary:active, .btn-secondary:active, .module-selector-btn:active {
          transform: scale(0.96) !important;
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); box-shadow: 0 0 12px var(--accent-primary); }
          50% { transform: scale(1.06); box-shadow: 0 0 24px var(--accent-primary), 0 0 8px rgba(99, 102, 241, 0.4); }
          100% { transform: scale(1); box-shadow: 0 0 12px var(--accent-primary); }
        }
        .logo-icon {
          animation: pulseGlow 2.2s infinite ease-in-out;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .logo-icon:hover {
          transform: rotate(15deg) scale(1.12) !important;
        }
        .logo-icon:active {
          transform: rotate(-10deg) scale(0.88) !important;
        }
      `}</style>
    </div>
  );
}
