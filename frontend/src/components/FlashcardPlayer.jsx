import React, { useState, useEffect, useRef } from 'react';

const getFrontWord = (word, category) => {
  if (category === 'General') {
    return word.split('(')[0].split(',')[0].trim();
  }
  const lines = word.split('\n');
  const actualWord = lines.length > 1 ? lines.slice(1).join('\n') : lines[0];
  // Replace all {{c1::answer::hint}} or {{c2::answer}} with [...]
  return actualWord.replace(/\{\{c\d+::(.*?)(?::.*?)?\}\}/g, '[...]');
};

// Renders back-face word: reveals cloze answers in green capsule,
const getClozeAnswers = (word) => {
  const regex = /\{\{c\d+::(.*?)(?::.*?)?\}\}/g;
  const answers = [];
  let match;
  while ((match = regex.exec(word)) !== null) {
    const ans = match[1].trim();
    if (ans && !answers.includes(ans)) {
      answers.push(ans);
    }
  }
  return answers;
};

// with optional inline Vietnamese translation appended in parens.
const renderBackWordWithHighlights = (word, clozeTranslations) => {
  const lines = word.split('\n');
  const actualWord = lines.length > 1 ? lines.slice(1).join('\n') : lines[0];

  const regex = /\{\{c\d+::(.*?)(?::.*?)?\}\}/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(actualWord)) !== null) {
    const matchIndex = match.index;
    const answer = match[1];
    const translation = clozeTranslations ? clozeTranslations[answer] : null;

    if (matchIndex > lastIndex) {
      parts.push(actualWord.substring(lastIndex, matchIndex));
    }

    parts.push(
      <span
        key={matchIndex}
        style={{
          color: '#4ade80',
          fontWeight: 'bold',
          background: 'rgba(74, 222, 128, 0.15)',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(74, 222, 128, 0.3)',
        }}
      >
        {answer}
        {translation && (
          <span style={{ color: '#86efac', fontWeight: '400', fontSize: '0.88em', marginLeft: '4px' }}>
            ({translation})
          </span>
        )}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < actualWord.length) {
    parts.push(actualWord.substring(lastIndex));
  }

  return parts;
};

export default function FlashcardPlayer({ cards, startIndex = 0, onSaveSessionStates, onCancelSession }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastCardGraded, setLastCardGraded] = useState(false);

  const [sessionStates, setSessionStates] = useState({});
  const [gradedStates, setGradedStates] = useState({});
  const audioBtnRef = useRef(null);

  // cloze keyword → Vietnamese translation map for current card
  const [clozeTranslations, setClozeTranslations] = useState({});

  const currentCard = cards[currentIndex];

  // On card change, extract cloze answers and translate each keyword
  useEffect(() => {
    if (!currentCard || currentCard.category === 'General') {
      setClozeTranslations({});
      return;
    }

    let isMounted = true;

    const extractAndTranslateClozes = async () => {
      // Extract unique cloze answers from word field
      const regex = /\{\{c\d+::(.*?)(?::.*?)?\}\}/g;
      const clozes = [];
      let m;
      while ((m = regex.exec(currentCard.word)) !== null) {
        const answer = m[1].trim();
        if (answer && !clozes.includes(answer)) clozes.push(answer);
      }

      if (clozes.length === 0) return;

      const translateOne = async (text) => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
          const res = await fetch(url);
          if (!res.ok) return '';
          const json = await res.json();
          return json[0].map(item => item[0]).join('');
        } catch {
          return '';
        }
      };

      const results = await Promise.all(clozes.map(async (cloze) => ({ cloze, trans: await translateOne(cloze) })));
      if (!isMounted) return;

      const map = {};
      results.forEach(({ cloze, trans }) => { if (trans) map[cloze] = trans; });
      setClozeTranslations(map);
    };

    extractAndTranslateClozes();
    return () => { isMounted = false; };
  }, [currentIndex, currentCard]);

  // Keep currentIndex in sync with startIndex prop
  useEffect(() => {
    setCurrentIndex(startIndex);
    setIsFlipped(false);
  }, [startIndex]);

  // Reset lastCardGraded when card changes
  useEffect(() => {
    setLastCardGraded(false);
  }, [currentIndex]);

  // Initialise sessionStates from DB state
  useEffect(() => {
    const initialStates = {};
    cards.forEach(card => {
      const cardId = card._id || card.id;
      initialStates[cardId] = card.isLearned;
    });
    setSessionStates(initialStates);
    setGradedStates({});
  }, [cards]);

  const speakWord = (wordText) => {
    if (!wordText) return;
    window.speechSynthesis.cancel();
    const textToSpeak = wordText.split('(')[0].split(',')[0].trim();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'de-DE';
    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(v => v.lang.startsWith('de'));
    if (germanVoice) utterance.voice = germanVoice;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!currentCard) return;

      if (isFlipped && (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1')) {
        e.preventDefault();
        markLocalState(false);
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isFlipped) {
            if (currentIndex === cards.length - 1) {
              if (lastCardGraded) handleFinishAndSave();
              else markLocalState(true);
            } else {
              markLocalState(true);
            }
          } else {
            setIsFlipped(true);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (isFlipped) {
            if (currentIndex === cards.length - 1) {
              if (lastCardGraded) handleFinishAndSave();
              else markLocalState(true);
            } else {
              markLocalState(true);
            }
          } else {
            if (currentIndex === cards.length - 1) setIsFlipped(true);
            else handleNext();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'KeyR':
          e.preventDefault();
          if (currentCard.category === 'General') speakWord(currentCard.word);
          break;
        case 'Escape':
          e.preventDefault();
          onCancelSession();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, cards, lastCardGraded, sessionStates]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const markLocalState = (isLearned) => {
    if (!currentCard) return;
    const cardId = currentCard._id || currentCard.id;

    setSessionStates(prev => ({ ...prev, [cardId]: isLearned }));
    setGradedStates(prev => ({ ...prev, [cardId]: isLearned ? 'learned' : 'unlearned' }));

    if (currentIndex < cards.length - 1) {
      setTimeout(() => { handleNext(); }, 200);
    } else {
      setLastCardGraded(true);
    }
  };

  const handleFinishAndSave = () => { onSaveSessionStates(sessionStates); };

  const isCurrentCardLearned = currentCard
    ? gradedStates[currentCard._id || currentCard.id] === 'learned'
    : false;
  const isCurrentCardUnlearned = currentCard
    ? gradedStates[currentCard._id || currentCard.id] === 'unlearned'
    : false;

  if (!cards || cards.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-state-icon">📭</div>
        <h3 className="empty-state-title">Keine Karten</h3>
        <p className="empty-state-text">Không có từ vựng nào khớp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {/* Session Controls bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', width: '100%', maxWidth: '680px', alignItems: 'center' }}>
        <button
          onClick={onCancelSession}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          title="Thoát ra ngoài và hủy toàn bộ kết quả vừa ôn"
        >
          🛑 Kết thúc ôn (Hủy / ESC)
        </button>

        <button
          onClick={handleFinishAndSave}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
          }}
        >
          💾 Hoàn thành &amp; Lưu
        </button>
      </div>

      <div className="flashcard-player">

        {currentCard.category === 'General' && (
          <button
            className="card-audio-btn"
            onClick={(e) => { e.stopPropagation(); speakWord(currentCard.word); }}
            title="Phát âm từ vựng (Nhấn R)"
          >
            🔊
          </button>
        )}

        <div className={`flashcard-deck ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>

          {/* FRONT FACE */}
          <div className="card-face card-front">
            <span className="category-tag">{currentCard.category}</span>
            <div className="card-main-content">
              <h2
                className="card-word"
                style={{
                  fontSize: currentCard.category === 'General' ? '2.2rem' : '1.3rem',
                  fontWeight: '700',
                  lineHeight: '1.5',
                  whiteSpace: currentCard.category === 'General' ? 'normal' : 'pre-wrap',
                  textAlign: currentCard.category === 'General' ? 'center' : 'left',
                  width: '100%',
                  padding: '0 1rem',
                }}
              >
                {getFrontWord(currentCard.word, currentCard.category)}
              </h2>
              <p className="card-instructions" style={{ marginTop: '1rem' }}>Chạm vào thẻ hoặc ấn SPACE để xem nghĩa</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isCurrentCardLearned && (
                <span style={{ fontSize: '0.8rem', color: 'var(--status-learned)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                  ✓ Đã đánh dấu thuộc trong bài này
                </span>
              )}
            </div>
          </div>

          {/* BACK FACE */}
          <div className={`card-face card-back${currentCard.category !== 'General' ? ' card-back-clinical' : ''}`}>
            <span className="category-tag">{currentCard.category}</span>
            <div className="card-main-content" style={{ justifyContent: 'center', gap: '1rem' }}>

              {/* ── Clinical card: Cloze answers badges or translation ── */}
              {currentCard.category !== 'General' && (
                (() => {
                  const clozes = getClozeAnswers(currentCard.word);
                  if (clozes.length > 0) {
                    return (
                      <>
                        <div style={{
                          width: '100%',
                          padding: '1rem 1.2rem',
                          background: 'rgba(74, 222, 128, 0.04)',
                          borderLeft: '3px solid rgba(74, 222, 128, 0.6)',
                          borderRadius: '0 8px 8px 0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                            ✦ Đáp án
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.2rem' }}>
                            {clozes.map((ans, idx) => (
                              <span
                                key={idx}
                                style={{
                                  color: '#4ade80',
                                  fontWeight: '800',
                                  background: 'rgba(74, 222, 128, 0.15)',
                                  padding: '0.35rem 0.85rem',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(74, 222, 128, 0.3)',
                                  fontSize: '1.05rem',
                                  boxShadow: '0 0 10px rgba(74, 222, 128, 0.1)',
                                }}
                              >
                                {ans}
                                {clozeTranslations[ans] && (
                                  <span style={{ color: '#86efac', fontWeight: '400', fontSize: '0.82em', marginLeft: '6px' }}>
                                    ({clozeTranslations[ans]})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Explanation / translation for cloze card */}
                        <div style={{
                          width: '100%',
                          padding: '0.9rem 1rem 0.9rem 1.1rem',
                          background: 'rgba(99, 102, 241, 0.04)',
                          borderLeft: '3px solid rgba(129, 140, 248, 0.6)',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '0.95rem',
                          lineHeight: '1.7',
                          color: '#dde6f5',
                          whiteSpace: 'pre-wrap',
                          marginTop: '0.2rem',
                        }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem', opacity: 0.8 }}>
                            📋 Giải thích / Dịch nghĩa
                          </div>
                          <div className="card-back-translation" style={{ color: '#c8d3e8', fontSize: '0.95rem' }}>
                            {currentCard.translation}
                          </div>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <div style={{
                        width: '100%',
                        padding: '1.2rem 1.5rem',
                        background: 'rgba(74, 222, 128, 0.04)',
                        borderLeft: '4px solid rgba(74, 222, 128, 0.6)',
                        borderRadius: '0 8px 8px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                      }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                          ✦ Đáp án
                        </div>
                        <div style={{
                          color: '#4ade80',
                          fontWeight: '800',
                          fontSize: '1.25rem',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {currentCard.translation}
                        </div>
                      </div>
                    );
                  }
                })()
              )}

              {/* ── Explanation / vocab translation (General category only) ── */}
              {currentCard.category === 'General' && (
                <div
                  className="card-back-translation"
                  style={{
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#a5b4fc',
                  }}
                >
                  {currentCard.translation}
                </div>
              )}

              {/* Example sentence for General vocab cards */}
              {currentCard.category === 'General' && (
                <div className="card-example-box" onClick={(e) => e.stopPropagation()}>
                  <div className="card-example-title">Ví dụ minh họa:</div>
                  <p className="card-example-content">{currentCard.example}</p>
                </div>
              )}
            </div>

            {/* ── Action buttons ── */}
            <div className="card-back-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`btn-state ${isCurrentCardUnlearned ? 'unlearned' : ''}`}
                onClick={() => markLocalState(false)}
              >
                ✗ Chưa Thuộc
              </button>
              <button
                className={`btn-state ${isCurrentCardLearned ? 'learned' : ''}`}
                onClick={() => markLocalState(true)}
              >
                ✓ Đã Thuộc
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="player-navigation">
        <div className="nav-arrows">
          <button className="btn-nav" onClick={handlePrev} disabled={currentIndex === 0}>←</button>
          <button className="btn-nav" onClick={handleNext} disabled={currentIndex === cards.length - 1}>→</button>
        </div>
        <span className="deck-progress-text">Thẻ {currentIndex + 1} / {cards.length}</span>
      </div>

    </div>
  );
}
