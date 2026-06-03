import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, getAllCards, updateCardState, getAllLookups, addLookup, deleteLookup, addCard } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Tên model Anki — sẽ tự detect khi khởi động
let ANKI_MODEL_NAME = 'Ankiphil - Cloze'; // fallback mặc định

// Enable CORS for frontend integration
app.use(cors());
app.use(express.json());

// Initialize DB Connection
await connectDB();

// Auto-detect Anki model name khi backend khởi động
(async () => {
  try {
    const res = await fetch(ANKI_CONNECT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'modelNames', version: 6, params: {} })
    });
    const data = await res.json();
    const models = data.result || [];
    // Ưu tiên: Ankiphil - Cloze, rồi Ankiphil - iRandomizer, cuối cùng fallback Basic
    if (models.includes('Ankiphil - Cloze')) {
      ANKI_MODEL_NAME = 'Ankiphil - Cloze';
    } else if (models.find(m => m.toLowerCase().includes('basic'))) {
      ANKI_MODEL_NAME = models.find(m => m.toLowerCase().includes('basic'));
    } else if (models.length > 0) {
      ANKI_MODEL_NAME = models[0];
    }
    console.log(`Anki model detected: ${ANKI_MODEL_NAME}`);
  } catch (e) {
    console.log('Anki chưa mở, sẽ kết nối sau khi có request.');
  }
})();

// Root check API
app.get('/api/status', async (req, res) => {
  try {
    const cards = await getAllCards();
    res.json({
      status: 'online',
      totalCards: cards.length,
      database: mongoose?.connection?.readyState === 1 ? 'MongoDB' : 'JSON Fallback'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Fetch all cards
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await getAllCards();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cards', details: err.message });
  }
});

// Update card learned state
app.put('/api/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { isLearned } = req.body;
  
  if (typeof isLearned !== 'boolean') {
    return res.status(400).json({ error: 'isLearned must be a boolean' });
  }
  
  try {
    const updatedCard = await updateCardState(id, isLearned);
    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(updatedCard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update card', details: err.message });
  }
});

// =====================================================================
// ANKI INTEGRATION — proxy qua backend để tránh CORS block từ AnkiConnect
// =====================================================================

// Helper: gọi AnkiConnect REST API
async function ankiRequest(action, params = {}) {
  const res = await fetch(ANKI_CONNECT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, version: 6, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`AnkiConnect: ${data.error}`);
  return data.result;
}

// Helper: dùng Gemini chấm điểm độ đáng học (1-5), không thinking để nhanh
async function scoreCardWithGemini(word, translation, category) {
  const prompt = `Bạn là chuyên gia IMPP M2. Chấm điểm mức độ QUAN TRỌNG cần ghi nhớ để thi IMPP M2 cho thẻ y khoa sau:
Tiêu đề: "${word.substring(0, 120)}"
Nội dung: "${translation.substring(0, 200)}"
Chuyên khoa: "${category}"

Thang điểm: 1=không cần thiết, 2=ít quan trọng, 3=trung bình, 4=quan trọng, 5=cực kỳ hay thi.
Chỉ trả về JSON: {"score": <số 1-5>, "reason": "<lý do ngắn gọn tiếng Việt>"}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 120,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              score: { type: 'INTEGER' },
              reason: { type: 'STRING' }
            },
            required: ['score', 'reason']
          },
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
    }
  );
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{"score":3,"reason":"Không đánh giá được"}';
  try {
    return JSON.parse(text);
  } catch {
    return { score: 3, reason: 'Không đánh giá được' };
  }
}

// GET /api/anki/status — kiểm tra AnkiConnect có đang chạy không
app.get('/api/anki/status', async (req, res) => {
  try {
    const version = await ankiRequest('version');
    res.json({ connected: true, version });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// POST /api/anki/add — thêm card vào Anki thông minh
// Body: { word, translation, category, deckName?, forceAdd? }
app.post('/api/anki/add', async (req, res) => {
  const { word, translation, category, deckName, forceAdd = false } = req.body;

  if (!word || !translation) {
    return res.status(400).json({ error: 'Thiếu word hoặc translation' });
  }

  // Tên deck chuẩn: Toibingu::Y Khoa::<category>
  const safeDeck = deckName
    || `Toibingu::Y Khoa::${(category || 'Chung').replace(/[<>:"/\\|?*]/g, '_')}`;

  try {
    // 1. Kiểm tra AnkiConnect sống không
    await ankiRequest('version');

    // 2. Chấm điểm Gemini (bỏ qua nếu forceAdd = true)
    let score = 5;
    let reason = 'Thêm thủ công';
    if (!forceAdd) {
      const scored = await scoreCardWithGemini(word, translation, category || '');
      score = scored.score;
      reason = scored.reason;
      if (score < 3) {
        return res.json({
          added: false,
          skipped: true,
          score,
          reason: `Điểm IMPP: ${score}/5 — ${reason}`
        });
      }
    }

    // 3. Tạo deck nếu chưa có (AnkiConnect tự xử lý nested :: syntax)
    await ankiRequest('createDeck', { deck: safeDeck });

    // 4. Kiểm tra trùng lặp theo nội dung front
    const searchKey = word.substring(0, 80).replace(/"/g, '\\"').replace(/\n/g, ' ');
    const existingNotes = await ankiRequest('findNotes', {
      query: `deck:"${safeDeck}" front:"${searchKey}"`
    });

    if (existingNotes && existingNotes.length > 0) {
      return res.json({
        added: false,
        duplicate: true,
        score,
        reason: `Đã có trong Anki (deck: ${safeDeck.replace(/:/g, ' › ')})`
      });
    }

    // 5. Format card theo kiểu Ankiphil - Cloze
    // Front (Text): câu hỏi với đáp án ẩn dưới {{c1::...}}
    // Back (Extra): giải thích đầy đủ bằng tiếng Việt
    const questionLine = word.split('\n').map(l => l.trim()).filter(Boolean)[1]
      || word.split('\n')[0]
      || word;
    const answerLine = translation.split('\n')[0].trim();
    const extraLines = translation.split('\n').slice(1).join('<br>').trim();

    // Cấu trúc Cloze: câu hỏi... {{c1::trả lời chính}}
    const clozeText = `${questionLine} {{c1::${answerLine}}}`;
    const extraHtml = [
      extraLines ? extraLines : '',
      `<hr><small style="color:#888">📚 ${safeDeck.replace(/::/g, ' › ')} &nbsp;|&nbsp; ⭐ IMPP ${score}/5 &nbsp;|&nbsp; 🤖 ${reason}</small>`
    ].filter(Boolean).join('<br>');

    const noteId = await ankiRequest('addNote', {
      note: {
        deckName: safeDeck,
        modelName: ANKI_MODEL_NAME,
        fields: {
          Text: clozeText,
          Extra: extraHtml
        },
        tags: [
          'toibingu',
          'impp-m2',
          (category || 'chung').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-äöü]/g, '')
        ]
      }
    });

    res.json({ added: true, noteId, score, reason, deck: safeDeck, model: ANKI_MODEL_NAME });

  } catch (err) {
    const isAnkiOffline = err.message.includes('ECONNREFUSED')
      || err.message.includes('fetch failed')
      || err.message.includes('Failed to fetch')
      || err.message.includes('connect ECONNREFUSED');

    if (isAnkiOffline) {
      return res.status(503).json({
        error: 'Anki chưa mở hoặc chưa cài AnkiConnect. Vui lòng mở Anki trước.',
        ankiOffline: true
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// ECOSYSTEM INTEGRATION — MEDDE LOOKUP HISTORY & Hub
// =====================================================================

// POST /api/ecosystem/lookup — nhận lịch sử tra từ từ MedDE Extension
app.post('/api/ecosystem/lookup', async (req, res) => {
  const { word, german, translation, context, type } = req.body;
  if (!word || !german || !translation || !type) {
    return res.status(400).json({ error: 'Thiếu các trường bắt buộc (word, german, translation, type)' });
  }

  try {
    const saved = await addLookup({
      word,
      german,
      translation,
      context: context || '',
      type,
      timestamp: new Date()
    });
    res.status(201).json({ success: true, lookup: saved });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lưu lịch sử tra cứu', details: err.message });
  }
});

// GET /api/ecosystem/history — lấy danh sách lịch sử tra cứu
app.get('/api/ecosystem/history', async (req, res) => {
  try {
    const history = await getAllLookups();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải lịch sử tra cứu', details: err.message });
  }
});

// DELETE /api/ecosystem/history/:id — xóa mục lịch sử tra cứu
app.delete('/api/ecosystem/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteLookup(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Không tìm thấy mục cần xóa' });
    }
    res.json({ success: true, message: 'Đã xóa mục lịch sử tra cứu' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa mục lịch sử', details: err.message });
  }
});

// POST /api/ecosystem/import-card — chuyển đổi lookup thành card Toibingu chính thức
app.post('/api/ecosystem/import-card', async (req, res) => {
  const { word, translation, example, category, module } = req.body;
  if (!word || !translation || !category || typeof module !== 'number') {
    return res.status(400).json({ error: 'Thiếu thông tin tạo card (word, translation, category, module)' });
  }

  try {
    const savedCard = await addCard({
      word,
      translation,
      example: example || '',
      category,
      module,
      isLearned: false
    });
    res.status(201).json({ success: true, card: savedCard });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tạo card học tập', details: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
