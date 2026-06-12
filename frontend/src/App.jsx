import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, LogOut, ChevronDown, AlertCircle, Volume2, VolumeX, Zap, BookOpen, History, Globe, Trash2, Check, Search, Plus, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import FlashcardPlayer from './components/FlashcardPlayer';
import LightningDecksView from './components/LightningDecksView';
import DuyetPanel from './components/DuyetPanel';
import LoginScreen from './components/LoginScreen';
import WorldCard from './components/WorldCard';
import WorldDetails from './components/WorldDetails';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};
const API_BASE_URL = getApiBaseUrl();

// =====================================================================
// AnkiToast — notification popup khi thêm card vào Anki
// =====================================================================
function AnkiToast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'center', pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          pointerEvents: 'none',
          background: t.type === 'success' ? 'rgba(16,185,129,0.95)'
            : t.type === 'skip' ? 'rgba(245,158,11,0.95)'
            : t.type === 'dup' ? 'rgba(99,102,241,0.95)'
            : t.type === 'offline' ? 'rgba(239,68,68,0.95)'
            : 'rgba(30,30,50,0.95)',
          color: 'white',
          borderRadius: '12px',
          padding: '0.7rem 1.2rem',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-body, system-ui)',
          fontWeight: '600',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          maxWidth: '380px',
          textAlign: 'center',
          animation: 'ankiToastIn 0.25s ease-out',
          lineHeight: 1.4,
        }}>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes ankiToastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

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
const getCardDiseaseName = (card) => {
  const nameMatch = card.word.match(/^([^(]+)\s*\(Card\s*#\d+\)/i);
  return nameMatch
    ? nameMatch[1].trim()
    : card.word.split('\n')[0].split('(')[0].trim();
};

const groupCardsByClinicalTopic = (cards, customLessons = []) => {
  const map = new Map();
  
  // Initialize map with all 182 standard Meditricks M2 chapters/themes
  meditricksM2Order.forEach(themeName => {
    map.set(themeName, { diseaseName: themeName, cards: [] });
  });

  // Initialize map with any custom lessons saved by the user
  if (Array.isArray(customLessons)) {
    customLessons.forEach(themeName => {
      if (themeName && !map.has(themeName)) {
        map.set(themeName, { diseaseName: themeName, cards: [] });
      }
    });
  }

  cards.forEach(card => {
    // Extract disease name: everything BEFORE "(Card #N)" — greedy match
    const nameMatch = card.word.match(/^([^(]+)\s*\(Card\s*#\d+\)/i);
    const diseaseName = nameMatch
      ? nameMatch[1].trim()
      : card.word.split('\n')[0].split('(')[0].trim();
      
    // Find matching theme case-insensitively
    let matchedKey = null;
    for (const key of map.keys()) {
      if (key.toLowerCase().trim() === diseaseName.toLowerCase().trim()) {
        matchedKey = key;
        break;
      }
    }
    
    if (matchedKey) {
      map.get(matchedKey).cards.push(card);
    } else {
      // If it's a custom theme not in the 182 order list, add it
      map.set(diseaseName, { diseaseName, cards: [card] });
    }
  });

  const sorted = Array.from(map.values())
    .map(group => {
      const num = getMeditricksTopicNumber(group.diseaseName);
      return {
        ...group,
        num: num
      };
    })
    .sort((a, b) => {
      if (a.num !== b.num) return a.num - b.num;
      return a.diseaseName.localeCompare(b.diseaseName);
    });

  let customIndex = 0;
  return sorted.map(group => {
    let finalNum = group.num;
    let prefix = '';
    if (group.num !== 999) {
      prefix = `${group.num}. `;
    } else {
      finalNum = meditricksM2Order.length + 1 + customIndex;
      prefix = `${finalNum}. `;
      customIndex++;
    }
    return {
      ...group,
      num: finalNum,
      displayName: `${prefix}${group.diseaseName}`
    };
  });
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


// =====================================================================
// DuyetView — Review Queue: show in-progress (unlearned) cards
// with Public and Delete actions
// =====================================================================
function DuyetView({ cards, selectedModule, apiBaseUrl, showAnkiToast, setRocketState, setModalSessionCards, setModalStartIndex }) {
  const [publishedIds, setPublishedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('duyet_published_ids') || '[]'); } catch { return []; }
  });
  const [deletedIds, setDeletedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('duyet_deleted_ids') || '[]'); } catch { return []; }
  });
  const [publishingId, setPublishingId] = useState(null);
  const [searchQ, setSearchQ] = useState('');

  // Cards in review = unlearned, from selected module, not already processed
  const reviewCards = useMemo(() => {
    return (cards || []).filter(c => {
      const id = c._id || c.id;
      if (deletedIds.includes(id)) return false;
      if (publishedIds.includes(id)) return false;
      if (c.isLearned) return false;
      if (selectedModule && c.module && c.module !== selectedModule) return false;
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        return (c.word || '').toLowerCase().includes(q) || (c.translation || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [cards, deletedIds, publishedIds, searchQ, selectedModule]);

  const savePublished = (ids) => {
    setPublishedIds(ids);
    localStorage.setItem('duyet_published_ids', JSON.stringify(ids));
  };
  const saveDeleted = (ids) => {
    setDeletedIds(ids);
    localStorage.setItem('duyet_deleted_ids', JSON.stringify(ids));
  };

  const [cardToDelete, setCardToDelete] = useState(null);

  const handlePublic = async (card) => {
    const id = card._id || card.id;
    setPublishingId(id);
    try {
      if (setRocketState) {
        setRocketState('launching');
        setTimeout(() => setRocketState('idle'), 2500);
      }
      const res = await fetch(`${apiBaseUrl}/ecosystem/import-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: card.word,
          translation: card.translation,
          example: card.example || '',
          category: card.category || 'Innere Medizin',
          module: 2
        })
      });
      if (res.ok) {
        savePublished([...publishedIds, id]);
        showAnkiToast('🌐 Đã public vào Bibliothek Y Khoa M2!', 'success');
      } else {
        const err = await res.json();
        showAnkiToast(`❌ Public thất bại: ${err.error || 'Lỗi server'}`, 'error');
      }
    } catch (e) {
      showAnkiToast('❌ Không kết nối được server', 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = (card) => {
    setCardToDelete(card);
  };

  const confirmDelete = () => {
    if (!cardToDelete) return;
    const id = cardToDelete._id || cardToDelete.id;
    saveDeleted([...deletedIds, id]);
    showAnkiToast('🗑️ Đã xóa khỏi hàng đợi duyệt', 'success');
    setCardToDelete(null);
    if (setRocketState) {
      setRocketState('flickering');
      setTimeout(() => setRocketState('idle'), 2000);
    }
  };

  useEffect(() => {
    if (!cardToDelete) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCardToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardToDelete]);

  const categoryColor = (cat) => {
    const map = {
      'Innere Medizin': '#6366f1', 'Chirurgie': '#f59e0b', 'Neurologie': '#10b981',
      'Pädiatrie': '#ec4899', 'Pharmakologie': '#8b5cf6', 'Gynäkologie': '#f472b6',
      'Dermatologie': '#f97316', 'Psychiatrie': '#14b8a6', 'General': '#64748b',
    };
    if (!cat) return '#64748b';
    const key = Object.keys(map).find(k => cat.includes(k));
    return key ? map[key] : '#6366f1';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: 'var(--bg-secondary)', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--glass-border)', padding: '1.8rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
              📋 Hàng đợi Duyệt
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
              {reviewCards.length} thẻ đang trong quá trình ôn tập. Chọn <strong style={{ color: '#a78bfa' }}>🌐 Public</strong> để đưa vào Bibliothek Y Khoa M2, hoặc <strong style={{ color: '#f87171' }}>🗑️ Xóa</strong> để loại bỏ khỏi hàng đợi.
            </p>
          </div>
          {/* Stats badges */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: '700' }}>
              📋 {reviewCards.length} đang duyệt
            </span>
            <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7', borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: '700' }}>
              ✅ {publishedIds.length} đã public
            </span>
            <span style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '20px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: '700' }}>
              🗑️ {deletedIds.length} đã xóa
            </span>
          </div>
        </div>
        {/* Search bar */}
        <div style={{ marginTop: '1.2rem', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm thẻ đang duyệt..."
            className="form-input"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{ paddingLeft: '2.8rem', background: 'var(--bg-primary)', fontSize: '0.9rem', borderRadius: '10px', width: '100%', maxWidth: '480px' }}
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')} style={{ position: 'absolute', left: 'calc(100% - max(calc(100% - 480px), 0px) - 2.5rem)', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          )}
        </div>
      </div>

      {/* Card grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }} className="library-large-list">
        {reviewCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>✨</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'white', marginBottom: '0.5rem' }}>Hàng đợi trống!</h3>
            <p style={{ fontSize: '0.9rem' }}>Tất cả các thẻ đã được duyệt xong. Hãy bắt đầu một phiên ôn tập mới để thêm thẻ vào hàng đợi.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {reviewCards.map((card, idx) => {
              const id = card._id || card.id;
              const isPublishing = publishingId === id;
              const color = categoryColor(card.category);
              // Extract display text
              const titleLines = (card.word || '').split('\n').map(l => l.trim()).filter(Boolean);
              const title = titleLines[1] || titleLines[0] || card.word;
              const previewTitle = title.replace(/\{\{c\d+::([^}]*)\}\}/g, '[$1]').substring(0, 90);
              const descLines = (card.translation || '').split('\n').map(l => l.trim()).filter(Boolean);
              const desc = descLines[0] || '';
              const previewDesc = desc.substring(0, 120);

              return (
                <div
                  key={id}
                  style={{
                    background: 'var(--glass-bg)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: '14px',
                    padding: '1rem 1.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s',
                    opacity: isPublishing ? 0.6 : 1,
                    cursor: 'pointer'
                  }}
                  className="library-large-card-compact"
                  onClick={() => {
                    if (setModalSessionCards && setModalStartIndex) {
                      setModalSessionCards(reviewCards);
                      setModalStartIndex(idx);
                    }
                  }}
                >
                  {/* Index */}
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(165,180,252,0.45)', minWidth: '1.8rem', flexShrink: 0, textAlign: 'right' }}>#{idx + 1}</span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.2rem' }}>
                      {previewTitle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {previewDesc}
                    </div>
                  </div>

                  {/* Category badge */}
                  <span style={{
                    fontSize: '0.65rem', fontWeight: '700', color: color,
                    background: `${color}18`, border: `1px solid ${color}50`,
                    borderRadius: '20px', padding: '0.2rem 0.6rem',
                    whiteSpace: 'nowrap', flexShrink: 0
                  }}>
                    {card.category || 'General'}
                  </span>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      disabled={isPublishing}
                      onClick={(e) => { e.stopPropagation(); handlePublic(card); }}
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: isPublishing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
                      }}
                      title="Public vào Bibliothek Y Khoa M2"
                    >
                      {isPublishing ? '⏳ ...' : '🌐 Public'}
                    </button>
                    <button
                      disabled={isPublishing}
                      onClick={(e) => { e.stopPropagation(); handleDelete(card); }}
                      style={{
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.35)',
                        color: '#fca5a5',
                        borderRadius: '8px',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: isPublishing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap'
                      }}
                      title="Xóa khỏi hàng đợi duyệt"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cardToDelete && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 6, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setCardToDelete(null)}
        >
          <div 
            style={{
              width: '90%',
              maxWidth: '420px',
              background: 'var(--bg-secondary)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '20px',
              padding: '2.2rem 1.8rem',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(239, 68, 68, 0.15)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.8rem' }}>⚠️</span>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: '900', color: 'white', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>
              XÁC NHẬN XÓA THẺ
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.8rem' }}>
              Bạn có chắc chắn muốn xóa vĩnh viễn flashcard này khỏi hàng đợi duyệt? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setCardToDelete(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s'
                }}
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


export default function App() {
  const [selectedModule, setSelectedModule] = useState(null); // null = 2-square picker
  const [rocketState, setRocketState] = useState('idle');

  // Background music state (desktop login only)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const ytPlayerRef = useRef(null);
  const ytReadyRef = useRef(false);
  const musicContainerRef = useRef(null);

  // Các phân cảnh (chapter timestamps) của video iLO-UptQNYo
  // Mỗi lần đăng nhập random 1 phân cảnh khác nhau
  const YT_MUSIC_SCENES = [
    { start: 0,    label: 'Intro' },
    { start: 180,  label: 'Scene 2' },
    { start: 420,  label: 'Scene 3' },
    { start: 660,  label: 'Scene 4' },
    { start: 900,  label: 'Scene 5' },
    { start: 1140, label: 'Scene 6' },
    { start: 1380, label: 'Scene 7' },
    { start: 1620, label: 'Scene 8' },
    { start: 1860, label: 'Scene 9' },
    { start: 1951, label: 'Scene 10 (t=1951s)' },
    { start: 2100, label: 'Scene 11' },
    { start: 2340, label: 'Scene 12' },
    { start: 2580, label: 'Scene 13' },
    { start: 2820, label: 'Scene 14' },
    { start: 3060, label: 'Scene 15' },
    { start: 3300, label: 'Scene 16' },
    { start: 3540, label: 'Scene 17' },
    { start: 3780, label: 'Scene 18' },
  ];
  // Chọn ngẫu nhiên 1 phân cảnh mỗi session (lưu trong useRef để không đổi khi re-render)
  const ytSceneRef = useRef(null);
  if (ytSceneRef.current === null) {
    ytSceneRef.current = YT_MUSIC_SCENES[Math.floor(Math.random() * YT_MUSIC_SCENES.length)];
  }
  
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
  const [isSucking, setIsSucking] = useState(false);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [activeWorldIndex, setActiveWorldIndex] = useState(0);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

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
      const scene = ytSceneRef.current;
      ytPlayerRef.current = new window.YT.Player('yt-music-player', {
        height: '1',
        width: '1',
        videoId: 'iLO-UptQNYo',
        playerVars: {
          autoplay: 1,
          start: scene.start,
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
          },
          onStateChange: (event) => {
            // Khi video kết thúc: chọn phân cảnh tiếp theo (loop qua các scene)
            if (event.data === 0) {
              const scenes = YT_MUSIC_SCENES;
              const currentStart = ytSceneRef.current.start;
              const currentIdx = scenes.findIndex(s => s.start === currentStart);
              const nextIdx = (currentIdx + 1) % scenes.length;
              ytSceneRef.current = scenes[nextIdx];
              event.target.seekTo(scenes[nextIdx].start, true);
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

  const handleLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) {
      setLoginError('Vui lòng nhập tên tài khoản.');
      setLoginSuccessMsg('');
      return;
    }
    
    if (trimmedUsername !== 'admin' && trimmedUsername !== 'admin1' && trimmedUsername !== 'guest') {
      setLoginError('Tài khoản không tồn tại trên hệ thống.');
      setLoginSuccessMsg('');
      return;
    }
    
    if (passwordInput === '123' || trimmedUsername === 'guest') {
      setLoginSuccessMsg('Xác thực thành công! Đang kết nối nơ-ron...');
      setLoginError('');
      playGentleClickSound();
      setIsSucking(true);
    } else {
      setLoginError('Mật khẩu không chính xác.');
      setLoginSuccessMsg('');
    }
  };

  const handleQuickLogin = () => {
    setUsernameInput('guest');
    setPasswordInput('123');
    setLoginSuccessMsg('Xác thực nhanh thành công! Đang kết nối...');
    setLoginError('');
    playGentleClickSound();
    setIsSucking(true);
  };

  const onLoginSuccess = (username) => {
    localStorage.setItem('is_logged_in', 'true');
    localStorage.setItem('current_user', username);
    setCurrentUser(username);
    setIsLoggedIn(true);
    setIsSucking(false);
    setLoginSuccessMsg('');
    setHasLoggedOut(false);
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
    setHasLoggedOut(true);
    setPendingModule(null);
    setIsSucking(false);
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

  const worlds = useMemo(() => {
    const countDeutschLearned = allCards.filter(c => c.category === 'General' && c.isLearned).length;
    const countDeutschTotal = allCards.filter(c => c.category === 'General').length;
    const countMedicalLearned = allCards.filter(c => c.category !== 'General' && c.isLearned).length;
    const countMedicalTotal = allCards.filter(c => c.category !== 'General').length;

    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' || 
       window.location.hostname.startsWith('192.168.') || 
       window.location.hostname.startsWith('10.') || 
       window.location.hostname.startsWith('172.'));
    const showDuyet = currentUser === 'admin' && isLocalhost;

    const list = [
      {
        id: "medical-02",
        title: "Klinische Medizin M2",
        subtitle: "Học phần ca lâm sàng Meditricks M2 chuyên sâu theo từng chuyên khoa.",
        tag: "Học phần I",
        coords: "20 Chuyên khoa // Meditricks",
        coverImage: "https://images.unsplash.com/photo-1473951574080-01fe45ec8643?auto=format&fit=crop&w=1200&q=80",
        detailImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        bgHex: "#12081c",
        accentColor: "from-fuchsia-500 to-indigo-600",
        stats: [
          { label: "Tiến độ", value: `${countMedicalLearned} / ${countMedicalTotal}` },
          { label: "Số thẻ", value: `${countMedicalTotal}` },
          { label: "Chuyên khoa", value: "20+" }
        ],
        overview: "Học phần I cung cấp hệ thống thẻ học ca lâm sàng chuyên sâu theo định dạng Meditricks M2, bao gồm các chuyên khoa mũi nhọn như Nội khoa (Innere Medizin), Thần kinh (Neurologie), Ngoại khoa (Chirurgie), v.v. Tối ưu cho kỳ thi chuyển đổi y khoa Đức.",
        explorationSteps: [
          { title: "Nội khoa (Innere Medizin)", description: "Các bệnh lý tim mạch, hô hấp, tiêu hóa và phác đồ điều trị.", time: "Nội khoa" },
          { title: "Ngoại khoa & Cấp cứu", description: "Xử trí ngoại khoa, orthopädie và cấp cứu hồi sức tích cực.", time: "Ngoại khoa" },
          { title: "Thần kinh & Tâm thần", description: "Các ca tai biến thần kinh, động kinh, rối loạn tâm thần lâm sàng.", time: "Chuyên biệt" }
        ],
        moduleId: 2
      },
      {
        id: "deutsch-01",
        title: "Allgemeines Deutsch",
        subtitle: "Học phần ôn tập Tiếng Đức tổng quát và giao tiếp Y khoa cơ bản.",
        tag: "Học phần II",
        coords: "500 Từ vựng // Tổng quát",
        coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
        detailImage: "https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=800&q=80",
        bgHex: "#0c151c",
        accentColor: "from-cyan-400 to-sky-600",
        stats: [
          { label: "Tiến độ", value: `${countDeutschLearned} / ${countDeutschTotal}` },
          { label: "Số thẻ", value: `${countDeutschTotal}` },
          { label: "Cấp độ", value: "A2 - B2" }
        ],
        overview: "Học phần II tập trung xây dựng nền tảng từ vựng tiếng Đức tổng quát cùng với các quán ngữ, động từ ghép và danh từ chuyên khoa cơ bản. Giúp học viên sẵn sàng giao tiếp trong môi trường y tế Đức và vượt qua các kỳ thi ngôn ngữ chuẩn đầu ra.",
        explorationSteps: [
          { title: "Nền tảng DaF", description: "Từ vựng cơ bản thông dụng hàng ngày trong đời sống tại Đức.", time: "Cơ bản" },
          { title: "Ngữ cảnh Bệnh viện", description: "Các thuật ngữ miêu tả triệu chứng, giao tiếp cơ bản giữa đồng nghiệp.", time: "Giao tiếp" },
          { title: "Viết bệnh án cơ bản", description: "Luyện cách ghép từ, cấu trúc câu tiếng Đức chuẩn y khoa.", time: "Ứng dụng" }
        ],
        moduleId: 1
      }
    ];

    if (showDuyet) {
      list.push({
        id: "duyet-03",
        title: "Lõi Phán Quyết Singularity (Admin)",
        subtitle: "Quyền lực tối cao kiểm soát, phê duyệt và tái cấu trúc toàn bộ vũ trụ tri thức.",
        tag: "TỐI CAO",
        coords: "Vùng Huỷ Diệt // Admin Core",
        coverImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
        detailImage: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
        bgHex: "#27050d",
        accentColor: "from-red-650 to-rose-950",
        stats: [
          { label: "Thẩm quyền", value: "TỐI CAO" },
          { label: "Quyền hạn", value: "TOÀN NĂNG" },
          { label: "Trạng thái", value: "HỦY DIỆT" }
        ],
        overview: "Cơ quan phán quyết dữ liệu tối cao, nắm giữ quyền sinh sát đối với mọi thẻ học. Mọi hành động phê duyệt hoặc đào thải tại đây đều trực tiếp định hình nên hệ thống tri thức của bạn. Hãy cân nhắc trước sức mạnh của lõi lượng tử.",
        explorationSteps: [
          { title: "Phê duyệt tối cao", description: "Quyết định đưa thẻ học vào vũ trụ tri thức chính thức.", time: "Phán quyết" },
          { title: "Tái cấu trúc tế bào", description: "Biến đổi nội dung, căn chỉnh dịch nghĩa các ca lâm sàng.", time: "Cải tạo" },
          { title: "Hủy diệt vĩnh viễn", description: "Đào thải các thẻ kém chất lượng khỏi hàng đợi.", time: "Đào thải" }
        ],
        moduleId: 'duyet'
      });
    }

    return list;
  }, [allCards, currentUser]);

  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    const container = scrollContainerRef.current;
    const containerTop = container.getBoundingClientRect().top;
    const children = container.children;
    if (!children || children.length === 0) return;

    let minDiff = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childTop = child.getBoundingClientRect().top;
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

  const scrollToItem = (idx) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const children = container.children;
    if (children && children[idx]) {
      const targetElement = children[idx];
      const targetTop = targetElement.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;
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
      }, 750);
    }
  };

  const getActiveBg = () => {
    if (!isLoggedIn) return "#070709";
    if (worlds[activeWorldIndex]) {
      return worlds[activeWorldIndex].bgHex;
    }
    return "#0c0a09";
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        activeEl.isContentEditable
      )) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIdx = (activeWorldIndex + 1) % worlds.length;
        scrollToItem(nextIdx);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIdx = (activeWorldIndex - 1 + worlds.length) % worlds.length;
        scrollToItem(prevIdx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoggedIn, activeWorldIndex, worlds]);

  // Wörten/Schlusswörten settings state
  const [studyCount, setStudyCount] = useState(10);
  const [studyStateFilter, setStudyStateFilter] = useState('unlearned'); // 'all', 'learned', 'unlearned'
  const [studyWordClassFilter, setStudyWordClassFilter] = useState('all'); // 'all', 'noun', 'verb', 'adjective', 'adverb', 'preposition'
  const [studyWordClasses, setStudyWordClasses] = useState([]);
  const [studySpecialties, setStudySpecialties] = useState([]);
  const [studyLessons, setStudyLessons] = useState([]);
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');
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
  const [expandedThemes, setExpandedThemes] = useState({});
  const [manualSpecialties, setManualSpecialties] = useState(() => {
    try { return JSON.parse(localStorage.getItem('manual_specialties') || '{}'); } catch { return {}; }
  });
  const [customLessons, setCustomLessons] = useState(() => {
    try { return JSON.parse(localStorage.getItem('custom_lessons_m2') || '[]'); } catch { return []; }
  });
  const [newLessonInputVal, setNewLessonInputVal] = useState('');
  const [newLessonSpecialty, setNewLessonSpecialty] = useState('Innere Medizin');
  const [isAdminReviewMode, setIsAdminReviewMode] = useState(false);

  // Count cards per clinical lesson/disease
  const lessonCardCounts = useMemo(() => {
    const counts = {};
    allCards.forEach(card => {
      if (card.category === 'General') return;
      const diseaseName = getCardDiseaseName(card);
      counts[diseaseName] = (counts[diseaseName] || 0) + 1;
    });
    return counts;
  }, [allCards]);

  // Compute clinical lessons/diseases matching selected specialties
  const availableLessons = useMemo(() => {
    if (selectedModule !== 2) return [];
    
    // Get all unique diseases from cards, meditricksM2Order, and customLessons
    const allDiseases = Array.from(new Set([
      ...meditricksM2Order,
      ...(customLessons || []),
      ...allCards.filter(c => c.category !== 'General').map(c => getCardDiseaseName(c))
    ]));

    // Map disease -> category
    const diseaseSpecialtyMap = {};
    allDiseases.forEach(d => {
      // Find a card for this disease to get its category
      const card = allCards.find(c => c.category !== 'General' && getCardDiseaseName(c) === d);
      diseaseSpecialtyMap[d] = manualSpecialties[d] || (card ? card.category : 'Innere Medizin');
    });
    
    // Filter by selected specialties if any
    const filteredDiseases = studySpecialties.length > 0
      ? allDiseases.filter(d => studySpecialties.includes(diseaseSpecialtyMap[d]))
      : allDiseases;

    // Sort according to meditricksM2Order or alphabetically
    return filteredDiseases.sort((a, b) => {
      const idxA = meditricksM2Order.indexOf(a);
      const idxB = meditricksM2Order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [allCards, selectedModule, studySpecialties, manualSpecialties, customLessons]);
  
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

  const renderLibPagination = (currentPage, totalPages, onPageChange, labelText) => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      
      pages.push(totalPages);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '1.2rem 0', marginTop: '1.2rem', borderTop: '1px solid var(--glass-border)', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Arrow Left */}
          <button 
            disabled={currentPage === 1} 
            onClick={() => { onPageChange(currentPage - 1); libraryListRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className="btn-nav" 
            style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.8rem', padding: 0 }}
          >
            ←
          </button>
          
          {/* Page Buttons */}
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ell-${idx}`} style={{ color: 'var(--text-muted)', padding: '0 0.25rem', userSelect: 'none', fontSize: '0.85rem' }}>
                  ...
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => { onPageChange(p); libraryListRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid var(--accent-active-color)' : '1px solid var(--glass-border)',
                  background: isActive ? 'var(--accent-active-color)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {p}
              </button>
            );
          })}
          
          {/* Arrow Right */}
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { onPageChange(currentPage + 1); libraryListRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className="btn-nav" 
            style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.8rem', padding: 0 }}
          >
            →
          </button>

          {/* Quick select dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đến trang:</span>
            <select
              value={currentPage}
              onChange={(e) => { onPageChange(Number(e.target.value)); libraryListRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                padding: '0.2rem 0.4rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>{page}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Info Label */}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          {labelText}
        </span>
      </div>
    );
  };

  // ── Anki Integration State ──────────────────────────────────────────
  const [ankiStatus, setAnkiStatus] = useState(null); // null | true | false
  const [ankiSentCards, setAnkiSentCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('anki_sent_cards') || '{}'); } catch { return {}; }
  });
  const [ankiToasts, setAnkiToasts] = useState([]);
  const [ankiLoadingCards, setAnkiLoadingCards] = useState(new Set());

  // ── MedDE Ecosystem Hub States ──────────────────────────────────────
  const [meddeHistory, setMeddeHistory] = useState([]);
  const [loadingMedde, setLoadingMedde] = useState(false);
  const [selectedLookupId, setSelectedLookupId] = useState(null);
  const [importingItem, setImportingItem] = useState(null); // lookup item being promoted
  const [importCategory, setImportCategory] = useState("Innere Medizin");
  const [importModule, setImportModule] = useState(2);
  const [importExample, setImportExample] = useState("");

  const fetchMeddeHistory = async () => {
    try {
      setLoadingMedde(true);
      const res = await fetch(`${API_BASE_URL}/ecosystem/history`);
      if (res.ok) {
        const data = await res.json();
        setMeddeHistory(data);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử MedDE:", err);
    } finally {
      setLoadingMedde(false);
    }
  };

  useEffect(() => {
    if (rightPanelMode === 'medde_hub') {
      fetchMeddeHistory();
    }
  }, [rightPanelMode]);

  // Auto-select first MedDE history item when list loads (proper useEffect, NOT setState-in-render)
  useEffect(() => {
    if (meddeHistory.length > 0 && !selectedLookupId) {
      const firstId = meddeHistory[0]._id || meddeHistory[0].id;
      setSelectedLookupId(firstId);
    }
  }, [meddeHistory]);

  const handleDeleteMeddeItem = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Bạn muốn xóa mục này khỏi lịch sử tra cứu?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ecosystem/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMeddeHistory(prev => prev.filter(item => (item._id || item.id) !== id));
        showAnkiToast("🗑️ Đã xóa lịch sử tra cứu!", "success");
      }
    } catch (err) {
      showAnkiToast("❌ Lỗi khi xóa mục lịch sử", "error");
    }
  };

  const handlePromoteToCard = async () => {
    if (!importingItem) return;
    try {
      let formattedTranslation = '';
      if (importingItem.type === 'quick') {
        const t = importingItem.translation;
        formattedTranslation = `[Bản dịch] ${t.viet || ''}\n[Từ loại/Ghi chú] ${t.note || ''}\n[Tiếng Anh] ${t.en || ''}\n[Latin] ${t.latin || ''}\n[Triệu chứng] ${t.symptom || ''}`;
      } else {
        const t = importingItem.translation;
        formattedTranslation = `[Định nghĩa] ${t.dinh_nghia || ''}\n[Triệu chứng] ${t.trieu_chung || ''}\n[Chẩn đoán] ${t.chan_doan || ''}\n[Điều trị] ${t.dieu_tri || ''}\n[IMPP Key] ${t.impp_note || ''}`;
      }

      const res = await fetch(`${API_BASE_URL}/ecosystem/import-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: `${importingItem.german}${importingItem.word !== importingItem.german ? ` (${importingItem.word})` : ''}`,
          translation: formattedTranslation,
          example: importExample || `Tra cứu tự động qua MedDE: "${importingItem.context}"`,
          category: importCategory,
          module: importModule
        })
      });
      if (res.ok) {
        showAnkiToast("➕ Đã lưu thành card Toibingu!", "success");
        setImportingItem(null);
        setImportExample("");
        fetchCards(); // refresh library lists
      } else {
        showAnkiToast("❌ Lỗi khi import card", "error");
      }
    } catch (err) {
      showAnkiToast("❌ Kết nối thất bại", "error");
    }
  };

  const sendLookupToAnki = async (item, forceAdd = false) => {
    const id = item._id || item.id;
    setAnkiLoadingCards(prev => new Set([...prev, id]));
    try {
      let word = item.german;
      let translation = '';
      let category = 'Tra cứu MedDE';
      
      if (item.type === 'quick') {
        const t = item.translation;
        translation = `[Nghĩa] ${t.viet || ''}\n[Chi tiết] ${t.note || ''}\n[Triệu chứng] ${t.symptom || ''}`;
      } else {
        const t = item.translation;
        translation = `[Định nghĩa] ${t.dinh_nghia || ''}\n[Triệu chứng] ${t.trieu_chung || ''}\n[Chẩn đoán] ${t.chan_doan || ''}\n[Điều trị] ${t.dieu_tri || ''}\n[IMPP Key] ${t.impp_note || ''}`;
      }

      const res = await fetch(`${API_BASE_URL}/anki/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: `Từ vựng: ${word}${item.context ? ` (Ngữ cảnh: ${item.context.substring(0, 100)})` : ''}`,
          translation,
          category,
          forceAdd
        })
      });
      const data = await res.json();
      
      if (res.status === 503 || data.ankiOffline) {
        showAnkiToast('⚠️ Anki chưa mở. Vui lòng mở Anki Desktop rồi thử lại.', 'offline', 5000);
        setAnkiStatus(false);
        return;
      }
      if (data.added) {
        const updated = { ...ankiSentCards, [id]: { score: data.score, deck: data.deck, ts: Date.now() } };
        setAnkiSentCards(updated);
        localStorage.setItem('anki_sent_cards', JSON.stringify(updated));
        showAnkiToast(`✅ Đã thêm vào Anki! ⭐ IMPP ${data.score}/5 — ${data.reason}`, 'success');
      } else if (data.duplicate) {
        showAnkiToast(`🔵 Card này đã có trong Anki rồi.`, 'dup');
      } else if (data.skipped) {
        showAnkiToast(
          `⚡ Điểm IMPP: ${data.score}/5 — ${data.reason}. Nhấp chuột phải/nhấn giữ để thêm thẳng.`,
          'skip', 5000
        );
      } else if (data.error) {
        showAnkiToast(`❌ Lỗi: ${data.error}`, 'error');
      }
    } catch (err) {
      showAnkiToast('❌ Không kết nối được backend.', 'error');
    } finally {
      setAnkiLoadingCards(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  // Kiểm tra AnkiConnect khi vào tab Bibliothek hoặc MedDE Hub
  useEffect(() => {
    if ((rightPanelMode === 'bibliothek' || rightPanelMode === 'medde_hub') && ankiStatus === null) {
      fetch(`${API_BASE_URL}/anki/status`)
        .then(r => r.json())
        .then(d => setAnkiStatus(d.connected))
        .catch(() => setAnkiStatus(false));
    }
  }, [rightPanelMode, ankiStatus]);

  const showAnkiToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setAnkiToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setAnkiToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const handleAddNewLesson = () => {
    const name = newLessonInputVal.trim();
    if (!name) {
      showAnkiToast('Vui lòng nhập tên bài lớn mới!', 'error');
      return;
    }
    
    const isStandard = meditricksM2Order.some(l => l.toLowerCase().trim() === name.toLowerCase());
    const isCustom = customLessons.some(l => l.toLowerCase().trim() === name.toLowerCase());
    
    if (isStandard || isCustom) {
      showAnkiToast(`Bài lớn "${name}" đã tồn tại!`, 'error');
      return;
    }
    
    const updatedCustom = [...customLessons, name];
    localStorage.setItem('custom_lessons_m2', JSON.stringify(updatedCustom));
    setCustomLessons(updatedCustom);
    
    const updatedSpecialties = { ...manualSpecialties, [name]: newLessonSpecialty };
    setManualSpecialties(updatedSpecialties);
    localStorage.setItem('manual_specialties', JSON.stringify(updatedSpecialties));
    
    setNewLessonInputVal('');
    showAnkiToast(`🚀 Đã thêm thành công bài lớn "${name}"!`, 'success');
  };

  const handleDeleteCustomLesson = async (lessonName, groupCards) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài lớn "${lessonName}" và tất cả ${groupCards.length} thẻ thuộc bài học này? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    
    setLoading(true);
    try {
      // 1. Delete all cards belonging to this lesson from the server/db
      if (groupCards && groupCards.length > 0) {
        for (const card of groupCards) {
          const cardId = card._id || card.id;
          await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            method: 'DELETE'
          });
        }
      }
      
      // 2. Remove from customLessons state & localStorage
      const updatedCustom = customLessons.filter(l => l !== lessonName);
      setCustomLessons(updatedCustom);
      localStorage.setItem('custom_lessons_m2', JSON.stringify(updatedCustom));
      
      // 3. Remove specialty mapping
      const updatedSpecs = { ...manualSpecialties };
      delete updatedSpecs[lessonName];
      setManualSpecialties(updatedSpecs);
      localStorage.setItem('manual_specialties', JSON.stringify(updatedSpecs));
      
      showAnkiToast(`🗑️ Đã xóa bài lớn "${lessonName}" thành công!`, 'success');
      
      // 4. Refresh cards
      await fetchCards();
    } catch (e) {
      console.error('Lỗi khi xóa bài lớn:', e);
      showAnkiToast('❌ Có lỗi xảy ra khi xóa bài lớn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendToAnki = useCallback(async (card, forceAdd = false) => {
    const cardId = card._id || card.id;
    setAnkiLoadingCards(prev => new Set([...prev, cardId]));
    try {
      const res = await fetch(`${API_BASE_URL}/anki/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: card.word,
          translation: card.translation,
          category: card.category,
          forceAdd
        })
      });
      const data = await res.json();

      if (res.status === 503 || data.ankiOffline) {
        showAnkiToast('⚠️ Anki chưa mở. Vui lòng mở Anki Desktop rồi thử lại.', 'offline', 5000);
        setAnkiStatus(false);
        return;
      }
      if (data.added) {
        const updated = { ...ankiSentCards, [cardId]: { score: data.score, deck: data.deck, ts: Date.now() } };
        setAnkiSentCards(updated);
        localStorage.setItem('anki_sent_cards', JSON.stringify(updated));
        showAnkiToast(`✅ Đã thêm vào Anki! ⭐ IMPP ${data.score}/5 — ${data.reason}`, 'success');
      } else if (data.duplicate) {
        showAnkiToast(`🔵 Card này đã có trong Anki rồi.`, 'dup');
      } else if (data.skipped) {
        showAnkiToast(
          `⚡ Điểm IMPP: ${data.score}/5 — ${data.reason}. Nhấn giữ để thêm thủ công.`,
          'skip', 5000
        );
      } else if (data.error) {
        showAnkiToast(`❌ Lỗi: ${data.error}`, 'error');
      }
    } catch (err) {
      showAnkiToast('❌ Không kết nối được backend. Backend đang chạy chưa?', 'error');
    } finally {
      setAnkiLoadingCards(prev => { const s = new Set(prev); s.delete(cardId); return s; });
    }
  }, [ankiSentCards, showAnkiToast]);
  
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
  }, [isLoggedIn, currentUser, selectedModule]);

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
    setStudyLessons([]);
    setLessonSearchQuery('');
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
      if ((selectedModule === 1 || selectedModule === 2) && rightPanelMode === 'worten' && !activeSessionCards && !modalSessionCards && !showCongrats) {
        if (e.code === 'Enter') {
          e.preventDefault();
          startNewSession();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, rightPanelMode, activeSessionCards, modalSessionCards, showCongrats]);

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
      pool = allCards.filter(card => card.category !== 'General' && card.isPublished === false);
      if (studySpecialties.length > 0) {
        pool = pool.filter(card => {
          const diseaseName = getCardDiseaseName(card);
          const chosenCategory = manualSpecialties[diseaseName] || card.category;
          return studySpecialties.includes(chosenCategory);
        });
      }
      if (studyLessons.length > 0) {
        pool = pool.filter(card => {
          const diseaseName = getCardDiseaseName(card);
          return studyLessons.includes(diseaseName);
        });
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
        list = list.filter(card => {
          const diseaseName = getCardDiseaseName(card);
          const chosenCategory = manualSpecialties[diseaseName] || card.category;
          return chosenCategory === libCategoryFilter;
        });
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
    let groups = groupCardsByClinicalTopic(filteredLibraryCards, customLessons);

    const isSearching = libSearchQuery.trim() !== '';
    const isFilteringStatus = libStatusFilter !== 'all';
    const isFilteringLetter = libLetterFilter !== 'All';
    const isFilteringCategory = libCategoryFilter !== 'All';

    if (isSearching || isFilteringStatus || isFilteringLetter || isFilteringCategory) {
      groups = groups.filter(group => {
        if (group.cards.length > 0) return true;
        if (isSearching && group.diseaseName.toLowerCase().includes(libSearchQuery.toLowerCase())) {
          return true;
        }
        return false;
      });
    }

    return groups;
  }, [filteredLibraryCards, selectedModule, customLessons, libSearchQuery, libStatusFilter, libLetterFilter, libCategoryFilter]);

  const moduleProgress = useMemo(() => {
    const mod1Cards = allCards.filter(c => c.category === 'General');
    const mod2Cards = allCards.filter(c => c.category !== 'General');
    const calcPct = (arr) => arr.length === 0 ? 0 : Math.round((arr.filter(c => c.isLearned).length / arr.length) * 100);
    return { 1: calcPct(mod1Cards), 2: calcPct(mod2Cards) };
  }, [allCards]);

  const getModuleProgress = (moduleNum) => moduleProgress[moduleNum] ?? 0;

  const getCurrentModuleTotalCardsCount = () => {
    if (selectedModule === 1) {
      return allCards.filter(c => c.category === 'General').length;
    }
    return allCards.filter(c => c.category !== 'General').length;
  };

  if (isLoggedIn && loading && allCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020204] text-white relative overflow-hidden select-none">
        <style>{`
          @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
          @keyframes pulse-slow { 0%, 100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
        `}</style>
        
        {/* Deep space glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
        
        {/* Twinkling stars style */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />

        {/* Orbiting Ring Loader */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          {/* Outer accretion rings */}
          <div className="absolute inset-0 rounded-full border-t border-r border-emerald-500/40" style={{ animation: 'spin-slow 3s linear infinite' }} />
          <div className="absolute inset-2 rounded-full border-b border-l border-cyan-500/30" style={{ animation: 'spin-reverse 2s linear infinite' }} />
          <div className="absolute inset-4 rounded-full border-t border-dashed border-emerald-400/20" style={{ animation: 'spin-slow 6s linear infinite' }} />
          
          {/* Middle event horizon glow */}
          <div className="absolute w-16 h-16 rounded-full bg-black border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex items-center justify-center" style={{ animation: 'pulse-slow 2s ease-in-out infinite' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* Text indicators */}
        <div className="relative z-10 text-center space-y-2 px-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-emerald-400">SINGULARITY LINK</span>
          </div>
          <h2 className="text-sm font-bold tracking-[0.15em] text-stone-300 font-mono uppercase">
            CONNECTING TO GARGANTUA CORE
          </h2>
          <p className="text-xs text-stone-500 font-light tracking-wide">
            Đang tải thư viện từ vựng từ hệ thống dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020204] text-white relative overflow-hidden select-none">
        <style>{`
          @keyframes pulse-slow { 0%, 100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
          @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        
        {/* Distressed deep space glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />

        {/* Broken link graphic */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-8">
          {/* Distressed ring */}
          <div className="absolute inset-0 rounded-full border border-red-500/20 border-dashed" style={{ animation: 'spin-slow 8s linear infinite' }} />
          {/* Core Alert */}
          <div className="absolute w-16 h-16 rounded-full bg-black border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex items-center justify-center" style={{ animation: 'pulse-slow 2.5s ease-in-out infinite' }}>
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
        </div>

        {/* Error Details */}
        <div className="relative z-10 text-center space-y-3 px-6 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-red-400">LINK FAILED</span>
          </div>
          <h2 className="text-base font-bold tracking-[0.12em] text-red-400 font-mono uppercase">
            Không thể kết nối Backend
          </h2>
          <p className="text-xs text-stone-400 font-light leading-relaxed">
            {error || "Mất kết nối với cơ sở dữ liệu học tập của hố đen Gargantua."}
          </p>
          <div className="pt-4">
            <button 
              onClick={fetchCards} 
              className="px-6 py-2 rounded-xl bg-white text-stone-950 font-semibold text-xs hover:bg-stone-100 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-stone-200"
            >
              Tải Lại Cổng Kết Nối
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 0. PREMIUM LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          usernameInput={usernameInput}
          setUsernameInput={setUsernameInput}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          loginError={loginError}
          loginSuccessMsg={loginSuccessMsg}
          handleLogin={handleLogin}
          handleQuickLogin={handleQuickLogin}
          isLoading={false}
          hasLoggedOut={hasLoggedOut}
          isSucking={isSucking}
          setIsSucking={setIsSucking}
          onLoginSuccess={onLoginSuccess}
          startMusicOnInputFocus={startMusicOnInputFocus}
        />
        {isDesktop && (
          <MusicToggleButton isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic} />
        )}
      </>
    );
  }

  // MODULE PICKER SCREEN (Home Dashboard with storyscrolling selection layout)
  if (selectedModule === null) {
    return (
      <div 
        className="relative w-full h-screen overflow-hidden transition-colors duration-1000 ease-out flex flex-col"
        style={{ backgroundColor: getActiveBg() }}
      >
              {/* Deep space stars & dynamic black hole overlay background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(#ffffff0c_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
                
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: worlds[activeWorldIndex]?.id === "duyet-03" ? 0.35 : 0.1,
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_65%)]"
                />

                <AnimatePresence>
                  {worlds[activeWorldIndex]?.id === "duyet-03" && (
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

              {/* TOP NAVIGATION HEADBOARD */}
              <header className="absolute top-0 inset-x-0 z-30 h-20 px-6 md:px-12 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-stone-950/40 via-stone-950/10 to-transparent">
                {/* Left header spacer to preserve center alignment */}
                <div className="w-28 sm:block hidden pointer-events-none" />

                {/* CENTER COMPACT LOCATION SELECTOR */}
                <div className="relative flex items-center justify-center pointer-events-auto">
                  <div className="flex items-center gap-1.5 bg-stone-950/55 backdrop-blur-xl border border-stone-800/60 p-1 rounded-full px-2 shadow-[0_12px_24px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.06)]">
                    <button
                      onClick={() => {
                        const prevIdx = (activeWorldIndex - 1 + worlds.length) % worlds.length;
                        scrollToItem(prevIdx);
                      }}
                      className="w-7 h-7 rounded-full bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-800/20 text-xs"
                      title="Địa điểm trước"
                    >
                      ←
                    </button>

                    <button
                      onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-stone-900/50 transition-all cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                        <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-450 opacity-75 animate-ping" />
                      </div>
                      
                      <span className="text-[11px] font-medium text-stone-200 select-none">
                        {worlds[activeWorldIndex]?.title}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200 transition-transform duration-350 ${isLocationDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <button
                      onClick={() => {
                        const nextIdx = (activeWorldIndex + 1) % worlds.length;
                        scrollToItem(nextIdx);
                      }}
                      className="w-7 h-7 rounded-full bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-800/20 text-xs"
                      title="Địa điểm tiếp theo"
                    >
                      →
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isLocationDropdownOpen && (
                      <>
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
                            <span>Học phần khả dụng</span>
                            <span>{worlds.length} TỌA ĐỘ</span>
                          </div>

                          {worlds.map((world, idx) => {
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
                                    ? "bg-stone-900/85 border-emerald-500/40"
                                    : "bg-transparent border-transparent hover:bg-stone-900/30 hover:border-stone-850"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-stone-800 flex-shrink-0 bg-stone-950">
                                    <img 
                                      src={world.coverImage} 
                                      alt={world.title} 
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    {isActive && (
                                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono text-emerald-450 font-semibold flex-shrink-0">
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
                                    <span className="text-emerald-400 text-[8px] tracking-wide animate-pulse font-bold">ACTIVE</span>
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
                  {isDesktop && (
                    <MusicToggleButton isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic} inline={true} />
                  )}
                  
                  <div className="flex items-center gap-2 bg-stone-900/40 px-3 py-1.5 rounded-full border border-stone-800/40 text-stone-300">
                    <span className="w-4 h-4 text-emerald-400 flex items-center justify-center">👤</span>
                    <span className="text-xs font-mono font-medium max-w-[100px] truncate">
                      {currentUser}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
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
                    <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-[1px] bg-stone-800" />
                    
                    {worlds.map((world, idx) => (
                      <button
                        key={world.id}
                        onClick={() => scrollToItem(idx)}
                        className="group flex items-center gap-3 py-1 relative z-10 focus:outline-none cursor-pointer"
                      >
                        <span className={`text-[9px] font-mono transition-all duration-300 ${
                          activeWorldIndex === idx ? "text-emerald-400" : "text-stone-600 opacity-0 group-hover:opacity-100"
                        }`}>
                          0{idx + 1}
                        </span>
                        <div className="relative flex items-center justify-center">
                          <motion.div
                            animate={{
                              scale: activeWorldIndex === idx ? 1.2 : 0.8,
                              backgroundColor: activeWorldIndex === idx ? "#10b981" : "rgba(120, 113, 108, 0.4)"
                            }}
                            className="w-2.5 h-2.5 rounded-full border border-stone-950"
                          />
                          {activeWorldIndex === idx && (
                            <motion.div
                              layoutId="active-dot-outline"
                              className="absolute -inset-1.5 rounded-full border border-emerald-400/40"
                              transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            />
                          )}
                        </div>
                        <span className={`text-[10px] font-mono tracking-wider hidden md:inline-block transition-colors duration-300 select-none ${
                          activeWorldIndex === idx ? "text-emerald-400 font-semibold" : "text-stone-500 group-hover:text-stone-300"
                        }`}>
                          {world.title}
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="hidden md:block transform -rotate-90 mt-8 font-mono text-[9px] text-stone-600 tracking-widest whitespace-nowrap">
                    SORA SYSTEM ACTIVE
                  </span>
                </div>

                {/* THE CORE VERTICAL VIEWPORT STORYSCROLL CONTAINER */}
                {worlds.length > 0 ? (
                  <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="story-scroll-container no-scrollbar"
                    style={{
                      scrollSnapType: 'y mandatory',
                      overflowY: 'auto',
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {worlds.map((world, index) => (
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
                    <span className="w-12 h-12 rounded-full border border-stone-800 flex items-center justify-center text-stone-600">✨</span>
                    <p className="text-stone-400 text-xs font-light">
                      Không tìm thấy vùng không gian thám hiểm tương ứng.
                    </p>
                    <button
                      onClick={() => scrollToItem(0)}
                      className="text-xs text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full hover:bg-emerald-500/10 cursor-pointer"
                    >
                      Quay lại đầu trang
                    </button>
                  </div>
                )}

                {/* FLOATING HINT */}
                <div className="absolute bottom-6 right-6 md:right-12 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
                  <div className="flex items-center gap-2 bg-stone-900/80 backdrop-blur border border-stone-800/80 py-1.5 px-3 rounded-full text-[10px] font-mono text-stone-400">
                    <span>PHÍM LÊN-XUỐNG ĐỂ DI CHUYỂN</span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC EXPANDED STATE (MODAL OVERLAYS) */}
              <AnimatePresence>
                {selectedWorld && (
                  <WorldDetails
                    world={selectedWorld}
                    userEmail={currentUser || "guest"}
                    onClose={() => setSelectedWorld(null)}
                    onStartModule={() => {
                      const worldToStart = selectedWorld;
                      setSelectedWorld(null);
                      handleModuleClick(worldToStart.moduleId);
                    }}
                  />
                )}
              </AnimatePresence>

              {/* PIN MODAL POPUP FOR ADMIN1+ */}
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

  // ── DUYỆT PANEL — admin only, localhost only ─────────────────────────
  if (selectedModule === 'duyet') {
    return <DuyetPanel onBack={() => setSelectedModule(null)} />;
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
        <div className="logo animate-[fadeIn_0.5s_ease-out]" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => setSelectedModule(null)}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${selectedModule === 2 ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-indigo-950/20 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]'}`}>
            <Compass className={`w-4.5 h-4.5 ${selectedModule === 2 ? 'text-emerald-400 animate-[spin_12s_linear_infinite]' : 'text-indigo-400 animate-[spin_16s_linear_infinite]'}`} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '2px', color: 'white', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              ANTIGRAVITY
            </span>
            <span style={{ fontSize: '0.6rem', color: selectedModule === 2 ? 'rgba(16,185,129,0.55)' : 'rgba(99,102,241,0.55)', fontFamily: 'var(--font-sans)', fontWeight: '750', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '-0.15rem' }}>
              {selectedModule === 2 ? 'Clinical Core' : 'Language Deck'}
            </span>
          </div>
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
        <aside className="sidebar-panel responsive-sidebar border-r border-white/5 bg-slate-950/45 backdrop-blur-2xl" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '380px', minWidth: '380px' }}>
          
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.2rem' }}>
            Menu điều hướng
          </div>

           {/* Navigation Tab 1: Los geht's Study Center */}
           <div 
             onClick={() => { setActiveSessionCards(null); setRightPanelMode('worten'); }}
             className={`nav-capsule group flex items-center gap-4 ${rightPanelMode === 'worten' || rightPanelMode === 'flashcard' ? (selectedModule === 2 ? 'active-emerald' : 'active-indigo') : ''}`}
           >
             <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all duration-300">
               <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
             </div>
             <div style={{ flex: 1 }}>
               <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <span>Los geht's</span>
                 <span className="text-[9px] font-mono opacity-50 font-normal">01</span>
               </h3>
               <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                 Thiết lập và ôn tập nhanh hôm nay.
               </p>
             </div>
           </div>

          {/* Navigation Tab 2: Bibliothek Search Library */}
          <div 
            onClick={() => { setActiveSessionCards(null); setRightPanelMode('bibliothek'); }}
            className={`nav-capsule group flex items-center gap-4 ${rightPanelMode === 'bibliothek' ? (selectedModule === 2 ? 'active-emerald' : 'active-indigo') : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-sky-500/10 group-hover:border-sky-500/30 transition-all duration-300">
              <BookOpen className="w-5 h-5 text-sky-450 group-hover:scale-110 transition-transform" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Bibliothek</span>
                <span className="text-[9px] font-mono opacity-50 font-normal">02</span>
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {selectedModule === 2 ? "Tra cứu ca bệnh lâm sàng." : "Tra cứu 1000+ từ vựng gốc."}
              </p>
            </div>
          </div>

          {/* Navigation Tab 3: Lịch sử ôn tập (History) */}
          <div 
            onClick={() => { setActiveSessionCards(null); setRightPanelMode('history'); }}
            className={`nav-capsule group flex items-center gap-4 ${rightPanelMode === 'history' ? (selectedModule === 2 ? 'active-emerald' : 'active-indigo') : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-300">
              <History className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-display)', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Lịch sử (History)</span>
                <span className="text-[9px] font-mono opacity-50 font-normal">03</span>
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Xem lại {studyHistory.length}/30 từ vựng đã ôn gần đây.
              </p>
            </div>
          </div>




          {/* Progress display in Sidebar bottom */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3.5 mt-auto">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-[10px] font-mono tracking-wider text-stone-400 font-semibold uppercase">Tiến độ học tập</span>
              <span className="text-stone-200 font-mono font-bold text-sm bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{getModuleProgress(selectedModule)}%</span>
            </div>
            <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${selectedModule === 2 ? 'from-emerald-500 to-cyan-400 shadow-[0_0_8px_#10b981]' : 'from-indigo-500 to-purple-500 shadow-[0_0_8px_#6366f1]'}`} 
                style={{ width: `${getModuleProgress(selectedModule)}%` }}
              ></div>
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
              padding: '2rem',
              overflowY: 'auto'
            }}>
              
              <div 
                className="cyber-panel-glass w-full max-w-xl p-10 rounded-3xl flex flex-col gap-6 worten-large-setup-card relative overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '560px'
                }}
              >
                
                {/* Visual Accent Top Bar */}
                <div 
                  className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${selectedModule === 2 ? 'from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_1px_10px_rgba(16,185,129,0.5)]' : 'from-indigo-500 via-purple-400 to-pink-500 shadow-[0_1px_10px_rgba(99,102,241,0.5)]'}`} 
                />

                <div style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
                  <div 
                    className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-white/[0.02] border border-white/5 ${selectedModule === 2 ? 'glow-emerald-pulse' : 'glow-indigo-pulse'}`}
                  >
                    <Zap className={`w-7 h-7 ${selectedModule === 2 ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '800', color: 'white', letterSpacing: '0.5px' }}>
                    Los geht's
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    Thiết lập số lượng câu hỏi và bộ lọc để bắt đầu phiên học flashcard.
                  </p>
                </div>

                {/* Continue Unfinished Session with distinct buttons */}
                {unfinishedSession && (
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '20px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">HỌC PHẦN CHƯA HOÀN THÀNH</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                      Bạn đang có một phiên học dở gồm <span style={{ color: selectedModule === 2 ? '#10b981' : '#8b5cf6' }}>{unfinishedSession.cards.length} thẻ</span>.
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={resumeSession}
                        style={{
                          flex: 1.5,
                          background: selectedModule === 2 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          border: 'none',
                          color: 'white',
                          padding: '0.65rem',
                          borderRadius: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s',
                          boxShadow: selectedModule === 2 ? '0 4px 12px rgba(16,185,129,0.25)' : '0 4px 12px rgba(99,102,241,0.25)'
                        }}
                      >
                        ▶ Tiếp tục học
                      </button>
                      <button 
                        onClick={discardUnfinishedSession}
                        style={{
                          flex: 1,
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#fca5a5',
                          padding: '0.65rem',
                          borderRadius: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        🗑️ Loại bỏ
                      </button>
                    </div>
                  </div>
                )}

                {/* Setup Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  
                   <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)' }}>
                      {selectedModule === 2 ? "Số lượng câu hỏi lâm sàng ôn tập" : "Số lượng từ vựng ôn tập"}
                    </label>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.2rem' }}>
                      <button 
                        type="button"
                        onClick={() => setStudyCount(prev => Math.max(1, Number(prev) - 5))}
                        style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.02)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: '750', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        className="form-input" 
                        value={studyCount}
                        onChange={(e) => setStudyCount(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700', color: 'white', padding: '0.3rem', outline: 'none' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setStudyCount(prev => Math.min(100, Number(prev) + 5))}
                        style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.02)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: '750', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.5px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Mục tiêu ôn tập
                    </label>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.25rem', gap: '0.25rem' }}>
                      {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'unlearned', label: selectedModule === 2 ? 'Chưa thuộc' : 'Chưa học' },
                        { id: 'learned', label: selectedModule === 2 ? 'Đã thuộc' : 'Đã học' }
                      ].map(item => {
                        const isActive = studyStateFilter === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setStudyStateFilter(item.id)}
                            className={`cyber-pill-toggle ${isActive ? (selectedModule === 2 ? 'active-emerald' : 'active-indigo') : ''}`}
                            style={{ flex: 1, padding: '0.55rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px' }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedModule === 1 && (
                    <div className="form-group animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Loại từ vựng (Chọn nhiều loại)</span>
                      </label>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.45rem',
                        padding: '0.8rem',
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '16px'
                      }}>
                        <button
                          type="button"
                          onClick={() => setStudyWordClasses([])}
                          className={`cyber-pill-toggle flex items-center gap-1.5 transition-all duration-300 ${studyWordClasses.length === 0 ? 'active-indigo' : ''}`}
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', borderRadius: '10px' }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${studyWordClasses.length === 0 ? 'bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse' : 'bg-white/20'}`} />
                          <span>Tất cả loại từ</span>
                        </button>
                        {[
                          { id: 'noun', name: 'Danh từ' },
                          { id: 'verb', name: 'Động từ' },
                          { id: 'adjective', name: 'Tính từ' },
                          { id: 'adverb', name: 'Trạng từ' },
                          { id: 'preposition', name: 'Giới từ' }
                        ].map(wc => {
                          const isActive = studyWordClasses.includes(wc.id);
                          return (
                            <button
                              key={wc.id}
                              type="button"
                              onClick={() => {
                                setStudyWordClasses(prev => {
                                  if (prev.includes(wc.id)) {
                                    return prev.filter(id => id !== wc.id);
                                  } else {
                                    return [...prev, wc.id];
                                  }
                                });
                              }}
                              className={`cyber-pill-toggle flex items-center gap-1.5 transition-all duration-300 ${isActive ? 'active-indigo' : ''}`}
                              style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', borderRadius: '10px' }}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-indigo-400 shadow-[0_0_8px_#6366f1] animate-pulse' : 'bg-white/20'}`} />
                              <span>{wc.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedModule === 2 && (
                    <div className="form-group animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Layers className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                        <span>Chọn chuyên khoa (Chọn nhiều chuyên khoa)</span>
                      </label>
                      <div 
                        className="left-sidebar-scroll"
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.45rem',
                          maxHeight: '140px',
                          overflowY: 'auto',
                          padding: '0.8rem',
                          background: 'rgba(255, 255, 255, 0.01)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          borderRadius: '16px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setStudySpecialties([])}
                          className={`cyber-pill-toggle flex items-center gap-1.5 transition-all duration-300 ${studySpecialties.length === 0 ? 'active-emerald' : ''}`}
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', borderRadius: '10px' }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${studySpecialties.length === 0 ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-white/20'}`} />
                          <span>Tất cả chuyên khoa</span>
                        </button>
                        {medicalSpecialties.map(spec => {
                          const isActive = studySpecialties.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => {
                                setStudySpecialties(prev => {
                                  if (prev.includes(spec)) {
                                    return prev.filter(s => s !== spec);
                                  } else {
                                    return [...prev, spec];
                                  }
                                });
                              }}
                              className={`cyber-pill-toggle flex items-center gap-1.5 transition-all duration-300 ${isActive ? 'active-emerald' : ''}`}
                              style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', borderRadius: '10px' }}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-white/20'}`} />
                              <span>{spec}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2b. CHỌN BÀI HỌC CỤ THỂ (TÙY CHỌN) */}
                  {selectedModule === 2 && (
                    <div className="form-group animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Chọn bài học cụ thể (Tùy chọn)</span>
                        </label>
                        {studyLessons.length > 0 && (
                          <button 
                            type="button" 
                            onClick={() => setStudyLessons([])}
                            style={{ fontSize: '0.7rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                          >
                            Xóa chọn ({studyLessons.length})
                          </button>
                        )}
                      </div>
                      
                      {/* Search controls */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search className="w-3 h-3 text-white/30" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            placeholder="Tìm bài học (ví dụ: Pneumonie, Sepsis...)"
                            value={lessonSearchQuery}
                            onChange={(e) => setLessonSearchQuery(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.4rem 0.6rem 0.4rem 1.8rem',
                              fontSize: '0.75rem',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              color: '#fff',
                              outline: 'none',
                              transition: 'all 0.3s'
                            }}
                            className="focus:border-emerald-500/55 focus:shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                          />
                        </div>
                      </div>

                      {/* Scrollable list */}
                      <div 
                        className="left-sidebar-scroll"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.3rem',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          padding: '0.6rem',
                          background: 'rgba(255, 255, 255, 0.01)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          borderRadius: '16px'
                        }}
                      >
                        {availableLessons.filter(lesson => 
                          lesson.toLowerCase().includes(lessonSearchQuery.toLowerCase())
                        ).length === 0 ? (
                          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', padding: '1rem' }}>
                            Không tìm thấy bài học nào phù hợp
                          </div>
                        ) : (
                          availableLessons.filter(lesson => 
                            lesson.toLowerCase().includes(lessonSearchQuery.toLowerCase())
                          ).map(lesson => {
                            const isActive = studyLessons.includes(lesson);
                            const cardCount = lessonCardCounts[lesson] || 0;
                            return (
                              <div
                                key={lesson}
                                onClick={() => {
                                  setStudyLessons(prev => {
                                    if (prev.includes(lesson)) {
                                      return prev.filter(l => l !== lesson);
                                    } else {
                                      return [...prev, lesson];
                                    }
                                  });
                                }}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.45rem 0.75rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.01)',
                                  border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.03)'}`,
                                  transition: 'all 0.2s'
                                }}
                                className="hover:bg-white/[0.04] transition-all"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, overflow: 'hidden' }}>
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-white/20'}`} />
                                  <span style={{ 
                                    color: isActive ? '#34d399' : '#e2e8f0', 
                                    fontWeight: isActive ? '600' : '400',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {lesson}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: isActive ? '#a7f3d0' : 'rgba(255,255,255,0.35)', background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>
                                  {cardCount} thẻ
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <button 
                  onClick={startNewSession}
                  className={`w-full py-4 mt-2 rounded-2xl font-bold tracking-wider text-sm text-white uppercase transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${selectedModule === 2 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-emerald-500/20' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-indigo-500/20'}`}
                >
                  Bắt đầu ôn Flashcard →
                </button>

              </div>

            </div>
          )}

          {/* 3. DUYỆT VIEWER — Review Queue with Public / Delete actions */}
          {rightPanelMode === 'duyet' && (
            <DuyetView 
              cards={allCards} 
              selectedModule={selectedModule} 
              apiBaseUrl={API_BASE_URL} 
              showAnkiToast={showAnkiToast} 
              setRocketState={setRocketState}
              setModalSessionCards={setModalSessionCards}
              setModalStartIndex={setModalStartIndex}
            />
          )}

          {/* 3b. BIBLIOTHEK VIEWER (hidden but kept for compatibility) */}
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
                background: 'rgba(5, 6, 12, 0.6)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                padding: '1.2rem 2rem',
                position: 'relative'
              }}>
                {/* Decorative accent top bar */}
                <div 
                  className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${selectedModule === 2 ? 'from-emerald-500 to-cyan-500 shadow-[0_0_8px_#10b981]' : 'from-indigo-500 to-purple-500 shadow-[0_0_8px_#6366f1]'}`} 
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '850', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                      {selectedModule === 2 ? <Layers className="w-5 h-5 text-emerald-450 animate-pulse" /> : <BookOpen className="w-5 h-5 text-indigo-400" />}
                      <span>{selectedModule === 2 ? "Thư viện lâm sàng (Klinik)" : "Thư viện từ vựng (Bibliothek)"}</span>
                    </h2>
                    {selectedModule === 1 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem', margin: 0 }}>
                        Duyệt từ gốc cực kỳ tinh giản. Nhấp để tra cứu chi tiết dạng Flashcard.
                      </p>
                    )}
                    {selectedModule === 2 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem', margin: 0 }}>
                        Tra cứu ca bệnh lâm sàng Meditricks M2 chuyên sâu. Bấm vào thẻ để ôn tập.
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => setRightPanelMode('worten')}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      padding: '0.45rem 1rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'white'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    <ArrowLeft className="w-4 h-4" /> <span>Quay lại</span>
                  </button>
                </div>

                {/* Search input and status filters */}
                <div className="lib-filter-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  
                  {/* Modern Search Bar */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder={selectedModule === 2 
                        ? "Tìm kiếm nhanh ca bệnh, bệnh học hoặc nghĩa..." 
                        : "Tìm kiếm nhanh bằng từ tiếng Đức hoặc nghĩa tiếng Việt..."}
                      className="form-input" 
                      value={libSearchQuery}
                      onChange={(e) => setLibSearchQuery(e.target.value)}
                      style={{
                        padding: '0.45rem 2rem 0.45rem 2.3rem',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: '0.85rem',
                        borderRadius: '10px',
                        height: '38px',
                        color: 'white',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = selectedModule === 2 ? '#10b981' : '#6366f1'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                    />
                    {libSearchQuery && (
                      <button 
                        onClick={() => setLibSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '0.8rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Specialty Dropdown for Medicine Module */}
                  {selectedModule === 2 && (
                    <div style={{ width: '240px' }}>
                      <select 
                        className="form-select" 
                        value={libCategoryFilter}
                        onChange={(e) => setLibCategoryFilter(e.target.value)}
                        style={{ 
                          background: 'rgba(0,0,0,0.25)', 
                          border: '1px solid rgba(255,255,255,0.06)',
                          padding: '0.45rem 1.8rem 0.45rem 0.75rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          height: '38px', 
                          cursor: 'pointer',
                          color: 'white',
                          width: '100%',
                          outline: 'none'
                        }}
                      >
                        <option value="All" style={{ background: '#09090f' }}>Tất cả chuyên khoa ({medicalSpecialties.length})</option>
                        {medicalSpecialties.map(spec => (
                          <option key={spec} value={spec} style={{ background: '#09090f' }}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Word Class Dropdown for German Module */}
                  {selectedModule === 1 && (
                    <div style={{ width: '200px' }}>
                      <select 
                        className="form-select" 
                        value={libWordClassFilter}
                        onChange={(e) => setLibWordClassFilter(e.target.value)}
                        style={{ 
                          background: 'rgba(0,0,0,0.25)', 
                          border: '1px solid rgba(255,255,255,0.06)',
                          padding: '0.45rem 1.8rem 0.45rem 0.75rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          height: '38px', 
                          cursor: 'pointer',
                          color: 'white',
                          width: '100%',
                          outline: 'none'
                        }}
                      >
                        <option value="all" style={{ background: '#09090f' }}>Tất cả loại từ</option>
                        <option value="noun" style={{ background: '#09090f' }}>Danh từ (Nouns)</option>
                        <option value="verb" style={{ background: '#09090f' }}>Động từ (Verbs)</option>
                        <option value="adjective" style={{ background: '#09090f' }}>Tính từ (Adjectives)</option>
                        <option value="adverb" style={{ background: '#09090f' }}>Trạng từ (Adverbs)</option>
                        <option value="preposition" style={{ background: '#09090f' }}>Giới từ (Prepositions)</option>
                      </select>
                    </div>
                  )}

                  {/* Learned Status Filters */}
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.2rem', borderRadius: '10px', gap: '0.2rem', height: '38px', alignItems: 'center' }}>
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'unlearned', label: 'Chưa học' },
                      { id: 'learned', label: 'Đã học' }
                    ].map(item => {
                      const isActive = libStatusFilter === item.id;
                      return (
                        <button 
                          key={item.id}
                          className={`cyber-pill-toggle ${isActive ? (selectedModule === 2 ? 'active-emerald' : 'active-indigo') : ''}`}
                          onClick={() => setLibStatusFilter(item.id)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px' }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* Alphabet filters */}
                {selectedModule === 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.35rem 0.75rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '1px', whiteSpace: 'nowrap' }}>Lọc chữ cái:</span>
                    <div className="alphabet-filter no-scrollbar" style={{ flex: 1, marginBottom: 0, paddingBottom: 0, gap: '0.2rem', display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth' }}>
                      <button 
                        className={`cyber-pill-toggle ${libLetterFilter === 'All' ? 'active-indigo' : ''}`}
                        onClick={() => setLibLetterFilter('All')}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', borderRadius: '5px', minWidth: '32px' }}
                      >
                        All
                      </button>
                      {alphabet.map(letter => (
                        <button 
                          key={letter} 
                          className={`cyber-pill-toggle ${libLetterFilter === letter ? 'active-indigo' : ''}`}
                          onClick={() => setLibLetterFilter(letter)}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', borderRadius: '5px', minWidth: '24px' }}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Lesson Row for Module 2 */}
                {selectedModule === 2 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '10px'
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Plus className="w-3.5 h-3.5 text-emerald-450" /> <span>Thêm bài:</span>
                    </span>
                    
                    <input
                      type="text"
                      placeholder="Tên chủ đề/bài lớn mới..."
                      value={newLessonInputVal}
                      onChange={e => setNewLessonInputVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddNewLesson(); }}
                      style={{
                        width: '180px',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'white',
                        fontSize: '0.78rem',
                        outline: 'none',
                      }}
                    />

                    <select
                      value={newLessonSpecialty}
                      onChange={e => setNewLessonSpecialty(e.target.value)}
                      style={{
                        width: '140px',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'white',
                        fontSize: '0.78rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {medicalSpecialties.map(spec => (
                        <option key={spec} value={spec} style={{ background: '#0a0b20' }}>{spec}</option>
                      ))}
                    </select>

                    <button
                      onClick={handleAddNewLesson}
                      style={{
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        color: '#34d399',
                        padding: '0.35rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(16,185,129,0.2)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(16,185,129,0.12)'}
                    >
                      Lưu bài
                    </button>
                  </div>
                )}

              </div>

              {/* Scrollable Word Grid */}
              <div ref={libraryListRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }} className="library-large-list">

                {(selectedModule === 1 ? filteredLibraryCards.length === 0 : groupedClinicalCards.length === 0) ? (
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
                              const allLearned = groupCards.length > 0 && learnedCount === groupCards.length;
                              const isExpanded = !!expandedThemes[diseaseName];
                              const hasCards = groupCards.length > 0;
                              
                              return (
                                 <div key={diseaseName} style={{ marginBottom: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s' }}>
                                   {/* Group header — disease name */}
                                   <div 
                                     onClick={() => {
                                       if (hasCards) {
                                         setExpandedThemes(prev => ({ ...prev, [diseaseName]: !prev[diseaseName] }));
                                       }
                                     }}
                                     style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', cursor: hasCards ? 'pointer' : 'default', transition: 'all 0.2s' }}
                                     className={hasCards ? "lib-group-header-hover" : ""}
                                   >
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                       {hasCards ? (
                                         <ChevronDown 
                                           className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} 
                                         />
                                       ) : (
                                         <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.3, userSelect: 'none', width: '16px', textAlign: 'center' }}>
                                           •
                                         </span>
                                       )}
                                       <span style={{ fontWeight: '700', fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                         <span>📖</span>
                                         <span className="truncate max-w-[280px] sm:max-w-md">{displayName}</span>
                                       </span>
                                     </div>
                                     
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                       {hasCards && (
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                           <span style={{ fontSize: '0.75rem', color: allLearned ? '#34d399' : 'var(--text-secondary)', fontWeight: '700', background: allLearned ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${allLearned ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                             {learnedCount}/{groupCards.length} ✓
                                           </span>
                                           <button 
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               setModalSessionCards(groupCards);
                                               setModalStartIndex(0);
                                             }}
                                             style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: '700', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', padding: '0.25rem 0.65rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(245,158,11,0.1)' }}
                                             onMouseEnter={(e) => e.target.style.background = 'rgba(245,158,11,0.2)'}
                                             onMouseLeave={(e) => e.target.style.background = 'rgba(245,158,11,0.1)'}
                                           >
                                             Ôn tập →
                                           </button>
                                         </div>
                                       )}

                                       <select
                                         value={manualSpecialties[diseaseName] || groupCards[0]?.category || 'Innere Medizin'}
                                         onChange={(e) => {
                                           const updated = { ...manualSpecialties, [diseaseName]: e.target.value };
                                           setManualSpecialties(updated);
                                           localStorage.setItem('manual_specialties', JSON.stringify(updated));
                                         }}
                                         onClick={(e) => e.stopPropagation()}
                                         style={{
                                           fontSize: '0.78rem',
                                           padding: '0.25rem 0.5rem',
                                           background: 'rgba(0,0,0,0.25)',
                                           border: '1px solid rgba(255,255,255,0.06)',
                                           borderRadius: '8px',
                                           color: 'white',
                                           cursor: 'pointer',
                                           outline: 'none'
                                         }}
                                       >
                                         {medicalSpecialties.map(spec => (
                                           <option key={spec} value={spec} style={{ background: '#0a0b20' }}>{spec}</option>
                                         ))}
                                       </select>

                                       {customLessons.includes(diseaseName) && (
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleDeleteCustomLesson(diseaseName, groupCards);
                                           }}
                                           style={{
                                             background: 'rgba(239, 68, 68, 0.12)',
                                             border: '1px solid rgba(239, 68, 68, 0.25)',
                                             color: '#fca5a5',
                                             padding: '0.25rem 0.5rem',
                                             borderRadius: '8px',
                                             fontSize: '0.78rem',
                                             fontWeight: '600',
                                             cursor: 'pointer',
                                             transition: 'all 0.15s'
                                           }}
                                           onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.25)'}
                                           onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.12)'}
                                           title="Xóa bài lớn và tất cả các thẻ của bài này"
                                         >
                                           Xóa bài
                                         </button>
                                       )}
                                     </div>
                                   </div>

                                   {/* Expanded Cards list inside theme accordion */}
                                   {hasCards && isExpanded && (
                                     <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                                       {groupCards.map((card, idx) => {
                                          const cardId = card._id || card.id;
                                          const cardNum = card.word.match(/\(Card\s*#(\d+)\)/i);
                                          const num = cardNum ? cardNum[1] : (idx + 1);
                                          
                                          // Simple card preview
                                          const lines = card.word.split('\n').map(l => l.trim()).filter(Boolean);
                                          const questionLine = lines[1] || lines[0] || '';
                                          const preview = questionLine.replace(/\{\{c\d+::([^}]*)\}\}/g, ' [...] ');

                                          return (
                                            <div
                                              key={cardId}
                                              className="quantum-card library-large-card-compact"
                                              onClick={() => {
                                                setModalSessionCards(groupCards);
                                                setModalStartIndex(idx);
                                              }}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '1.2rem',
                                                padding: '1rem 1.4rem',
                                                margin: '0.65rem 1.25rem',
                                                borderRadius: '16px',
                                                background: card.isLearned 
                                                  ? 'rgba(16, 185, 129, 0.02)' 
                                                  : 'rgba(8, 8, 16, 0.45)',
                                                border: card.isLearned 
                                                  ? '1px solid rgba(16, 185, 129, 0.25)' 
                                                  : '1px solid rgba(255, 255, 255, 0.04)',
                                                borderLeft: `4px solid ${card.isLearned ? '#10b981' : '#6366f1'}`,
                                                cursor: 'pointer',
                                                boxShadow: card.isLearned 
                                                  ? '0 4px 12px rgba(16, 185, 129, 0.02)' 
                                                  : '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                backdropFilter: 'blur(8px)',
                                                transition: 'all 0.25s ease-out',
                                              }}
                                            >
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                                <span style={{
                                                  fontSize: '0.7rem',
                                                  fontWeight: '700',
                                                  background: card.isLearned ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                                                  color: card.isLearned ? '#34d399' : '#a5b4fc',
                                                  border: `1px solid ${card.isLearned ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
                                                  borderRadius: '20px',
                                                  padding: '0.2rem 0.6rem',
                                                  whiteSpace: 'nowrap',
                                                  flexShrink: 0
                                                }}>
                                                  Card #${num}
                                                </span>
                                                {card.isLearned ? (
                                                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.45rem', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>Đã thuộc</span>
                                                ) : (
                                                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#f87171', background: 'rgba(239, 68, 68, 0.12)', padding: '0.15rem 0.45rem', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>Chưa thuộc</span>
                                                )}
                                                <span style={{
                                                  fontSize: '0.85rem',
                                                  color: card.isLearned ? '#a7f3d0' : 'rgba(255, 255, 255, 0.85)',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  display: '-webkit-box',
                                                  WebkitLineClamp: 2,
                                                  WebkitBoxOrient: 'vertical',
                                                  lineHeight: '1.4',
                                                  fontWeight: '550'
                                                }}>
                                                  {preview}
                                                </span>
                                              </div>
                                              
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
                                                <div
                                                  onClick={(e) => { e.stopPropagation(); handleUpdateSingleCard(cardId, !card.isLearned); }}
                                                  className={`cyber-checkbox ${card.isLearned ? 'checked-emerald' : ''}`}
                                                  title={card.isLearned ? 'Đánh dấu chưa thuộc' : 'Đánh dấu đã thuộc'}
                                                >
                                                  {card.isLearned ? '✓' : ''}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                     </div>
                                   )}
                                 </div>
                              );
                            })}
                            
                            {/* Pagination Controls */}
                            {renderLibPagination(
                              libCurrentPage,
                              totalPages,
                              setLibCurrentPage,
                              <>Chủ đề <span style={{ color: 'var(--accent-active-color)' }}>{(libCurrentPage - 1) * groupsPerPage + 1} - {Math.min(libCurrentPage * groupsPerPage, groupedClinicalCards.length)}</span> trên {groupedClinicalCards.length}</>
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
                                  <div key={cardId} className="quantum-card library-large-card-compact"
                                    onClick={() => { setModalSessionCards(filteredLibraryCards); setModalStartIndex(globalIndex); }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '1.1rem 1.4rem',
                                      background: card.isLearned ? 'rgba(16, 185, 129, 0.02)' : 'rgba(8, 8, 16, 0.45)',
                                      border: card.isLearned ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)',
                                      borderLeft: `3px solid ${card.isLearned ? '#10b981' : '#6366f1'}`,
                                      borderRadius: '16px',
                                      cursor: 'pointer',
                                      transition: 'all 0.25s ease-out'
                                    }}
                                  >
                                    <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: '750', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {card.word.split('(')[0].split(',')[0].trim()}
                                      </h4>
                                      <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {getCardSubTopic(card)}
                                      </span>
                                    </div>
                                    <div 
                                      onClick={(e) => { e.stopPropagation(); handleUpdateSingleCard(cardId, !card.isLearned); }} 
                                      className={`cyber-checkbox ${card.isLearned ? 'checked-indigo' : ''}`}
                                      title={card.isLearned ? 'Đã học' : 'Chưa học'}
                                    >
                                      {card.isLearned ? '✓' : ''}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Pagination Controls */}
                            {renderLibPagination(
                              libCurrentPage,
                              totalPages,
                              setLibCurrentPage,
                              <>Từ vựng <span style={{ color: 'var(--accent-active-color)' }}>{(libCurrentPage - 1) * itemsPerPage + 1} - {Math.min(libCurrentPage * itemsPerPage, filteredLibraryCards.length)}</span> trên {filteredLibraryCards.length}</>
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
                padding: '1.2rem 2rem',
                background: 'rgba(5, 6, 12, 0.6)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
              }}>
                {/* Decorative accent top bar */}
                <div 
                  className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${selectedModule === 2 ? 'from-emerald-500 to-cyan-500 shadow-[0_0_8px_#10b981]' : 'from-indigo-500 to-purple-500 shadow-[0_0_8px_#6366f1]'}`} 
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <History className={`w-5 h-5 ${selectedModule === 2 ? 'text-emerald-400' : 'text-indigo-400'}`} />
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: '850', color: 'white', margin: 0 }}>
                      Lịch sử ôn tập
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem', margin: 0 }}>
                      Hiển thị tối đa 30 từ vựng bạn vừa ôn tập gần đây. Nhấp vào từ để ôn lại.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setRightPanelMode('worten')}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    padding: '0.45rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'white'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  <ArrowLeft className="w-4 h-4" /> <span>Quay lại</span>
                </button>
              </div>

              {/* Scrollable Word Grid for History */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.2rem',
                alignContent: 'start'
              }} className="library-large-list">
                
                {studyHistory.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🕒</span>
                    <h3 style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>Chưa có từ vựng nào trong lịch sử</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Hãy hoàn thành một phiên học flashcard để các từ học được lưu lại tại đây.
                    </p>
                  </div>
                ) : (
                  studyHistory.map((card, index) => {
                    const cardId = card._id || card.id;
                    const isLearned = card.isLearned;
                    return (
                      <div
                        key={cardId}
                        className="quantum-card library-large-card-compact"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1.1rem 1.4rem',
                          background: isLearned ? 'rgba(16, 185, 129, 0.02)' : 'rgba(8, 8, 16, 0.45)',
                          border: isLearned ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)',
                          borderLeft: `3px solid ${isLearned ? '#10b981' : '#6366f1'}`,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease-out'
                        }}
                        onClick={() => {
                          setModalSessionCards(studyHistory);
                          setModalStartIndex(index);
                        }}
                      >
                        <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: '750', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={card.word}>
                            {card.word.split('(')[0].split(',')[0].trim()}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: '650', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getCardSubTopic(card)}
                          </span>
                          <span style={{ alignSelf: 'flex-start', fontSize: '0.62rem', fontWeight: '700', color: selectedModule === 2 ? '#34d399' : '#a5b4fc', background: selectedModule === 2 ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', padding: '0.1rem 0.45rem', borderRadius: '4px', marginTop: '0.2rem', textTransform: 'uppercase', tracking: '0.5px' }}>
                            {card.category === 'General' ? 'Tiếng Đức' : card.category}
                          </span>
                        </div>

                        {/* Direct Tick checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateSingleCard(cardId, !card.isLearned);
                            setStudyHistory(prev => {
                              const updated = prev.map(c => {
                                const cId = c._id || c.id;
                                return cId === cardId ? { ...c, isLearned: !c.isLearned } : c;
                              });
                              localStorage.setItem(`study_history_words_user_${currentUser}_module_${selectedModule}`, JSON.stringify(updated));
                              return updated;
                            });
                          }}
                          className={`cyber-checkbox ${isLearned ? (selectedModule === 2 ? 'checked-emerald' : 'checked-indigo') : ''}`}
                          title={isLearned ? "Đã học (Bấm để hủy đánh dấu)" : "Chưa học (Bấm để đánh dấu đã học)"}
                        >
                          {isLearned ? '✓' : ''}
                        </div>

                      </div>
                    );
                  })
                )}
                
              </div>

            </div>
          )}

          {/* 5. MEDDE HUB (ECOSYSTEM) */}
          {rightPanelMode === 'medde_hub' && (
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
                padding: '1.5rem 2rem',
                background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    Sổ tay Tra Cứu MedDE
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Lịch sử tra cứu y khoa tự động được đồng bộ trực tiếp từ MedDE Chrome Extension của bạn.
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
                  ✕ Đóng sổ tay
                </button>
              </div>

              {/* Main Content Layout - Split View */}
              {loadingMedde && meddeHistory.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ border: '4px solid rgba(255, 255, 255, 0.1)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Đang tải lịch sử tra cứu...</p>
                </div>
              ) : meddeHistory.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '4rem' }}>📖</span>
                  <h3>Chưa có lịch sử tra cứu nào</h3>
                  <p style={{ fontSize: '0.85rem', maxWidth: '360px', textAlign: 'center' }}>
                    Hãy bôi đen và dịch các thuật ngữ y khoa Đức-Việt bằng tiện ích mở rộng MedDE trên trình duyệt để lịch sử tự động xuất hiện tại đây.
                  </p>
                  <button onClick={fetchMeddeHistory} className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}>Tải lại</button>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  
                  {/* Left List Pane */}
                  <div style={{ width: '38%', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'rgba(0,0,0,0.1)' }}>
                    {meddeHistory.map((item, idx) => {
                      const id = item._id || item.id;
                      const isSelected = selectedLookupId === id;
                      const isQuick = item.type === 'quick';
                      const wordPreview = item.german || item.word;

                      return (
                        <div
                          key={id}
                          onClick={() => setSelectedLookupId(id)}
                          style={{
                            padding: '1.2rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                            borderLeft: isSelected ? '4px solid var(--accent-primary)' : '4px solid transparent',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                          className="medde-history-item"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                            <h4 style={{ color: 'white', fontWeight: '700', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                              {wordPreview}
                            </h4>
                            <span style={{
                              fontSize: '0.62rem', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase',
                              background: isQuick ? 'rgba(59,130,246,0.18)' : 'rgba(168,85,247,0.18)',
                              color: isQuick ? '#60a5fa' : '#c084fc',
                              border: `1px solid ${isQuick ? 'rgba(59,130,246,0.3)' : 'rgba(168,85,247,0.3)'}`
                            }}>
                              {isQuick ? 'Quick' : 'Deep'}
                            </span>
                          </div>

                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.3rem' }}>
                            {isQuick ? item.translation?.viet : item.translation?.dinh_nghia}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {new Date(item.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            </span>
                            <button
                              onClick={(e) => handleDeleteMeddeItem(id, e)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.7, padding: '2px' }}
                              title="Xóa lịch sử"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Detail Pane */}
                  <div style={{ width: '62%', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '2.5rem' }}>
                    {(() => {
                      const activeItem = meddeHistory.find(item => (item._id || item.id) === selectedLookupId) || meddeHistory[0];
                      if (!activeItem) return null;

                      const isQuick = activeItem.type === 'quick';
                      const t = activeItem.translation;
                      const hasSent = !!(activeItem.ankiSent);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
                          
                          {/* Heading & Main Word info */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Thuật ngữ Đức</span>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginTop: '0.2rem' }}>{activeItem.german}</h1>
                                {activeItem.word !== activeItem.german && (
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                    Bôi đen gốc: <span style={{ fontFamily: 'monospace', color: '#fca5a5' }}>"{activeItem.word}"</span>
                                  </p>
                                )}
                              </div>
                              
                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                  onClick={() => setImportingItem(activeItem)}
                                  className="btn-secondary"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.6rem 1rem', borderRadius: '10px' }}
                                >
                                  ➕ Toibingu
                                </button>
                                <button
                                  onClick={(e) => sendLookupToAnki(activeItem, false)}
                                  onContextMenu={(e) => { e.preventDefault(); sendLookupToAnki(activeItem, true); }}
                                  className="btn-primary"
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.6rem 1rem', borderRadius: '10px',
                                    background: hasSent ? 'linear-gradient(135deg, rgba(99,102,241,0.6), rgba(168,85,247,0.6))' : 'var(--accent-primary)',
                                    borderColor: hasSent ? 'rgba(99,102,241,0.4)' : 'var(--accent-primary)',
                                  }}
                                  title="Thêm vào Anki (Chuột phải để thêm thẳng không qua chấm điểm)"
                                >
                                  {hasSent ? '🟣 Đã gửi Anki' : '📤 Gửi vào Anki'}
                                </button>
                              </div>
                            </div>

                            {activeItem.context && (
                              <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--accent-primary)', padding: '1rem', borderRadius: '0 8px 8px 0', marginTop: '1.2rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Ngữ cảnh phát hiện</span>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>"{activeItem.context}"</p>
                              </div>
                            )}
                          </div>

                          {/* Render Translation Details (Structured Cards) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {isQuick ? (
                              // QUICK TRANSLATION LAYOUT
                              <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Nghĩa Tiếng Việt</span>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginTop: '0.4rem' }}>{t.viet || 'N/A'}</p>
                                  </div>
                                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase' }}>Tiếng Anh / Latin</span>
                                    <p style={{ fontSize: '0.98rem', fontWeight: '600', color: 'white', marginTop: '0.4rem' }}>
                                      🇬🇧 {t.en || 'N/A'} <br />
                                      🧬 {t.latin ? <span style={{ fontStyle: 'italic' }}>{t.latin}</span> : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                {t.symptom && (
                                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase' }}>Triệu chứng lâm sàng</span>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '0.5rem', lineHeight: '1.6' }}>{t.symptom}</p>
                                  </div>
                                )}

                                {t.note && (
                                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Ghi chú học tập</span>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.5' }}>{t.note}</p>
                                  </div>
                                )}
                              </>
                            ) : (
                              // DEEP CLINICAL EXPLANATION LAYOUT
                              <>
                                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Định nghĩa y khoa</span>
                                  <p style={{ fontSize: '1rem', color: 'white', marginTop: '0.4rem', lineHeight: '1.6', fontWeight: '500' }}>{t.dinh_nghia || 'N/A'}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase' }}>Triệu chứng điển hình</span>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.6' }}>{t.trieu_chung || 'N/A'}</p>
                                  </div>
                                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: '700', textTransform: 'uppercase' }}>Chẩn đoán quyết định</span>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.6' }}>{t.chan_doan || 'N/A'}</p>
                                  </div>
                                </div>

                                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', padding: '1.2rem', borderRadius: '16px' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '700', textTransform: 'uppercase' }}>Nguyên tắc điều trị</span>
                                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.6' }}>{t.dieu_tri || 'N/A'}</p>
                                </div>

                                {t.impp_note && (
                                  <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid rgba(236, 72, 153, 0.25)', padding: '1.2rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                      ⭐ Key thi IMPP M2
                                    </span>
                                    <p style={{ fontSize: '0.92rem', color: 'white', fontWeight: '600', marginTop: '0.4rem', lineHeight: '1.5' }}>{t.impp_note}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* 6. LIGHTNING DECKS */}
          {rightPanelMode === 'lightning_decks' && (
            <LightningDecksView />
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

      {/* --- PROMOTION/IMPORT MODAL FOR ECOSYSTEM HUB --- */}
      {importingItem !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 6, 12, 0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 3500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'overlayFadeIn 0.25s ease-out'
        }}
        onClick={() => { setImportingItem(null); setImportExample(""); }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            animation: 'modalBumpUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span style={{ fontSize: '2.5rem' }}>➕</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: 'white', marginTop: '0.5rem' }}>
                Thêm vào Thư viện Toibingu
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Chuyển thuật ngữ <strong style={{ color: 'white' }}>"{importingItem.german}"</strong> thành một thẻ học tập chính thức.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Học phần học tập</label>
                <select 
                  className="form-select"
                  value={importModule}
                  onChange={(e) => setImportModule(Number(e.target.value))}
                  style={{ padding: '0.7rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }}
                >
                  <option value={2}>Học phần 2 (Chuyên ngành Y khoa)</option>
                  <option value={1}>Học phần 1 (Từ vựng tiếng Đức tổng hợp)</option>
                </select>
              </div>

              {importModule === 2 ? (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Chuyên khoa y học</label>
                  <select 
                    className="form-select"
                    value={importCategory}
                    onChange={(e) => setImportCategory(e.target.value)}
                    style={{ padding: '0.7rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    {medicalSpecialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Nhóm từ vựng</label>
                  <select 
                    className="form-select"
                    value={importCategory}
                    onChange={(e) => setImportCategory(e.target.value)}
                    style={{ padding: '0.7rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }}
                  >
                    <option value="General">General (Từ vựng chung)</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Ghi chú ngữ cảnh / Ví dụ</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ví dụ: Đọc trên bài Amboss... hoặc để trống"
                  value={importExample}
                  onChange={(e) => setImportExample(e.target.value)}
                  style={{ padding: '0.7rem 1rem', borderRadius: '10px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => { setImportingItem(null); setImportExample(""); }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handlePromoteToCard}
                style={{
                  flex: 1,
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}
              >
                Tạo thẻ ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lib-group-header-hover:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        @keyframes blinkTarget {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes rocketFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes rocketFlyOut {
          0% { transform: translateY(0px) scale(1); }
          30% { transform: translateY(-440px) scale(0.5); opacity: 0; }
          31% { transform: translateY(440px) scale(0.5); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes flameThrustNormal {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50% { transform: scaleY(1.15) scaleX(0.92); }
        }
        @keyframes flameFlickerErratic {
          0%, 100% { opacity: 0.1; transform: scaleY(0.3); fill: #475569; }
          25% { opacity: 0.8; transform: scaleY(0.75); fill: #f59e0b; }
          50% { opacity: 0.1; transform: scaleY(0.15); fill: #334155; }
          75% { opacity: 0.7; transform: scaleY(0.55); fill: #ef4444; }
        }
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
      {/* Anki Toast Notifications */}
      <AnkiToast toasts={ankiToasts} />

    </div>
  );
}

function MusicToggleButton({ isMusicPlaying, toggleMusic, inline = false }) {
  return (
    <div className={inline ? "select-none flex items-center" : "fixed top-6 right-6 z-[9999] select-none"}>
      <style>{`
        @keyframes bar-rise {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
      <button
        onClick={toggleMusic}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#040407]/45 border border-stone-850 backdrop-blur-md text-stone-400 hover:text-white hover:border-stone-700 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-[0.97] transition-all duration-300 cursor-pointer"
      >
        {isMusicPlaying ? (
          <>
            <Volume2 className="w-4 h-4 text-emerald-450" />
            <div className="flex items-end gap-[2px] h-3 w-3.5 mb-[1px]">
              <span className="w-[2px] bg-emerald-450 rounded-full" style={{ animation: 'bar-rise 0.8s ease-in-out infinite alternate', animationDelay: '0.1s' }} />
              <span className="w-[2px] bg-emerald-450 rounded-full" style={{ animation: 'bar-rise 1.1s ease-in-out infinite alternate', animationDelay: '0.3s' }} />
              <span className="w-[2px] bg-emerald-450 rounded-full" style={{ animation: 'bar-rise 0.9s ease-in-out infinite alternate', animationDelay: '0s' }} />
            </div>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-stone-500" />
            <span className="text-[9px] uppercase tracking-wider text-stone-500 font-mono font-semibold">MUTED</span>
          </>
        )}
      </button>
    </div>
  );
}
