import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, getAllCards, updateCardState } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());
app.use(express.json());

// Initialize DB Connection
await connectDB();

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

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
