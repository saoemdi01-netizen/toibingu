import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function LightningDecksView() {
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  
  // Modal states
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [deckNameInput, setDeckNameInput] = useState('');
  
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardType, setCardType] = useState('basic');
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [editingCardId, setEditingCardId] = useState(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setLoadingDecks(true);
    try {
      const res = await fetch(`${API_BASE}/decks`);
      const data = await res.json();
      setDecks(data.decks || []);
    } catch (e) {
      console.error('Failed to load decks:', e);
    } finally {
      setLoadingDecks(false);
    }
  };

  const selectDeck = async (deckId) => {
    setSelectedDeckId(deckId);
    setLoadingCards(true);
    try {
      const res = await fetch(`${API_BASE}/cards/${deckId}`);
      const data = await res.json();
      setCards(data.cards || []);
    } catch (e) {
      console.error('Failed to load cards:', e);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCreateDeck = async () => {
    const name = deckNameInput.trim();
    if (!name) return alert('Vui lòng nhập tên bài học!');

    try {
      const res = await fetch(`${API_BASE}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success) {
        setShowDeckModal(false);
        setDeckNameInput('');
        await loadDecks();
        selectDeck(data.deck.id);
      } else {
        alert(data.error || 'Có lỗi xảy ra.');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ!');
    }
  };

  const handleDeleteDeck = async (deckId, e) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này và toàn bộ các thẻ của nó?')) return;
    try {
      await fetch(`${API_BASE}/decks/${deckId}`, { method: 'DELETE' });
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
        setCards([]);
      }
      await loadDecks();
    } catch (e) {
      alert('Lỗi xóa bài học!');
    }
  };

  const handleOpenAddCard = () => {
    setEditingCardId(null);
    setCardFront('');
    setCardBack('');
    setCardType('basic');
    setShowCardModal(true);
  };

  const handleOpenEditCard = (card, e) => {
    e.stopPropagation();
    setEditingCardId(card.id || card._id);
    setCardFront(card.front);
    setCardBack(card.back);
    setCardType(card.type || 'basic');
    setShowCardModal(true);
  };

  const handleCreateOrUpdateCard = async () => {
    const front = cardFront.trim();
    const back = cardBack.trim();

    if (!front || !back) return alert('Vui lòng điền đầy đủ thông tin mặt trước và mặt sau!');

    const url = editingCardId ? `${API_BASE}/cards/${editingCardId}` : `${API_BASE}/cards`;
    const method = editingCardId ? 'PUT' : 'POST';
    const body = editingCardId 
      ? { front, back, type: cardType }
      : { cards: [{ front, back, type: cardType }], deckId: selectedDeckId };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setShowCardModal(false);
        await selectDeck(selectedDeckId);
      }
    } catch (e) {
      alert('Lỗi lưu thẻ!');
    }
  };

  const handleDeleteCard = async (cardId, e) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    try {
      await fetch(`${API_BASE}/cards/${cardId}`, { method: 'DELETE' });
      await selectDeck(selectedDeckId);
    } catch (e) {
      alert('Lỗi xóa thẻ!');
    }
  };

  const handleExportCSV = () => {
    if (cards.length === 0) return alert('Bài học này chưa có thẻ nào để xuất!');

    let csvContent = "front\tback\ttags\n";
    cards.forEach(card => {
      const front = card.front.replace(/\t/g, " ").replace(/\n/g, "<br>");
      const back = card.back.replace(/\t/g, " ").replace(/\n/g, "<br>");
      csvContent += `${front}\t${back}\tIMPP-M2\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const activeDeck = decks.find(d => d.id === selectedDeckId);
    const fileName = activeDeck ? `Lightning_${activeDeck.name}.csv` : 'Lightning_Deck.csv';
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeDeck = decks.find(d => d.id === selectedDeckId);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-secondary)', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Sidebar trái: Decks */}
      <div style={{ width: '280px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', background: 'rgba(0, 0, 0, 0.15)', flexShrink: 0 }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>⚡ Danh sách Bài học</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem' }}>
          {loadingDecks ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>Đang tải...</p>
          ) : decks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>Chưa có bài học nào.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {decks.map(deck => (
                <div 
                  key={deck.id}
                  onClick={() => selectDeck(deck.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: selectedDeckId === deck.id ? 'var(--accent-active-glow)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1.5px solid',
                    borderColor: selectedDeckId === deck.id ? 'var(--accent-active-color)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: selectedDeckId === deck.id ? 'white' : 'var(--text-secondary)', fontWeight: selectedDeckId === deck.id ? '600' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                    {deck.name}
                  </span>
                  <button 
                    onClick={(e) => handleDeleteDeck(deck.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.9rem', color: '#fca5a5' }}
                    title="Xóa bài học"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setShowDeckModal(true)}
            style={{ width: '100%', padding: '0.75rem', background: 'var(--accent-active-color)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            ➕ Tạo bài học mới
          </button>
        </div>
      </div>

      {/* Vùng chính: Cards Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedDeckId ? (
          <>
            <div style={{ padding: '1.2rem 2rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>{activeDeck?.name}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cards.length} thẻ học tập</p>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button 
                  onClick={handleOpenAddCard}
                  style={{ background: 'var(--accent-active-color)', border: 'none', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                >
                  ➕ Thêm thẻ
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              {loadingCards ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '4rem' }}>Đang tải danh sách thẻ...</p>
              ) : cards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Bài học này chưa có thẻ nào.</p>
                  <p style={{ fontSize: '0.85rem' }}>Hãy bấm "Thêm thẻ" ở góc trên bên phải hoặc dùng Extension trên trình duyệt để thêm thẻ tự động!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                  {cards.map(card => {
                    const id = card.id || card._id;
                    return (
                      <FlipCard 
                        key={id} 
                        card={card} 
                        onEdit={(e) => handleOpenEditCard(card, e)}
                        onDelete={(e) => handleDeleteCard(id, e)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
            <span style={{ fontSize: '4rem' }}>⚡</span>
            <h3>Hệ sinh thái Lightning</h3>
            <p style={{ fontSize: '0.85rem', maxWidth: '400px', textAlign: 'center' }}>
              Hãy chọn bài học ở thanh bên trái, hoặc dùng tính năng <strong>📚 Tạo Card</strong> của Lightning Chrome Extension trên Amboss để tự động tạo bộ thẻ tại đây.
            </p>
          </div>
        )}
      </div>

      {/* --- DECK MODAL --- */}
      {showDeckModal && (
        <ModalWrapper onClose={() => setShowDeckModal(false)}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', color: 'white' }}>Tạo bài học mới</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TÊN BÀI HỌC (DECK)</label>
            <input 
              type="text" 
              value={deckNameInput}
              onChange={(e) => setDeckNameInput(e.target.value)}
              placeholder="Ví dụ: Phổi học - Pneumonie"
              style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
            <button onClick={() => setShowDeckModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
            <button onClick={handleCreateDeck} style={{ background: 'var(--accent-active-color)', border: 'none', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Lưu</button>
          </div>
        </ModalWrapper>
      )}

      {/* --- CARD MODAL --- */}
      {showCardModal && (
        <ModalWrapper onClose={() => setShowCardModal(false)}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', color: 'white' }}>
            {editingCardId ? 'Chỉnh sửa thẻ' : 'Thêm thẻ flashcard'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>LOẠI THẺ</label>
              <select 
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="basic">📗 Basic (Mặt trước / Mặt sau)</option>
                <option value="cloze">📘 Cloze (Điền chỗ trống)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {cardType === 'cloze' ? 'CÂU ĐIỀN CHỖ TRỐNG (FRONT)' : 'MẶT TRƯỚC (FRONT)'}
              </label>
              <textarea 
                rows="3"
                value={cardFront}
                onChange={(e) => setCardFront(e.target.value)}
                placeholder={cardType === 'cloze' ? 'Ví dụ: Bei der [___] ist die Pumpfunktion des Herzens vermindert.' : 'Ví dụ: Herzinsuffizienz'}
                style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {cardType === 'cloze' ? 'TỪ BỊ ẨN + GIẢI THÍCH (BACK)' : 'MẶT SAU (BACK)'}
              </label>
              <textarea 
                rows="4"
                value={cardBack}
                onChange={(e) => setCardBack(e.target.value)}
                placeholder={cardType === 'cloze' ? 'Ví dụ: Herzinsuffizienz — suy tim' : 'Ví dụ: Suy tim — tình trạng giảm chức năng bơm máu'}
                style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
            <button onClick={() => setShowCardModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
            <button onClick={handleCreateOrUpdateCard} style={{ background: 'var(--accent-active-color)', border: 'none', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Lưu thẻ</button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

// Flip Card helper component with local state
function FlipCard({ card, onEdit, onDelete }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: '1000px',
        height: '190px',
        cursor: 'pointer'
      }}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'none'
        }}
      >
        {/* Mặt trước */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: '14px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <span style={{
            alignSelf: 'flex-start',
            fontSize: '9px',
            fontWeight: '700',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '20px',
            background: card.type === 'cloze' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: card.type === 'cloze' ? '#60a5fa' : '#10b981'
          }}>
            {card.type === 'cloze' ? '📘 Cloze' : '📗 Basic'}
          </span>
          <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'white', lineHeight: '1.5', margin: 'auto 0', overflowY: 'auto', maxHeight: '85px', textAlign: 'center' }}>
            {card.front}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.4rem' }}>
            <button onClick={(e) => onEdit(e)} style={{ border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>Sửa</button>
            <button onClick={(e) => onDelete(e)} style={{ border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.05)' }}>Xóa</button>
          </div>
        </div>

        {/* Mặt sau */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: '14px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1a2235',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transform: 'rotateY(180deg)'
        }}>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Mặt sau</span>
          <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0', lineHeight: '1.5', margin: 'auto 0', overflowY: 'auto', maxHeight: '100px', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
            {card.back}
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)', textAlign: 'right' }}>Click để lật lại</div>
        </div>
      </div>
    </div>
  );
}

// Modal wrapper layout helper
function ModalWrapper({ children, onClose }) {
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 6, 12, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '480px',
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--glass-border)',
          borderRadius: '20px',
          padding: '1.8rem 1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.4rem' }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
