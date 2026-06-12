import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  ArrowLeft, 
  Search, 
  Plus, 
  AlertOctagon, 
  RefreshCw, 
  Activity, 
  Zap,
  Globe,
  ChevronDown,
  Info
} from 'lucide-react';
import singularityCore from '../singularity_core.png';

const API = 'http://localhost:5000/api';

// ── Starfield background ────────────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars with slight crimson/violet tint
    for (let i = 0; i < 200; i++) {
      const isCrimson = Math.random() > 0.7;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.2 + 0.05,
        opacity: Math.random() * 0.7 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        color: isCrimson 
          ? `rgba(239, 68, 68, ${Math.random() * 0.4 + 0.3})` 
          : `rgba(200, 210, 255, ${Math.random() * 0.6 + 0.4})`
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.twinkle += 0.015;
        const op = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        // Replace base opacity in color string with computed op
        ctx.fillStyle = s.color.replace(/[\d\.]+\)$/, `${op})`);
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55,
    }} />
  );
}

// ── Shooting stars ──────────────────────────────────────────────────────
function ShootingStars() {
  const [shots, setShots] = useState([]);
  useEffect(() => {
    const spawn = () => {
      const id = Date.now() + Math.random();
      const startX = Math.random() * 70 + 10;
      const startY = Math.random() * 30;
      setShots(p => [...p, { id, startX, startY }]);
      setTimeout(() => setShots(p => p.filter(s => s.id !== id)), 1500);
    };
    const interval = setInterval(spawn, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {shots.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.startX}%`,
          top: `${s.startY}%`,
          width: '150px', height: '2px',
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.8), rgba(139, 92, 246, 0.4), transparent)',
          transform: 'rotate(25deg)',
          animation: 'shootStarAdmin 1.3s ease-out forwards',
        }} />
      ))}
      <style>{`
        @keyframes shootStarAdmin {
          0%   { opacity: 1; transform: rotate(25deg) translateX(0); }
          100% { opacity: 0; transform: rotate(25deg) translateX(400px) translateY(180px); }
        }
      `}</style>
    </div>
  );
}

// ── Accretion Disk Graphic ──────────────────────────────────────────────
function AccretionDisk() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-30">
      {/* Outer spinning disk */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full border border-red-500/10 animate-[spin_80s_linear_infinite]" 
        style={{
          boxShadow: 'inset 0 0 100px rgba(239,68,68,0.04), 0 0 100px rgba(124,58,237,0.04)'
        }} 
      />
      {/* Inner spinning disk */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full border border-violet-500/10 animate-[spin_40s_linear_infinite_reverse]" 
        style={{
          boxShadow: 'inset 0 0 60px rgba(139,92,246,0.03), 0 0 60px rgba(239,68,68,0.03)'
        }} 
      />
      {/* Radar sweeping line */}
      <div className="absolute w-[1200px] h-[1200px] rounded-full border border-dashed border-red-500/5 animate-[spin_120s_linear_infinite]" />
    </div>
  );
}

// ── List of default M2 lessons ──────────────────────────────────────────
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

// ── Medical Specialties ─────────────────────────────────────────────────
const medicalSpecialties = [
  "Innere Medizin", "Infektion", "Pädiatrie", "Humangentik", "Dermatologie",
  "Anästhesis", "Intesiv- und Notfallmedizin", "Chirurgie", "Orthopädie",
  "Gynäkologie", "Urologie", "HNO", "Augenheilkunde", "Neurologie",
  "Psychiatrie", "Pharmakologie", "Arbeits- và Umweltmedizin", "Rechtsmedizin",
  "Pathologie", "Epidemiologie", "Sozialmedizin und Alternative Heilverfahren und Rehabilitation"
];

const getCardDiseaseName = (card) => {
  if (!card || !card.word) return '';
  const nameMatch = card.word.match(/^([^(]+)\s*\(Card\s*#\d+\)/i);
  return nameMatch
    ? nameMatch[1].trim()
    : card.word.split('\n')[0].split('(')[0].trim();
};

const getNextCardNumber = (lessonName, existingM2Cards) => {
  let maxNum = 0;
  existingM2Cards.forEach(c => {
    const disease = getCardDiseaseName(c);
    if (disease.toLowerCase().trim() === lessonName.toLowerCase().trim()) {
      const match = c.word.match(/\(Card\s*#(\d+)\)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  return maxNum + 1;
};

const renderClozeText = (text, highlightColor = '#ef4444') => {
  if (!text) return '';
  const parts = text.split(/(\{\{c\d+::.*?\}\})/g);
  return parts.map((part, i) => {
    const match = part.match(/\{\{c\d+::(.*?)\}\}/);
    if (match) {
      return (
        <span 
          key={i} 
          style={{ 
            color: highlightColor, 
            textShadow: `0 0 8px ${highlightColor}44`,
            fontWeight: '700', 
            borderBottom: `1.5px dashed ${highlightColor}` 
          }}
        >
          {match[1]}
        </span>
      );
    }
    return part;
  });
};

export default function DuyetPanel({ onBack }) {
  // State: decks and cards
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);

  // Split-pane states
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [approvedCardIds, setApprovedCardIds] = useState(new Set());
  const [removingCardIds, setRemovingCardIds] = useState(new Set());
  const [cardToDelete, setCardToDelete] = useState(null);

  // Search inside queue sidebar
  const [queueSearchQuery, setQueueSearchQuery] = useState('');

  // Export properties
  const [m2Cards, setM2Cards] = useState([]);
  const [targetLesson, setTargetLesson] = useState('');
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonSpecialty, setNewLessonSpecialty] = useState('Innere Medizin');
  const [showNewLessonInput, setShowNewLessonInput] = useState(false);
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [launching, setLaunching] = useState(false);

  // Custom Dropdown State for Lesson Picker
  const [isLessonDropdownOpen, setIsLessonDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keyboard events for warning confirm dialog
  useEffect(() => {
    if (!cardToDelete) return;
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cardId = cardToDelete.id || cardToDelete._id;
        selectNextAvailableCard(cardId);
        handleSingleReject(cardToDelete);
        setCardToDelete(null);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCardToDelete(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cardToDelete, deckCards]);

  // Click outside listener for custom dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLessonDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch queue cards automatically
  useEffect(() => {
    setLoadingDecks(true);
    setLoadingCards(true);
    setRemovingCardIds(new Set());
    setApprovedCardIds(new Set());
    setExportResult(null);

    fetch(`${API}/decks`)
      .then(r => r.json())
      .then(async (d) => {
        const deckList = d.decks || [];
        setDecks(deckList);

        try {
          const allCardsPromises = deckList.map(deck =>
            fetch(`${API}/lightning-cards/${deck.id || deck._id}`)
              .then(r => r.json())
              .then(data => (data.cards || []).map(card => ({
                ...card,
                deckName: deck.name
              })))
          );
          const results = await Promise.all(allCardsPromises);
          const mergedCards = results.flat();
          setDeckCards(mergedCards);
          
          if (mergedCards.length > 0) {
            setSelectedCardId(mergedCards[0].id || mergedCards[0]._id);
          } else {
            setSelectedCardId(null);
          }
        } catch (e) {
          console.error("Lỗi khi tải cards:", e);
          setDeckCards([]);
          setSelectedCardId(null);
        } finally {
          setLoadingDecks(false);
          setLoadingCards(false);
        }
      })
      .catch(() => {
        setLoadingDecks(false);
        setLoadingCards(false);
      });
  }, []);

  // Load existing M2 cards to compute lessons
  useEffect(() => {
    fetch(`${API}/cards`)
      .then(r => r.json())
      .then(all => {
        const m2 = (Array.isArray(all) ? all : []).filter(c => c.category !== 'General');
        setM2Cards(m2);
      })
      .catch(() => {});
  }, []);

  // Compute final M2 lesson list
  const m2LessonsList = useMemo(() => {
    const customLessons = new Set();
    try {
      const storedCustom = JSON.parse(localStorage.getItem('custom_lessons_m2') || '[]');
      if (Array.isArray(storedCustom)) {
        storedCustom.forEach(l => {
          if (l) customLessons.add(l.trim());
        });
      }
    } catch (e) {}

    m2Cards.forEach(c => {
      const diseaseName = getCardDiseaseName(c);
      if (diseaseName && !meditricksM2Order.includes(diseaseName)) {
        customLessons.add(diseaseName);
      }
    });
    return [...meditricksM2Order, ...Array.from(customLessons)].sort();
  }, [m2Cards]);

  // Set default target lesson
  useEffect(() => {
    if (m2LessonsList.length > 0 && !targetLesson) {
      const defaultLesson = m2LessonsList.find(l => l === "Ischämischer Schlaganfall") || m2LessonsList[0];
      setTargetLesson(defaultLesson);
    }
  }, [m2LessonsList, targetLesson]);

  // Edit card locally
  const handleCardChange = (cardId, field, value) => {
    setDeckCards(prev => prev.map(c => {
      if ((c.id || c._id) === cardId) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  // Auto-save on blur
  const saveCardToBackend = async (card) => {
    const id = card.id || card._id;
    if (!id) return;
    try {
      await fetch(`${API}/lightning-cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front: card.front,
          back: card.back
        })
      });
    } catch (e) {
      console.error('Lỗi khi lưu chỉnh sửa card:', e);
    }
  };

  const selectNextAvailableCard = (deletedId, currentCards = deckCards) => {
    const remaining = currentCards.filter(c => (c.id || c._id) !== deletedId);
    if (remaining.length > 0) {
      const deletedIdx = currentCards.findIndex(c => (c.id || c._id) === deletedId);
      const nextIdx = deletedIdx >= remaining.length ? remaining.length - 1 : deletedIdx;
      setSelectedCardId(remaining[nextIdx].id || remaining[nextIdx]._id);
    } else {
      setSelectedCardId(null);
    }
  };

  const selectNextCardFromList = (remainingList) => {
    if (remainingList.length > 0) {
      setSelectedCardId(remainingList[0].id || remainingList[0]._id);
    } else {
      setSelectedCardId(null);
    }
  };

  const handleSingleReject = async (card) => {
    const cardId = card.id || card._id;
    if (!cardId) return;

    setRemovingCardIds(prev => new Set([...prev, cardId]));

    try {
      await fetch(`${API}/lightning-cards/${cardId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error("Lỗi khi loại bỏ card:", e);
    }

    setTimeout(() => {
      setDeckCards(prev => prev.filter(c => (c.id || c._id) !== cardId));
      setRemovingCardIds(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
      setApprovedCardIds(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
      showToast("Đã tiêu hủy thẻ thành công!", "error");
    }, 300);
  };

  const handleRejectConfirm = (card) => {
    setCardToDelete(card);
  };

  const handleConfirmDelete = () => {
    if (!cardToDelete) return;
    const cardId = cardToDelete.id || cardToDelete._id;
    selectNextAvailableCard(cardId);
    handleSingleReject(cardToDelete);
    setCardToDelete(null);
  };

  const toggleApproveCard = (cardId) => {
    setApprovedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
        showToast("Đã hủy duyệt thẻ!", "info");
      } else {
        next.add(cardId);
        showToast("Đã duyệt thẻ! Thẻ chuyển sang màu xanh lá.", "success");
      }
      return next;
    });
  };

  // Export approved cards to M2 Library
  const handleExportApproved = async () => {
    const finalLesson = showNewLessonInput ? newLessonName.trim() : targetLesson;
    if (!finalLesson) { showToast('Vui lòng chọn hoặc nhập tên bài học!', 'error'); return; }

    const approvedCards = deckCards.filter(c => approvedCardIds.has(c.id || c._id));
    if (approvedCards.length === 0) { showToast('Không có thẻ nào được duyệt để xuất!', 'error'); return; }

    setExporting(true);
    setLaunching(true);
    let succeeded = 0;
    let failed = 0;

    let manualSpecialties = {};
    try {
      manualSpecialties = JSON.parse(localStorage.getItem('manual_specialties') || '{}');
    } catch (e) {}

    let finalCategory = manualSpecialties[finalLesson];
    if (showNewLessonInput) {
      finalCategory = newLessonSpecialty;
      const updated = { ...manualSpecialties, [finalLesson]: newLessonSpecialty };
      localStorage.setItem('manual_specialties', JSON.stringify(updated));
      
      // Update local custom lessons in localStorage
      try {
        const storedCustom = JSON.parse(localStorage.getItem('custom_lessons_m2') || '[]');
        if (!storedCustom.includes(finalLesson)) {
          storedCustom.push(finalLesson);
          localStorage.setItem('custom_lessons_m2', JSON.stringify(storedCustom));
        }
      } catch (e) {}
    } else if (!finalCategory) {
      const existingCard = m2Cards.find(c => getCardDiseaseName(c).toLowerCase().trim() === finalLesson.toLowerCase().trim());
      if (existingCard) {
        finalCategory = existingCard.category;
      }
    }
    if (!finalCategory) {
      finalCategory = 'Innere Medizin';
    }

    let currentNextNum = getNextCardNumber(finalLesson, m2Cards);
    const approvedIds = approvedCards.map(c => c.id || c._id);
    setRemovingCardIds(prev => new Set([...prev, ...approvedIds]));

    for (const card of approvedCards) {
      const cardId = card.id || card._id;
      try {
        const formattedWord = `${finalLesson} (Card #${currentNextNum})\n${card.front}`;
        const body = {
          word: formattedWord,
          translation: card.back,
          example: '',
          category: finalCategory,
          module: 2,
        };
        const r = await fetch(`${API}/ecosystem/import-card`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (r.ok) {
          await fetch(`${API}/lightning-cards/${cardId}`, {
            method: 'DELETE'
          });
          succeeded++;
          currentNextNum++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    try {
      const r = await fetch(`${API}/cards`);
      const all = await r.json();
      const m2 = (Array.isArray(all) ? all : []).filter(c => c.category !== 'General');
      setM2Cards(m2);
    } catch (e) {}

    const wasSelectedExported = approvedCardIds.has(selectedCardId);

    setTimeout(() => {
      const remaining = deckCards.filter(c => {
        const cid = c.id || c._id;
        return !approvedIds.includes(cid);
      });
      setDeckCards(remaining);

      if (wasSelectedExported) {
        selectNextCardFromList(remaining);
      }

      setApprovedCardIds(prev => {
        const next = new Set(prev);
        approvedIds.forEach(id => next.delete(id));
        return next;
      });

      setRemovingCardIds(prev => {
        const next = new Set(prev);
        approvedIds.forEach(id => next.delete(id));
        return next;
      });

      setLaunching(false);
      setExporting(false);
      setExportResult({ succeeded, failed, category: finalLesson });
      showToast(`🚀 Đã dịch chuyển thành công ${succeeded} thẻ sang bài ${finalLesson}!`, 'success');
    }, 300);
  };

  // Filter queue cards by search query
  const filteredQueueCards = useMemo(() => {
    return deckCards.filter(c => {
      if (!queueSearchQuery.trim()) return true;
      const q = queueSearchQuery.toLowerCase();
      return (
        (c.front || '').toLowerCase().includes(q) ||
        (c.back || '').toLowerCase().includes(q) ||
        (c.deckName || '').toLowerCase().includes(q)
      );
    });
  }, [deckCards, queueSearchQuery]);

  const activeCard = deckCards.find(c => (c.id || c._id) === selectedCardId) || filteredQueueCards[0] || deckCards[0];

  // Filter target lessons in dropdown
  const filteredLessons = useMemo(() => {
    return m2LessonsList.filter(l => l.toLowerCase().includes(lessonSearchQuery.toLowerCase()));
  }, [m2LessonsList, lessonSearchQuery]);

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-[#050109] text-white" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Background atmosphere elements */}
      <Starfield />
      <ShootingStars />
      <AccretionDisk />

      {/* Global CSS animations */}
      <style>{`
        @keyframes cardFadeOutShrink {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 500px;
            margin-bottom: 1.5rem;
            padding: 1.5rem;
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
            max-height: 0;
            margin-bottom: 0;
            padding: 0;
            border-width: 0;
            overflow: hidden;
          }
        }
        .card-fade-out {
          animation: cardFadeOutShrink 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
          pointer-events: none;
        }
        @keyframes cardSlideInUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .card-item-anim {
          animation: cardSlideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .review-card-item {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .review-card-item:hover {
          transform: translateY(-2px);
          border-color: rgba(239, 68, 68, 0.35) !important;
          box-shadow: 0 12px 40px rgba(239, 68, 68, 0.15) !important;
          background: rgba(20, 10, 25, 0.65) !important;
        }
        .left-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .left-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .left-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }
        .left-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.4);
        }
        .btn-erasing {
          position: relative;
          overflow: hidden;
        }
        .btn-erasing::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          animation: laserScan 2.5s infinite;
        }
        @keyframes laserScan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .glow-red-radial {
          box-shadow: 0 0 35px rgba(239, 68, 68, 0.12);
        }
      `}</style>

      {/* ── HEADER (Admin Command Interface) ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 bg-black/60 border-b border-red-500/20 backdrop-blur-xl">
        {/* Title and Clearance status */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-950/20 border border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-500 tracking-widest px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30">LEVEL 5 ACCESS</span>
              <span className="text-xs font-mono text-white/40 tracking-wider">SECURE TRANSMISSION NODE</span>
            </div>
            <h1 className="text-lg font-black tracking-widest text-white mt-0.5">
              LÕI PHÁN QUYẾT SINGULARITY
            </h1>
          </div>
        </div>

        {/* Dynamic Diagnostics */}
        <div className="hidden lg:flex items-center gap-8 px-6 py-2 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="text-white/45">VŨ TRỤ:</span>
            <span className="text-red-400 font-bold">M2 CLINICAL</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-white/45">HÀNG ĐỢI:</span>
            <span className="text-yellow-400 font-bold">{deckCards.length} THẺ</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-white/45">ĐÃ DUYỆT:</span>
            <span className="text-emerald-400 font-bold">{approvedCardIds.size} THẺ</span>
          </div>
        </div>

        {/* Back control */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/20 border border-red-500/30 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300 transform active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>QUAY LẠI VŨ TRỤ</span>
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="relative z-5 flex-1 flex overflow-hidden">
        
        {/* ── LEFT SIDEBAR: The Threat Queue ── */}
        <aside className="w-[320px] flex-shrink-0 bg-black/40 border-r border-white/5 flex flex-col backdrop-blur-xl">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-white/5 bg-black/20">
            <div className="text-[10px] font-mono font-bold text-red-400/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              DANH SÁCH CHỜ THẨM ĐỊNH
            </div>
            
            {/* Search Input inside Queue */}
            <div className="relative mt-3">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                placeholder="Tìm trong hàng đợi..." 
                value={queueSearchQuery}
                onChange={e => setQueueSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/[0.02] border border-white/5 outline-none focus:border-red-500/30 text-white placeholder-white/30 transition-all"
              />
              {queueSearchQuery && (
                <button 
                  onClick={() => setQueueSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Queue Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 left-sidebar-scroll">
            {loadingCards ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/30 text-xs font-mono gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>ĐANG TRUY XUẤT HÀNG ĐỢI...</span>
              </div>
            ) : filteredQueueCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-white/20">
                <span className="text-3xl mb-2">🛸</span>
                <span className="text-xs font-mono">HÀNG ĐỢI TRỐNG</span>
              </div>
            ) : (
              filteredQueueCards.map((card, index) => {
                const cardId = card.id || card._id;
                const isSelected = selectedCardId === cardId;
                const isApproved = approvedCardIds.has(cardId);

                return (
                  <button
                    key={cardId}
                    onClick={() => setSelectedCardId(cardId)}
                    className={`flex flex-col gap-2 p-4 rounded-xl w-full text-left transition-all duration-300 ${
                      isSelected 
                        ? 'bg-red-950/20 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                        : isApproved 
                          ? 'bg-emerald-950/10 border border-emerald-500/30' 
                          : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full border-b border-white/5 pb-1 text-[10px] font-mono">
                      <span className={isSelected ? 'text-red-400 font-bold' : isApproved ? 'text-emerald-400 font-bold' : 'text-white/40'}>
                        THẺ #{index + 1}
                      </span>
                      {isApproved ? (
                        <span className="text-emerald-400 font-bold tracking-wider">✓ ĐÃ DUYỆT</span>
                      ) : (
                        <span className="text-white/20 uppercase text-[9px]">{card.deckName || 'CLINICAL'}</span>
                      )}
                    </div>

                    {/* Front preview */}
                    <div className="p-2 rounded bg-black/40 border-l border-white/15 w-full text-[11px] text-white/80 line-clamp-2 word-break">
                      {renderClozeText(card.front, isSelected ? '#f87171' : '#ef4444')}
                    </div>

                    {/* Back preview */}
                    <div className="p-2 rounded bg-black/20 border-l border-white/5 w-full text-[10px] text-white/55 line-clamp-2 word-break">
                      {card.back || ''}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── CENTER WORKSPACE: Quantum Dissection Console ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#07020d]/30">
          {loadingCards ? (
            <EmptyState icon={<RefreshCw className="w-10 h-10 animate-spin text-red-500" />} title="Đang đồng bộ hóa cấu trúc hạt..." sub="Truy xuất cơ sở dữ liệu từ Extension..." />
          ) : deckCards.length === 0 ? (
            <EmptyState 
              icon={<img src={singularityCore} alt="Singularity" className="w-40 h-40 object-contain mx-auto animate-[spin_100s_linear_infinite] drop-shadow-[0_0_35px_rgba(239,68,68,0.25)] rounded-full" />}
              title="TOÀN BỘ MA TRẬN ĐÃ CÂN BẰNG" 
              sub="Không còn thẻ nào cần phê duyệt trong vùng lõi lượng tử." 
            />
          ) : !activeCard ? (
            <EmptyState icon={<Info className="w-8 h-8 text-red-400 animate-bounce" />} title="VUI LÒNG CHỌN VẬT THỂ PHÂN TÍCH" sub="Nhấp chọn một thẻ ở danh sách chờ bên trái để kích hoạt buồng chứa." />
          ) : (
            <div className="flex-1 p-10 flex flex-col justify-center items-center overflow-y-auto">
              <div className="w-full max-w-3xl flex flex-col gap-6">
                
                {/* Console Metadata Title */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs text-white/40">
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>CONSOLE PHÂN TÍCH LƯỢNG TỬ // THỂ PHÂN CỰC</span>
                  </span>
                  <span>TỰ ĐỘNG LƯU CHẶN</span>
                </div>

                {(() => {
                  const card = activeCard;
                  const cardId = card.id || card._id;
                  const isRemoving = removingCardIds.has(cardId);
                  const isApproved = approvedCardIds.has(cardId);

                  return (
                    <div
                      key={cardId}
                      className={`review-card-item card-item-anim ${isRemoving ? 'card-fade-out' : ''} cyber-panel-glass p-8 rounded-2xl border flex flex-col gap-6 relative overflow-hidden`}
                      style={{
                        borderColor: isApproved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.25)',
                        background: isApproved ? 'rgba(16, 185, 129, 0.03)' : 'rgba(6, 6, 12, 0.65)',
                        boxShadow: isApproved ? '0 15px 40px rgba(16, 185, 129, 0.15)' : '0 15px 40px rgba(239, 68, 68, 0.08)'
                      }}
                    >
                      {/* Warning grid accent */}
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-600 via-violet-500 to-emerald-500" />
                      
                      {/* Card meta inside card */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3 font-mono">
                        <span className={`text-xs font-bold flex items-center gap-2 ${isApproved ? 'text-emerald-400' : 'text-red-400'}`}>
                          <span>THẺ #{deckCards.findIndex(c => (c.id || c._id) === cardId) + 1}</span>
                          {isApproved && <span className="bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">APPROVED</span>}
                        </span>
                        <span className="text-[10px] text-white/30 uppercase">TYPE: {card.type || 'basic'}</span>
                      </div>

                      {/* Textareas */}
                      <div className="flex flex-col gap-5">
                        {/* Front (Word) */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">
                            VẬT CHẤT MẶT TRƯỚC (CLOZE DELETION // FRONT)
                          </label>
                          <textarea
                            value={card.front || ''}
                            onChange={(e) => handleCardChange(cardId, 'front', e.target.value)}
                            onBlur={() => saveCardToBackend(card)}
                            placeholder="Nhập nội dung mặt trước..."
                            className="w-full bg-black/40 border border-white/5 focus:border-violet-500/40 rounded-xl p-4 font-mono text-sm leading-relaxed text-white outline-none resize-y min-h-[110px] transition-all"
                            style={{
                              borderStyle: 'dashed'
                            }}
                          />
                        </div>

                        {/* Back (Translation) */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">
                            THÔNG TIN MẶT SAU (DIỄN GIẢI // TRANSLATION)
                          </label>
                          <textarea
                            value={card.back || ''}
                            onChange={(e) => handleCardChange(cardId, 'back', e.target.value)}
                            onBlur={() => saveCardToBackend(card)}
                            placeholder="Nhập nội dung mặt sau..."
                            className="w-full bg-black/30 border border-white/5 focus:border-violet-500/40 rounded-xl p-4 font-mono text-sm leading-relaxed text-white/80 outline-none resize-y min-h-[110px] transition-all"
                            style={{
                              borderStyle: 'dashed'
                            }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-4 mt-2 border-t border-white/5 pt-5">
                        <button
                          onClick={() => handleRejectConfirm(card)}
                          disabled={isRemoving}
                          className="btn-erasing flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/20 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 transform active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ĐÀO THẢI // TIÊU HỦY</span>
                        </button>

                        <button
                          onClick={() => toggleApproveCard(cardId)}
                          disabled={isRemoving}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer ${
                            isApproved 
                              ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]' 
                              : 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isApproved ? '✓ ĐÃ PHÊ DUYỆT' : 'PHÊ DUYỆT TRUYỀN TẢI'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR: Export & Transmission Gateway ── */}
        <aside className="w-[320px] flex-shrink-0 bg-black/40 border-l border-white/5 flex flex-col backdrop-blur-xl">
          {/* Header */}
          <div className="p-5 border-b border-white/5 bg-black/20">
            <div className="text-[10px] font-mono font-bold text-emerald-400/80 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              CỔNG TRUYỀN TẢI TRI THỨC
            </div>
            <div className="text-[10px] font-mono text-white/30">
              DỊCH CHUYỂN THẺ SANG THƯ VIỆN M2
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 left-sidebar-scroll">
            
            {/* Target Chapter Selection */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider">
                BÀI HỌC ĐÍCH (M2 CHAPTER)
              </label>

              {!showNewLessonInput ? (
                <div className="flex flex-col gap-2" ref={dropdownRef}>
                  {/* Search input for target lesson */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm bài học..."
                      value={lessonSearchQuery}
                      onChange={e => {
                        setLessonSearchQuery(e.target.value);
                        setIsLessonDropdownOpen(true);
                      }}
                      onFocus={() => setIsLessonDropdownOpen(true)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/[0.02] border border-white/5 outline-none focus:border-red-500/30 text-white placeholder-white/30 transition-all"
                    />
                  </div>

                  {/* Custom Dropdown Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setIsLessonDropdownOpen(prev => !prev)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-left text-white/80 hover:bg-white/[0.05] transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{targetLesson || "Chọn bài học..."}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                    </button>

                    {isLessonDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 rounded-xl border border-white/10 bg-[#0d0914] shadow-2xl left-sidebar-scroll">
                        {filteredLessons.length === 0 ? (
                          <div className="p-3 text-xs text-white/30 font-mono text-center">Không tìm thấy bài học</div>
                        ) : (
                          filteredLessons.map(lesson => (
                            <button
                              key={lesson}
                              onClick={() => {
                                setTargetLesson(lesson);
                                setIsLessonDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 hover:text-red-400 transition-all font-mono truncate border-b border-white/[0.02] ${
                                targetLesson === lesson ? 'text-red-400 bg-red-950/20 font-bold' : 'text-white/70'
                              }`}
                            >
                              {lesson}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setShowNewLessonInput(true); setLessonSearchQuery(''); }}
                    className="flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-red-500/30 hover:border-red-500/50 rounded-xl text-[10px] font-mono text-red-400 bg-red-950/5 hover:bg-red-950/25 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    TẠO BÀI HỌC MỚI
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-red-500/10 bg-red-950/5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-red-400 uppercase">Tên bài học lớn</span>
                    <input
                      type="text"
                      value={newLessonName}
                      onChange={e => setNewLessonName(e.target.value)}
                      placeholder="Nhập tên bài học..."
                      className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/5 outline-none focus:border-red-500/30 text-white placeholder-white/20 transition-all"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-red-400 uppercase">Chuyên khoa định danh</span>
                    <select
                      value={newLessonSpecialty}
                      onChange={e => setNewLessonSpecialty(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg bg-black/40 border border-white/5 outline-none text-white cursor-pointer"
                    >
                      {medicalSpecialties.map(spec => (
                        <option key={spec} value={spec} style={{ background: '#0a0b20' }}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => { setShowNewLessonInput(false); setNewLessonName(''); }}
                    className="w-full py-1.5 text-[9px] font-mono text-white/40 hover:text-white uppercase tracking-wider transition-all mt-1 cursor-pointer"
                  >
                    ← Dùng bài học sẵn có
                  </button>
                </div>
              )}
            </div>

            {/* Queue Summary Box */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-2 font-mono text-[11px] leading-relaxed text-white/60">
              <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                THÔNG SỐ BUỒNG DỊCH CHUYỂN
              </div>
              <div>• THẺ TRONG BUỒNG: <span className="text-white font-bold">{deckCards.length}</span></div>
              <div>• THẺ ĐÃ DUYỆT: <span className="text-emerald-400 font-bold">{approvedCardIds.size}</span></div>
              <div>• ĐIỂM ĐẾN: <span className="text-red-400 font-bold truncate block max-w-full">{showNewLessonInput ? (newLessonName || '—') : (targetLesson || '—')}</span></div>
              {showNewLessonInput && (
                <div>• CHUYÊN KHOA: <span className="text-red-400 font-bold truncate block max-w-full">{newLessonSpecialty}</span></div>
              )}
            </div>

            {/* Export action diagnostics */}
            {exportResult && (
              <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-950/5 font-mono text-[11px] leading-relaxed">
                <div className="font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-500/10 pb-1">
                  BÁO CÁO DỊCH CHUYỂN
                </div>
                <div className="text-white/60 mt-1.5">
                  ✓ Thành công: <span className="text-emerald-400 font-bold">{exportResult.succeeded} thẻ</span><br />
                  {exportResult.failed > 0 && <>✗ Lỗi tải: <span className="text-red-400 font-bold">{exportResult.failed} thẻ</span><br /></>}
                  Điểm đến: {exportResult.category}
                </div>
              </div>
            )}

          </div>

          {/* Sticky Ignition Deploy button */}
          <div className="p-5 border-t border-white/5 bg-black/40 backdrop-blur-xl">
            <button
              onClick={handleExportApproved}
              disabled={exporting || approvedCardIds.size === 0}
              className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                approvedCardIds.size === 0
                  ? 'bg-white/[0.02] border border-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-black shadow-[0_4px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_40px_rgba(16,185,129,0.5)]'
              }`}
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ĐANG DỊCH CHUYỂN THỂ TRI THỨC...</span>
                </>
              ) : (
                <>
                  <span>🚀 KÍCH HOẠT DỊCH CHUYỂN ({approvedCardIds.size} THẺ)</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Dynamic Action Toast */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-xs font-bold font-mono tracking-wider z-50 shadow-2xl flex items-center gap-2 animate-[fadeIn_0.2s_ease-out] ${
          toast.type === 'success' 
            ? 'bg-emerald-500 text-black shadow-emerald-500/20' 
            : toast.type === 'error' 
              ? 'bg-red-500 text-white shadow-red-500/20' 
              : 'bg-zinc-900 border border-white/10 text-white'
        }`}>
          <AlertOctagon className="w-4 h-4" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── HIGH SECURITY CONFIRM MODAL ── */}
      {cardToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] animate-[fadeIn_0.15s_ease-out]">
          <div 
            className="w-full max-w-md p-8 rounded-2xl border border-red-500/40 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0e0508 0%, #050209 100%)',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.25)'
            }}
          >
            {/* Critical warning stripes */}
            <div 
              className="absolute top-0 left-0 w-full h-2.5" 
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 8px, #000 8px, #000 16px)'
              }}
            />

            {/* Warning icon */}
            <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto mb-4 mt-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertOctagon className="w-7 h-7 text-red-500 animate-bounce" />
            </div>

            {/* Title */}
            <h3 className="text-center font-mono font-black text-sm text-red-500 tracking-widest uppercase mb-2">
              LỆNH LOẠI BỎ THẺ // TIÊU HỦY VĨNH VIỄN
            </h3>

            {/* Warning text */}
            <p className="text-xs text-white/60 font-mono leading-relaxed text-center mb-6 border-y border-white/5 py-4 my-4">
              CẢNH BÁO CẤP CAO: HÀNH ĐỘNG NÀY SẼ TIÊU HỦY THẺ FLASHCARD RA KHỎI LÕI LƯỢNG TỬ VÀ KHÔNG THỂ HỒI ĐÁP PHỤC HỒI.
            </p>

            {/* Controls */}
            <div className="flex gap-4 font-mono">
              <button
                onClick={() => setCardToDelete(null)}
                className="flex-1 py-3 text-xs font-bold rounded-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all cursor-pointer text-center"
              >
                HỦY BỎ LỆNH
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 text-xs font-black rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer text-center"
              >
                XÁC NHẬN TIÊU HỦY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Secondary sub-components ───────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-6">{icon}</div>
      <h3 className="text-sm font-mono font-bold tracking-widest text-white/60 uppercase">{title}</h3>
      {sub && <p className="text-xs font-mono text-white/30 max-w-md mt-2">{sub}</p>}
    </div>
  );
}
