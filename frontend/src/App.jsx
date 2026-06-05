import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import FlashcardPlayer from './components/FlashcardPlayer';
import LightningDecksView from './components/LightningDecksView';
import DuyetPanel from './components/DuyetPanel';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
          {/* ── Điều kiện hiện ô Duyệt: chỉ admin + localhost ── */}
          {(() => {
            const isLocalhost = typeof window !== 'undefined' &&
              (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const showDuyet = currentUser === 'admin' && isLocalhost;
            return (
              <div className="module-grid" style={{
                maxWidth: showDuyet ? '900px' : '600px',
                gridTemplateColumns: showDuyet ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'
              }}>

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

                {/* Ô DUYỆT — chỉ admin + localhost */}
                {showDuyet && (
                  <div
                    className="module-card"
                    onClick={() => setSelectedModule('duyet')}
                    style={{
                      padding: '3.5rem 2rem',
                      background: 'rgba(239,68,68,0.06)',
                      border: '1.5px dashed rgba(239,68,68,0.35)',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderRadius: '20px',
                      position: 'relative',
                    }}
                  >
                    {/* LOCAL-ONLY badge */}
                    <span style={{
                      position: 'absolute', top: '0.7rem', right: '0.7rem',
                      fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase',
                      background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
                      border: '1px solid rgba(239,68,68,0.3)',
                      padding: '0.15rem 0.5rem', borderRadius: '6px', letterSpacing: '0.5px'
                    }}>LOCAL ONLY</span>

                    <span style={{ fontSize: '3.5rem' }}>🛠️</span>
                    <span className="module-name" style={{ fontSize: '1.4rem', marginTop: '0.5rem', color: '#fca5a5' }}>DUYỆT</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'rgba(252,165,165,0.6)' }}>Admin tools</span>
                  </div>
                )}

              </div>
            );
          })()}

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
          
          {selectedModule !== 2 && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '-0.4rem' }}>
              Menu điều hướng
            </div>
          )}

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
               boxShadow: rightPanelMode === 'worten' || rightPanelMode === 'flashcard' ? '0 0 15px var(--accent-active-glow)' : 'none',
               display: 'flex',
               alignItems: 'center',
               gap: '1rem'
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
                {selectedModule === 2 ? "Tra cứu ca bệnh lâm sàng" : "Tra cứu 1000+ từ vựng gốc."}
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


          {/* Progress display in Sidebar bottom */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: '600', color: 'white', marginBottom: '0.4rem' }}>Tiến độ học tập</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>Đã thuộc:</span>
              <span style={{ color: 'var(--status-learned)', fontWeight: '700' }}>{getModuleProgress(selectedModule)}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${getModuleProgress(selectedModule)}%`, height: '100%', background: 'var(--status-learned)', transition: 'width 0.6s ease-out' }}></div>
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
                background: 'rgba(15, 20, 35, 0.45)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                padding: '0.8rem 1.4rem'
              }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      {selectedModule === 2 ? "Thư viện lâm sàng (Klinik)" : "Thư viện từ vựng (Bibliothek)"}
                    </h2>
                    {selectedModule === 1 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem', margin: 0 }}>
                        Duyệt từ gốc cực kỳ tinh giản. Nhấp để tra cứu chi tiết dạng Flashcard.
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => setRightPanelMode('worten')}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                  >
                    ✕ Đóng thư viện
                  </button>
                </div>

                {/* Search input and status filters */}
                <div className="lib-filter-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  
                  {/* Modern Search Bar */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>🔍</span>
                    <input 
                      type="text" 
                      placeholder={selectedModule === 2 
                        ? "Tìm kiếm nhanh ca bệnh, bệnh học hoặc nghĩa..." 
                        : "Tìm kiếm nhanh bằng từ tiếng Đức hoặc nghĩa tiếng Việt..."}
                      className="form-input" 
                      value={libSearchQuery}
                      onChange={(e) => setLibSearchQuery(e.target.value)}
                      style={{
                        padding: '0.4rem 1.8rem 0.4rem 2.1rem',
                        background: 'var(--bg-primary)',
                        fontSize: '0.82rem',
                        borderRadius: '6px',
                        height: '32px'
                      }}
                    />
                    {libSearchQuery && (
                      <button 
                        onClick={() => setLibSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '0.7rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Specialty Dropdown for Medicine Module */}
                  {selectedModule === 2 && (
                    <div style={{ width: '220px' }}>
                      <select 
                        className="form-select" 
                        value={libCategoryFilter}
                        onChange={(e) => setLibCategoryFilter(e.target.value)}
                        style={{ background: 'var(--bg-primary)', padding: '0.4rem 1.8rem 0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem', height: '32px', cursor: 'pointer' }}
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
                    <div style={{ width: '180px' }}>
                      <select 
                        className="form-select" 
                        value={libWordClassFilter}
                        onChange={(e) => setLibWordClassFilter(e.target.value)}
                        style={{ background: 'var(--bg-primary)', padding: '0.4rem 1.8rem 0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem', height: '32px', cursor: 'pointer' }}
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
                  <div className="status-badge-filter" style={{ background: 'var(--bg-primary)', padding: '0.15rem', borderRadius: '6px', border: '1px solid var(--glass-border)', display: 'flex', gap: '0.15rem' }}>
                    <button 
                      className={`filter-badge ${libStatusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setLibStatusFilter('all')}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      Tất cả
                    </button>
                    <button 
                      className={`filter-badge ${libStatusFilter === 'unlearned' ? 'active' : ''}`}
                      onClick={() => setLibStatusFilter('unlearned')}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      Chưa học
                    </button>
                    <button 
                      className={`filter-badge ${libStatusFilter === 'learned' ? 'active' : ''}`}
                      onClick={() => setLibStatusFilter('learned')}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      Đã học
                    </button>
                  </div>

                </div>

                {/* Alphabet filters */}
                {selectedModule === 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.2rem', whiteSpace: 'nowrap' }}>Lọc chữ cái:</span>
                    <div className="alphabet-filter" style={{ flex: 1, marginBottom: 0, paddingBottom: 0, gap: '0.2rem', display: 'flex', overflowX: 'auto' }}>
                      <button 
                        className={`letter-btn ${libLetterFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setLibLetterFilter('All')}
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem', borderRadius: '4px' }}
                      >
                        Tất cả
                      </button>
                      {alphabet.map(letter => (
                        <button 
                          key={letter} 
                          className={`letter-btn ${libLetterFilter === letter ? 'active' : ''}`}
                          onClick={() => setLibLetterFilter(letter)}
                          style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem', borderRadius: '4px' }}
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
                    marginTop: '0.1rem',
                    fontSize: '0.78rem',
                    padding: '0 0.1rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      ➕ Thêm bài lớn:
                    </span>
                    
                    <input
                      type="text"
                      placeholder="Tên bài mới..."
                      value={newLessonInputVal}
                      onChange={e => setNewLessonInputVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddNewLesson(); }}
                      style={{
                        width: '160px',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: '0.75rem',
                        outline: 'none',
                      }}
                    />

                    <select
                      value={newLessonSpecialty}
                      onChange={e => setNewLessonSpecialty(e.target.value)}
                      style={{
                        width: '130px',
                        padding: '0.3rem 0.4rem',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                        fontSize: '0.75rem',
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
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        color: '#a5b4fc',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Thêm bài
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
                                 <div key={diseaseName} style={{ marginBottom: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                                   {/* Group header — disease name */}
                                   <div 
                                     onClick={() => {
                                       if (hasCards) {
                                         setExpandedThemes(prev => ({ ...prev, [diseaseName]: !prev[diseaseName] }));
                                       }
                                     }}
                                     style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.04)', cursor: hasCards ? 'pointer' : 'default', transition: 'background 0.2s' }}
                                     className={hasCards ? "lib-group-header-hover" : ""}
                                   >
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                       {hasCards ? (
                                         <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', userSelect: 'none', width: '12px' }}>
                                           {isExpanded ? '▼' : '▶'}
                                         </span>
                                       ) : (
                                         <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.3, userSelect: 'none', width: '12px' }}>
                                           •
                                         </span>
                                       )}
                                       <span style={{ fontWeight: '700', fontSize: '0.98rem', color: 'white' }}>📖 {displayName}</span>
                                     </div>
                                     
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                       <span style={{ fontSize: '0.75rem', color: allLearned ? '#34d399' : 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                         {hasCards && (
                                           <>
                                             <span>{learnedCount}/{groupCards.length} ✓</span>
                                             <span 
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 setModalSessionCards(groupCards);
                                                 setModalStartIndex(0);
                                               }}
                                               style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.15rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                                             >
                                               Ôn tập →
                                             </span>
                                           </>
                                         )}
                                       </span>

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
                                           padding: '0.3rem 0.6rem',
                                           background: 'var(--bg-primary)',
                                           border: '1px solid var(--glass-border)',
                                           borderRadius: '8px',
                                           color: 'white',
                                           cursor: 'pointer'
                                         }}
                                       >
                                         {medicalSpecialties.map(spec => (
                                           <option key={spec} value={spec}>{spec}</option>
                                         ))}
                                       </select>

                                       {customLessons.includes(diseaseName) && (
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleDeleteCustomLesson(diseaseName, groupCards);
                                           }}
                                           style={{
                                             background: 'rgba(239, 68, 68, 0.15)',
                                             border: '1px solid rgba(239, 68, 68, 0.3)',
                                             color: '#fca5a5',
                                             padding: '0.3rem 0.6rem',
                                             borderRadius: '8px',
                                             fontSize: '0.78rem',
                                             fontWeight: '600',
                                             cursor: 'pointer',
                                             transition: 'all 0.15s'
                                           }}
                                           title="Xóa bài lớn và tất cả các thẻ của bài này"
                                         >
                                           🗑️ Xóa bài
                                         </button>
                                       )}
                                     </div>
                                   </div>

                                   {/* Expanded Cards list inside theme accordion */}
                                   {hasCards && isExpanded && (
                                     <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                                              className="library-large-card-compact"
                                              onClick={() => {
                                                setModalSessionCards(groupCards);
                                                setModalStartIndex(idx);
                                              }}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '1.2rem',
                                                padding: '0.9rem 1.2rem',
                                                margin: '0.6rem 1.2rem',
                                                borderRadius: '12px',
                                                background: card.isLearned 
                                                  ? 'rgba(16, 185, 129, 0.03)' 
                                                  : 'rgba(15, 23, 42, 0.45)',
                                                border: card.isLearned 
                                                  ? '1px solid rgba(16, 185, 129, 0.25)' 
                                                  : '1px solid rgba(255, 255, 255, 0.07)',
                                                borderLeft: `4px solid ${card.isLearned ? '#10b981' : '#6366f1'}`,
                                                cursor: 'pointer',
                                                boxShadow: card.isLearned 
                                                  ? '0 4px 12px rgba(16, 185, 129, 0.04)' 
                                                  : '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                backdropFilter: 'blur(8px)',
                                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.background = card.isLearned 
                                                  ? 'rgba(16, 185, 129, 0.08)' 
                                                  : 'rgba(99, 102, 241, 0.07)';
                                                e.currentTarget.style.borderColor = card.isLearned 
                                                  ? 'rgba(16, 185, 129, 0.45)' 
                                                  : 'rgba(99, 102, 241, 0.35)';
                                                e.currentTarget.style.boxShadow = card.isLearned 
                                                  ? '0 6px 20px rgba(16, 185, 129, 0.15)' 
                                                  : '0 6px 20px rgba(99, 102, 241, 0.15)';
                                                e.currentTarget.style.transform = 'translateY(-2px) translateX(3px)';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.background = card.isLearned 
                                                  ? 'rgba(16, 185, 129, 0.03)' 
                                                  : 'rgba(15, 23, 42, 0.45)';
                                                e.currentTarget.style.borderColor = card.isLearned 
                                                  ? 'rgba(16, 185, 129, 0.25)' 
                                                  : '1px solid rgba(255, 255, 255, 0.07)';
                                                e.currentTarget.style.boxShadow = card.isLearned 
                                                  ? '0 4px 12px rgba(16, 185, 129, 0.04)' 
                                                  : '0 4px 12px rgba(0, 0, 0, 0.15)';
                                                e.currentTarget.style.transform = 'none';
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
                                                   <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>Đã thuộc</span>
                                                 ) : (
                                                   <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>Chưa thuộc</span>
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
                                                   fontWeight: '500'
                                                 }}>
                                                   {preview}
                                                 </span>
                                               </div>
                                               
                                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
                                                 <div
                                                   onClick={(e) => { e.stopPropagation(); handleUpdateSingleCard(cardId, !card.isLearned); }}
                                                   style={{
                                                     width: '22px',
                                                     height: '22px',
                                                     borderRadius: '50%',
                                                     border: card.isLearned ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.35)',
                                                     background: card.isLearned ? '#10b981' : 'rgba(255,255,255,0.03)',
                                                     display: 'flex',
                                                     alignItems: 'center',
                                                     justifyContent: 'center',
                                                     cursor: 'pointer',
                                                     color: 'white',
                                                     fontWeight: '800',
                                                     fontSize: '0.75rem',
                                                     transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                     boxShadow: card.isLearned ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                                                   }}
                                                   onMouseEnter={(e) => {
                                                     e.currentTarget.style.transform = 'scale(1.15)';
                                                     if (!card.isLearned) {
                                                       e.currentTarget.style.borderColor = '#6366f1';
                                                       e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                                     }
                                                   }}
                                                   onMouseLeave={(e) => {
                                                     e.currentTarget.style.transform = 'scale(1)';
                                                     if (!card.isLearned) {
                                                       e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                                                       e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                     }
                                                   }}
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

                        {/* Direct Tick checkbox — FIX: use correct user-scoped localStorage key */}
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
