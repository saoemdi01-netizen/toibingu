import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, Save, ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';

const getFrontWord = (word, category) => {
  if (category === 'General') {
    return word.split('(')[0].split(',')[0].trim();
  }
  const lines = word.split('\n');
  const actualWord = lines.length > 1 ? lines.slice(1).join('\n') : lines[0];
  return actualWord.replace(/\{\{c\d+::(.*?)(?::.*?)?\}\}/g, '[...]');
};

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

export default function FlashcardPlayer({ cards, startIndex = 0, onSaveSessionStates, onCancelSession }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastCardGraded, setLastCardGraded] = useState(false);

  const [sessionStates, setSessionStates] = useState({});
  const [gradedStates, setGradedStates] = useState({});
  const audioBtnRef = useRef(null);
  const [clozeTranslations, setClozeTranslations] = useState({});

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (!currentCard || currentCard.category === 'General') {
      setClozeTranslations({});
      return;
    }

    let isMounted = true;

    const extractAndTranslateClozes = async () => {
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

  useEffect(() => {
    setCurrentIndex(startIndex);
    setIsFlipped(false);
  }, [startIndex]);

  useEffect(() => {
    setLastCardGraded(false);
  }, [currentIndex]);

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
        <p className="empty-state-text">Không có từ vựng nào khớp với bộ lọc của bạn.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* Session Controls bar */}
      <div className="flex justify-between items-center w-full max-w-[680px] mb-5 gap-4">
        <button
          onClick={onCancelSession}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 text-red-400 hover:text-red-300 font-semibold text-xs active:scale-[0.98] transition-all duration-200 cursor-pointer"
          title="Thoát ra ngoài và hủy toàn bộ kết quả vừa ôn"
        >
          <X className="w-4.5 h-4.5" />
          <span>KẾT THÚC ÔN (ESC)</span>
        </button>

        <button
          onClick={handleFinishAndSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-stone-200"
        >
          <Save className="w-4.5 h-4.5 text-stone-900" />
          <span>HOÀN THÀNH & LƯU</span>
        </button>
      </div>

      {/* Laser progress indicator */}
      <div className="w-full max-w-[680px] h-1.5 bg-stone-900/80 border border-stone-850 rounded-full overflow-hidden relative mb-6">
        <div 
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_#10b981] transition-all duration-300 ease-out" 
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} 
        />
      </div>

      {/* Flashcard Player Box */}
      <div className="flashcard-player relative">
        {currentCard.category === 'General' && (
          <button
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-stone-900/60 backdrop-blur-md border border-stone-800/80 text-stone-400 hover:text-white hover:border-stone-700 hover:scale-105 active:scale-[0.97] transition-all duration-250 flex items-center justify-center cursor-pointer shadow-lg"
            onClick={(e) => { e.stopPropagation(); speakWord(currentCard.word); }}
            title="Phát âm từ vựng (Nhấn R)"
          >
            <Volume2 className="w-4.5 h-4.5" />
          </button>
        )}

        <div className={`flashcard-deck ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
          
          {/* FRONT FACE */}
          <div className="card-face card-front relative flex flex-col justify-between p-8">
            <span className="category-tag self-start">{currentCard.category}</span>
            
            <div className="card-main-content w-full flex flex-col items-center justify-center text-center my-auto">
              <h2
                className="card-word font-display font-medium tracking-tight text-white leading-tight"
                style={{
                  fontSize: currentCard.category === 'General' ? '2.5rem' : '1.45rem',
                  whiteSpace: currentCard.category === 'General' ? 'normal' : 'pre-wrap',
                  textAlign: currentCard.category === 'General' ? 'center' : 'left',
                  width: '100%',
                }}
              >
                {getFrontWord(currentCard.word, currentCard.category)}
              </h2>
              <span className="text-[10px] text-stone-500 font-mono tracking-widest uppercase mt-6 block">
                [ Click thẻ hoặc nhấn Space để dịch ]
              </span>
            </div>
            
            <div className="flex justify-center h-6">
              {isCurrentCardLearned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  ✓ Đã thuộc
                </span>
              )}
            </div>
          </div>

          {/* BACK FACE */}
          <div className={`card-face card-back ${currentCard.category !== 'General' ? 'card-back-clinical' : ''} relative flex flex-col justify-between p-8`}>
            <span className="category-tag self-start">{currentCard.category}</span>
            
            <div className="card-main-content flex-1 w-full flex flex-col justify-center gap-4 my-auto overflow-y-auto no-scrollbar pr-1">
              
              {/* Clinical Card details */}
              {currentCard.category !== 'General' && (
                (() => {
                  const clozes = getClozeAnswers(currentCard.word);
                  if (clozes.length > 0) {
                    return (
                      <>
                        {/* Answers block */}
                        <div className="w-full p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 border-l-3 border-l-emerald-500 flex flex-col gap-2.5 text-left">
                          <div className="text-[9px] font-bold text-emerald-400 tracking-[0.15em] uppercase flex items-center gap-1.5 opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ✦ ĐÁP ÁN ĐÃ GIẢI MÃ
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {clozes.map((ans, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-lg shadow-sm"
                              >
                                {ans}
                                {clozeTranslations[ans] && (
                                  <span className="text-[10px] font-normal text-emerald-300 ml-1.5 font-sans opacity-90">
                                    ({clozeTranslations[ans]})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Translation block */}
                        <div className="w-full p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 border-l-3 border-l-indigo-500 flex flex-col gap-2 text-left">
                          <div className="text-[9px] font-bold text-indigo-300 tracking-[0.15em] uppercase flex items-center gap-1.5 opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            📋 PHÂN TÍCH CA LÂM SÀNG
                          </div>
                          <p className="text-xs text-stone-300 leading-relaxed font-light font-sans whitespace-pre-wrap">
                            {currentCard.translation}
                          </p>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <div className="w-full p-5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 border-l-3 border-l-emerald-500 flex flex-col gap-2 text-left">
                        <div className="text-[9px] font-bold text-emerald-400 tracking-[0.15em] uppercase opacity-80">
                          ✦ ĐÁP ÁN Y KHOA
                        </div>
                        <p className="text-sm font-semibold text-emerald-400 whitespace-pre-wrap leading-relaxed">
                          {currentCard.translation}
                        </p>
                      </div>
                    );
                  }
                })()
              )}

              {/* General Card details */}
              {currentCard.category === 'General' && (
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight text-indigo-300 font-display">
                    {currentCard.translation}
                  </h3>
                  
                  {currentCard.example && (
                    <div className="card-example-box w-full max-w-[90%] mx-auto p-4 rounded-xl border border-stone-800 bg-stone-950/50 border-l-3 border-l-indigo-500 text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="text-[9px] font-bold text-stone-500 tracking-[0.15em] uppercase mb-1.5">VÍ DỤ MINH HỌA</div>
                      <p className="text-xs text-stone-300 font-light italic leading-relaxed font-sans">{currentCard.example}</p>
                      {currentCard.exampleTranslation && (
                        <p className="text-xs text-stone-400/80 font-light mt-2 border-t border-stone-900/50 pt-2 font-sans">{currentCard.exampleTranslation}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Action buttons footer */}
            <div className="card-back-actions flex gap-3 border-t border-stone-900/60 pt-4 mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                className={`flex-1 h-10 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isCurrentCardUnlearned 
                    ? "bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                    : "bg-stone-900/45 border border-stone-850 hover:border-red-900/40 hover:bg-red-950/10 hover:text-red-400 text-stone-400"
                }`}
                onClick={() => markLocalState(false)}
              >
                ✗ Chưa Thuộc
              </button>
              
              <button
                className={`flex-1 h-10 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isCurrentCardLearned 
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                    : "bg-stone-900/45 border border-stone-850 hover:border-emerald-900/40 hover:bg-emerald-950/10 hover:text-emerald-400 text-stone-400"
                }`}
                onClick={() => markLocalState(true)}
              >
                ✓ Đã Thuộc
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Footer */}
      <div className="player-navigation flex justify-between items-center w-full max-w-[680px] mt-6 gap-4">
        <div className="nav-arrows flex gap-2">
          <button 
            className="w-11 h-11 rounded-full border border-stone-800 bg-stone-950/40 text-stone-400 hover:text-white hover:border-stone-700 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed" 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          
          <button 
            className="w-11 h-11 rounded-full border border-stone-800 bg-stone-950/40 text-stone-400 hover:text-white hover:border-stone-700 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed" 
            onClick={handleNext} 
            disabled={currentIndex === cards.length - 1}
          >
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
        
        <span className="deck-progress-text font-mono text-xs text-stone-500 font-semibold tracking-tight">
          THẺ {currentIndex + 1} / {cards.length}
        </span>
      </div>

    </div>
  );
}
