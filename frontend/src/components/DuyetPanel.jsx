import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

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

    // Generate stars
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.7 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.twinkle += 0.02;
        const op = s.opacity * (0.7 + 0.3 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${op})`;
        ctx.fill();
        // Slow drift downward (parallax)
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
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.6,
    }} />
  );
}

// ── Shooting stars ──────────────────────────────────────────────────────
function ShootingStars() {
  const [shots, setShots] = useState([]);
  useEffect(() => {
    const spawn = () => {
      const id = Date.now() + Math.random();
      const startX = Math.random() * 80 + 10;
      const startY = Math.random() * 40;
      setShots(p => [...p, { id, startX, startY }]);
      setTimeout(() => setShots(p => p.filter(s => s.id !== id)), 1200);
    };
    const interval = setInterval(spawn, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {shots.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.startX}%`,
          top: `${s.startY}%`,
          width: '120px', height: '1.5px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.9), transparent)',
          transform: 'rotate(30deg)',
          animation: 'shootStar 1.1s ease-out forwards',
        }} />
      ))}
      <style>{`
        @keyframes shootStar {
          0%   { opacity: 1; transform: rotate(30deg) translateX(0); }
          100% { opacity: 0; transform: rotate(30deg) translateX(300px) translateY(150px); }
        }
      `}</style>
    </div>
  );
}

// ── Planet decoration ───────────────────────────────────────────────────
function SpacePlanets() {
  return (
    <>
      {/* Large distant planet top-right */}
      <div style={{
        position: 'fixed', top: '-60px', right: '-60px',
        width: '220px', height: '220px', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #3b4fa8, #0d0d2b)',
        boxShadow: '0 0 60px rgba(99,102,241,0.2), inset 0 0 40px rgba(0,0,0,0.5)',
        opacity: 0.35, zIndex: 0, pointerEvents: 'none',
      }} />
      {/* Rings */}
      <div style={{
        position: 'fixed', top: '20px', right: '-120px',
        width: '460px', height: '80px', borderRadius: '50%',
        border: '10px solid rgba(99,102,241,0.12)',
        transform: 'rotateX(70deg)',
        opacity: 0.3, zIndex: 0, pointerEvents: 'none',
      }} />
      {/* Small moon bottom-left */}
      <div style={{
        position: 'fixed', bottom: '80px', left: '20px',
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, #4a5568, #1a1a2e)',
        boxShadow: 'inset -8px -4px 0 rgba(0,0,0,0.4)',
        opacity: 0.25, zIndex: 0, pointerEvents: 'none',
      }} />
    </>
  );
}

// ── Rocket animation in header ──────────────────────────────────────────
function RocketIcon({ launching }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '2rem',
      transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: launching ? 'translateY(-60px) scale(0.5)' : 'translateY(0) scale(1)',
      filter: launching ? 'blur(2px)' : 'none',
    }}>🚀</span>
  );
}

// ── Main DuyetPanel ─────────────────────────────────────────────────────
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

const medicalSpecialties = [
  "Innere Medizin", "Infektion", "Pädiatrie", "Humangentik", "Dermatologie",
  "Anästhesis", "Intesiv- und Notfallmedizin", "Chirurgie", "Orthopädie",
  "Gynäkologie", "Urologie", "HNO", "Augenheilkunde", "Neurologie",
  "Psychiatrie", "Pharmakologie", "Arbeits- und Umweiltmedizin", "Rechtsmedizin",
  "Pathologie", "Epidemiologie", "Sozialmedizin und Alternative Heilverfharen und Rehabilitation"
];

const getCardDiseaseName = (card) => {
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

const renderClozeText = (text, highlightColor = '#818cf8') => {
  if (!text) return '';
  const parts = text.split(/(\{\{c\d+::.*?\}\})/g);
  return parts.map((part, i) => {
    const match = part.match(/\{\{c\d+::(.*?)\}\}/);
    if (match) {
      return (
        <span key={i} style={{ color: highlightColor, fontWeight: '700', borderBottom: `1px dashed ${highlightColor}` }}>
          {match[1]}
        </span>
      );
    }
    return part;
  });
};

// ── Main DuyetPanel ─────────────────────────────────────────────────────
export default function DuyetPanel({ onBack }) {
  // State: decks (Lightning), cards per deck
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);

  // Split-pane active card & approval states
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [approvedCardIds, setApprovedCardIds] = useState(new Set());

  // Review state
  const [removingCardIds, setRemovingCardIds] = useState(new Set());
  const [cardToDelete, setCardToDelete] = useState(null);

  // Global keydown event listener when confirm modal is open
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

  // Export to Module 2
  const [m2Cards, setM2Cards] = useState([]); // all existing M2 cards to extract lesson list
  const [targetLesson, setTargetLesson] = useState('');
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonSpecialty, setNewLessonSpecialty] = useState('Innere Medizin');
  const [showNewLessonInput, setShowNewLessonInput] = useState(false);
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [launching, setLaunching] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load Lightning Decks and all cards automatically on load
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

  // Load M2 cards to extract lesson list
  useEffect(() => {
    fetch(`${API}/cards`)
      .then(r => r.json())
      .then(all => {
        const m2 = (Array.isArray(all) ? all : []).filter(c => c.category !== 'General');
        setM2Cards(m2);
      })
      .catch(() => {});
  }, []);

  // Extract custom & default lessons list
  const m2LessonsList = useMemo(() => {
    const customLessons = new Set();
    
    // Read from localStorage to sync empty lessons
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

  const handleCardChange = (cardId, field, value) => {
    setDeckCards(prev => prev.map(c => {
      if ((c.id || c._id) === cardId) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

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

  // Helper to select another card after rejection/export
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
      showToast("Đã loại bỏ thẻ!", "info");
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
        showToast("Đã duyệt thẻ! (Tô xanh)", "success");
      }
      return next;
    });
  };

  const handleExportApproved = async () => {
    const finalLesson = showNewLessonInput ? newLessonName.trim() : targetLesson;
    if (!finalLesson) { showToast('Chọn hoặc nhập tên bài lớn đích!', 'error'); return; }

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
        const formattedWord = `${finalLesson} (Card #${currentNextNum})`;
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
      showToast(`🚀 Đã xuất ${succeeded} card sang bài ${finalLesson}!`, 'success');
    }, 300);
  };

  const activeCard = deckCards.find(c => (c.id || c._id) === selectedCardId) || deckCards[0];

  return (
    <div style={{ height: '100vh', background: '#060814', color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Starfield />
      <ShootingStars />
      <SpacePlanets />

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
            transform: translateY(24px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .card-item-anim {
          animation: cardSlideInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .review-card-item {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .review-card-item:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.35) !important;
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.18) !important;
          background: rgba(25, 25, 60, 0.55) !important;
        }
        .btn-reject {
          transition: all 0.2s ease-in-out !important;
        }
        .btn-reject:hover {
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.45) !important;
          transform: scale(1.03);
          background: rgba(239, 68, 68, 0.25) !important;
        }
        .btn-approve {
          transition: all 0.2s ease-in-out !important;
        }
        .btn-approve:hover {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.45) !important;
          transform: scale(1.03);
          background: rgba(16, 185, 129, 0.28) !important;
        }
        @keyframes confirmZoomIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .btn-cancel-modal {
          transition: all 0.2s ease-in-out;
        }
        .btn-cancel-modal:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .btn-confirm-modal {
          transition: all 0.2s ease-in-out;
        }
        .btn-confirm-modal:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45) !important;
          background: linear-gradient(135deg, #f87171 0%, #dc2626 100%) !important;
        }
        .left-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .left-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .left-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }
        .left-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.45);
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'rgba(10,8,30,0.7)',
        borderBottom: '1px solid rgba(239,68,68,0.25)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <RocketIcon launching={launching} />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '2px', color: '#fca5a5', textTransform: 'uppercase' }}>
              DUYỆT CARDS
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(252,165,165,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Admin Control Center · Local Only
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Chip color="#94a3b8" label={`📋 ${deckCards.length} thẻ`} />
          <Chip color="#34d399" label={`✓ ${approvedCardIds.size} đã duyệt`} />
          <button onClick={onBack} style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5', padding: '0.5rem 1.2rem', borderRadius: '10px',
            fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px',
          }}>
            ← Quay lại
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>

        {/* ── LEFT: Flat Card List ── */}
        <aside style={{
          width: '300px', flexShrink: 0,
          background: 'rgba(6,8,20,0.8)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(252,165,165,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.3rem' }}>
              🎴 Danh sách thẻ cần duyệt
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
              {deckCards.length} thẻ trong hàng đợi
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem' }} className="left-sidebar-scroll">
            {loadingCards ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', textAlign: 'center', marginTop: '2rem' }}>Đang tải...</p>
            ) : deckCards.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '3rem', color: 'rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '2.5rem' }}>🛸</div>
                <p style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>Hàng đợi trống</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {deckCards.map((card, index) => {
                  const cardId = card.id || card._id;
                  const isSelected = selectedCardId === cardId;
                  const isApproved = approvedCardIds.has(cardId);

                  return (
                    <button
                      key={cardId}
                      onClick={() => setSelectedCardId(cardId)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: isSelected 
                          ? 'rgba(99,102,241,0.22)' 
                          : isApproved 
                            ? 'rgba(16,185,129,0.12)' 
                            : 'rgba(255,255,255,0.03)',
                        border: isSelected
                          ? '1px solid rgba(99,102,241,0.6)'
                          : isApproved
                            ? '1px solid rgba(16,185,129,0.5)'
                            : '1px solid rgba(255,255,255,0.06)',
                        color: 'white',
                        boxShadow: isSelected 
                          ? '0 4px 15px rgba(99,102,241,0.2)' 
                          : isApproved
                            ? '0 4px 12px rgba(16,185,129,0.15)'
                            : 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Card ID & Approve status */}
                      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: isSelected ? '#a5b4fc' : isApproved ? '#34d399' : 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Thẻ #{index + 1}
                        </span>
                        {isApproved ? (
                          <span style={{ color: '#34d399', fontSize: '0.65rem', fontWeight: 'bold' }}>✓ DUYỆT</span>
                        ) : (
                          card.type && (
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>{card.type}</span>
                          )
                        )}
                      </div>

                      {/* FRONT SECTION */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        borderLeft: isSelected ? '2px solid #818cf8' : '2px solid rgba(255, 255, 255, 0.15)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}>
                        <div style={{ fontSize: '0.55rem', fontWeight: '800', color: isSelected ? '#a5b4fc' : 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.15rem' }}>
                          Mặt trước
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.95)',
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                        }}>
                          {renderClozeText(card.front, isSelected ? '#a5b4fc' : '#818cf8')}
                        </div>
                      </div>

                      {/* BACK SECTION */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.15)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        borderLeft: isSelected ? '2px solid #a78bfa' : '2px solid rgba(255, 255, 255, 0.15)',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}>
                        <div style={{ fontSize: '0.55rem', fontWeight: '800', color: isSelected ? '#c084fc' : 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.15rem' }}>
                          Mặt sau
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'rgba(255, 255, 255, 0.75)',
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                        }}>
                          {card.back || ''}
                        </div>
                      </div>

                      {/* DECK INFO FOOTER */}
                      {card.deckName && (
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.22)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', marginTop: '0.1rem' }}>
                          📂 {card.deckName}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── CENTER: Single Active Card View ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {loadingCards ? (
            <EmptyState icon="⏳" title="Đang tải cards..." sub="" />
          ) : deckCards.length === 0 ? (
            <EmptyState icon="🛸" title="Hàng đợi chưa có card nào" sub="Các cards từ extension sẽ hiển thị ở đây" />
          ) : !activeCard ? (
            <EmptyState icon="🎴" title="Chọn một thẻ ở danh sách bên trái để xem" sub="" />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem 3rem', gap: '1.5rem', overflowY: 'auto', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                  <span>Chi tiết thẻ đang chọn</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>Tự động lưu khi sửa</span>
                </div>

                {(() => {
                  const card = activeCard;
                  const cardId = card.id || card._id;
                  const isRemoving = removingCardIds.has(cardId);
                  const isApproved = approvedCardIds.has(cardId);

                  return (
                    <div
                      key={cardId}
                      className={`review-card-item card-item-anim ${isRemoving ? 'card-fade-out' : ''}`}
                      style={{
                        borderRadius: '16px',
                        border: isApproved 
                          ? '1.5px solid rgba(16, 185, 129, 0.5)' 
                          : '1px solid rgba(255,255,255,0.08)',
                        background: isApproved 
                          ? 'rgba(16, 185, 129, 0.06)' 
                          : 'rgba(20,20,50,0.4)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: isApproved 
                          ? '0 12px 40px rgba(16, 185, 129, 0.2)' 
                          : '0 8px 32px rgba(0,0,0,0.3)',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.2rem',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Card Header Info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: isApproved ? '#34d399' : 'rgba(252,165,165,0.8)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          Thẻ #{deckCards.findIndex(c => (c.id || c._id) === cardId) + 1}
                          {isApproved && <span style={{ background: '#10b981', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>ĐÃ DUYỆT</span>}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
                          Loại: {card.type || 'basic'}
                        </span>
                      </div>

                      {/* Card Content Textareas (Vertical structure) */}
                      <div style={{ display: 'flex', gap: '1.2rem', width: '100%', flexDirection: 'column' }}>
                        {/* Front text area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Mặt trước (Từ khóa)
                          </label>
                          <textarea
                            value={card.front || ''}
                            onChange={(e) => handleCardChange(cardId, 'front', e.target.value)}
                            onBlur={() => saveCardToBackend(card)}
                            placeholder="Mặt trước (Từ khóa)..."
                            style={{
                              width: '100%',
                              background: 'rgba(255,255,255,0.02)',
                              border: isApproved ? '1px dashed rgba(16, 185, 129, 0.3)' : '1px dashed rgba(255,255,255,0.1)',
                              borderRadius: '10px',
                              padding: '0.9rem',
                              resize: 'vertical',
                              color: 'white',
                              fontSize: '0.98rem',
                              fontWeight: '700',
                              lineHeight: '1.6',
                              fontFamily: 'inherit',
                              outline: 'none',
                              minHeight: '110px',
                              boxSizing: 'border-box',
                              transition: 'all 0.2s',
                            }}
                          />
                        </div>

                        {/* Back text area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Mặt sau (Đáp án)
                          </label>
                          <textarea
                            value={card.back || ''}
                            onChange={(e) => handleCardChange(cardId, 'back', e.target.value)}
                            onBlur={() => saveCardToBackend(card)}
                            placeholder="Mặt sau (Đáp án)..."
                            style={{
                              width: '100%',
                              background: 'rgba(255,255,255,0.02)',
                              border: isApproved ? '1px dashed rgba(16, 185, 129, 0.3)' : '1px dashed rgba(255,255,255,0.1)',
                              borderRadius: '10px',
                              padding: '0.9rem',
                              resize: 'vertical',
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontSize: '0.95rem',
                              fontWeight: '400',
                              lineHeight: '1.6',
                              fontFamily: 'inherit',
                              outline: 'none',
                              minHeight: '110px',
                              boxSizing: 'border-box',
                              transition: 'all 0.2s',
                            }}
                          />
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectConfirm(card)}
                          disabled={isRemoving}
                          style={{
                            background: 'rgba(239,68,68,0.12)',
                            color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.25)',
                            padding: '0.6rem 1.4rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            fontFamily: 'inherit',
                          }}
                        >
                          ✗ Loại bỏ
                        </button>
                        <button
                          className="btn-approve"
                          onClick={() => toggleApproveCard(cardId)}
                          disabled={isRemoving}
                          style={{
                            background: isApproved ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.15)',
                            color: isApproved ? '#a7f3d0' : '#34d399',
                            border: isApproved ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(16,185,129,0.3)',
                            padding: '0.6rem 1.6rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          {isApproved ? '✓ Đã duyệt' : '✓ Duyệt'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT: Export panel ── */}
        <aside style={{
          width: '300px', flexShrink: 0,
          background: 'rgba(6,8,20,0.8)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', gap: '0',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ padding: '1.2rem 1.2rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(165,180,252,0.6)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.3rem' }}>
              🎯 Xuất sang Bibliothek M2
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
              Tổng cộng {deckCards.length} thẻ còn lại
            </div>
          </div>

          {/* Middle scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="left-sidebar-scroll">

            {/* Target lesson */}
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>
                Bài lớn đích (M2 Chapter)
              </div>

              {!showNewLessonInput ? (
                <>
                  <input
                    type="text"
                    placeholder="🔍 Tìm nhanh bài lớn..."
                    value={lessonSearchQuery}
                    onChange={e => {
                      const val = e.target.value;
                      setLessonSearchQuery(val);
                      const filtered = m2LessonsList.filter(l => l.toLowerCase().includes(val.toLowerCase()));
                      if (filtered.length > 0) {
                        setTargetLesson(filtered[0]);
                      }
                    }}
                    style={{
                      width: '100%', padding: '0.55rem 0.8rem', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: '0.8rem', outline: 'none', marginBottom: '0.5rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <select
                    value={targetLesson}
                    onChange={e => setTargetLesson(e.target.value)}
                    style={{
                      width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: '0.82rem', outline: 'none', cursor: 'pointer',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {m2LessonsList.length === 0 && <option value="">Đang tải bài lớn...</option>}
                    {m2LessonsList
                      .filter(lesson => lesson.toLowerCase().includes(lessonSearchQuery.toLowerCase()))
                      .map(lesson => (
                        <option key={lesson} value={lesson} style={{ background: '#0a0b20' }}>{lesson}</option>
                      ))}
                    {m2LessonsList.length > 0 && m2LessonsList.filter(lesson => lesson.toLowerCase().includes(lessonSearchQuery.toLowerCase())).length === 0 && (
                      <option value="">Không tìm thấy bài học nào</option>
                    )}
                  </select>
                  <button
                    onClick={() => { setShowNewLessonInput(true); setLessonSearchQuery(''); }}
                    style={{ ...btnStyle('rgba(99,102,241,0.1)', '#a5b4fc'), fontSize: '0.75rem', padding: '0.4rem 0.8rem', border: '1px dashed rgba(99,102,241,0.35)', width: '100%' }}
                  >
                    + Tạo bài lớn mới
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={newLessonName}
                    onChange={e => setNewLessonName(e.target.value)}
                    placeholder="Tên bài lớn mới..."
                    autoFocus
                    style={{
                      width: '100%', padding: '0.65rem 0.8rem', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.4)',
                      color: 'white', fontSize: '0.82rem', outline: 'none', marginBottom: '0.5rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  
                  {/* Select Specialty for new lesson */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Chuyên khoa của bài học mới
                    </div>
                    <select
                      value={newLessonSpecialty}
                      onChange={e => setNewLessonSpecialty(e.target.value)}
                      style={{
                        width: '100%', padding: '0.5rem 0.7rem', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', fontSize: '0.8rem', outline: 'none', cursor: 'pointer',
                      }}
                    >
                      {medicalSpecialties.map(spec => (
                        <option key={spec} value={spec} style={{ background: '#0a0b20' }}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => { setShowNewLessonInput(false); setNewLessonName(''); }}
                    style={{ ...btnStyle('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.4)'), fontSize: '0.72rem', padding: '0.35rem 0.8rem', width: '100%' }}
                  >
                    ← Dùng bài lớn có sẵn
                  </button>
                </>
              )}
            </div>

            {/* Summary */}
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '0.9rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(165,180,252,0.7)', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tóm tắt hàng đợi
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
                <div>📋 Còn lại: <strong style={{ color: '#a5b4fc' }}>{deckCards.length}</strong> thẻ cần duyệt</div>
                <div>🎯 Bài đích: <strong style={{ color: '#a5b4fc' }}>{showNewLessonInput ? (newLessonName || '—') : (targetLesson || '—')}</strong></div>
                {showNewLessonInput && (
                  <div>🩺 Chuyên khoa: <strong style={{ color: '#a5b4fc' }}>{newLessonSpecialty}</strong></div>
                )}
                <div>📚 Module: <strong style={{ color: '#a5b4fc' }}>2 (Y Khoa)</strong></div>
              </div>
            </div>

            {/* Export result */}
            {exportResult && (
              <div style={{
                background: exportResult.failed === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${exportResult.failed === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                borderRadius: '12px', padding: '0.9rem', fontSize: '0.82rem', lineHeight: '1.7',
              }}>
                <div style={{ fontWeight: '800', color: exportResult.failed === 0 ? '#34d399' : '#fbbf24', marginBottom: '0.3rem' }}>
                  {exportResult.failed === 0 ? '🎉 Xuất thành công!' : '⚠️ Xuất hoàn tất'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>
                  ✓ {exportResult.succeeded} card thành công<br />
                  {exportResult.failed > 0 && <>✗ {exportResult.failed} card lỗi<br /></>}
                  Đến: {exportResult.category}
                </div>
              </div>
            )}
          </div>

          {/* Launch button container - sticky at the bottom */}
          <div style={{ padding: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,8,20,0.95)' }}>
            <button
              onClick={handleExportApproved}
              disabled={exporting || approvedCardIds.size === 0}
              style={{
                width: '100%', padding: '1rem', borderRadius: '14px',
                background: approvedCardIds.size === 0
                  ? 'rgba(255,255,255,0.04)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', color: approvedCardIds.size === 0 ? 'rgba(255,255,255,0.2)' : 'white',
                fontSize: '0.95rem', fontWeight: '800', cursor: approvedCardIds.size === 0 ? 'not-allowed' : 'pointer',
                letterSpacing: '1px', textTransform: 'uppercase',
                boxShadow: approvedCardIds.size > 0 ? '0 4px 20px rgba(16,185,129,0.3)' : 'none',
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                fontFamily: 'inherit',
              }}
            >
              {exporting ? '🚀 Đang xuất...' : `🚀 Xuất (${approvedCardIds.size} Thẻ)`}
            </button>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(30,30,60,0.95)',
          color: 'white', padding: '0.8rem 1.8rem', borderRadius: '12px',
          fontSize: '0.88rem', fontWeight: '600', zIndex: 9999,
          boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.25s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Custom Confirmation Modal ── */}
      {cardToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.96) 0%, rgba(10, 10, 22, 0.98) 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.25), inset 0 0 15px rgba(239, 68, 68, 0.1)',
            borderRadius: '20px',
            padding: '2rem',
            width: '90%',
            maxWidth: '420px',
            boxSizing: 'border-box',
            textAlign: 'center',
            transform: 'scale(1)',
            animation: 'confirmZoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}>
            {/* Warning icon */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem auto',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)',
            }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: '800',
              color: 'white',
              marginBottom: '0.6rem',
              letterSpacing: '0.5px',
            }}>
              XÁC NHẬN LOẠI BỎ
            </h3>

            {/* Message */}
            <p style={{
              fontSize: '0.88rem',
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: '1.6',
              marginBottom: '1.8rem',
            }}>
              Bạn có chắc chắn muốn loại bỏ thẻ này không? Hành động này sẽ xóa thẻ vĩnh viễn khỏi hàng đợi duyệt.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setCardToDelete(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                className="btn-cancel-modal"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.35)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                className="btn-confirm-modal"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper sub-components ───────────────────────────────────────────────
function Chip({ color, label }) {
  return (
    <div style={{
      background: `${color}22`, border: `1px solid ${color}55`,
      color, padding: '0.25rem 0.7rem', borderRadius: '8px',
      fontSize: '0.75rem', fontWeight: '700',
    }}>{label}</div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: 'rgba(255,255,255,0.2)', padding: '3rem' }}>
      <span style={{ fontSize: '4rem' }}>{icon}</span>
      <p style={{ fontSize: '1rem', fontWeight: '600', textAlign: 'center' }}>{title}</p>
      {sub && <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'rgba(255,255,255,0.12)' }}>{sub}</p>}
    </div>
  );
}

function btnStyle(bg, color, mono = false) {
  return {
    background: bg, color,
    padding: '0.65rem 1rem', borderRadius: '10px',
    border: 'none', cursor: 'pointer',
    fontSize: mono ? '1rem' : '0.88rem',
    fontWeight: '700', transition: 'all 0.2s',
    fontFamily: mono ? 'monospace' : 'inherit',
  };
}
