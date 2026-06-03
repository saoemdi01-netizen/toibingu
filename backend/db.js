import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DB_PATH = path.join(__dirname, 'data', 'db_fallback.json');
const FALLBACK_LOOKUP_PATH = path.join(__dirname, 'data', 'lookup_fallback.json');

// Mongoose schema definition
const CardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  example: { type: String, required: true },
  category: { type: String, required: true }, // e.g. "General", "Innere Medizin", etc.
  module: { type: Number, required: true },
  isLearned: { type: Boolean, default: false }
});

const CardModel = mongoose.model('Card', CardSchema);

const LookupSchema = new mongoose.Schema({
  word: { type: String, required: true },
  german: { type: String, required: true },
  translation: { type: mongoose.Schema.Types.Mixed, required: true },
  context: { type: String },
  type: { type: String, required: true }, // 'quick' | 'deep'
  timestamp: { type: Date, default: Date.now }
});

const LookupModel = mongoose.model('Lookup', LookupSchema);

let isMongoDBConnected = false;

// Initialize standard fallback file structure
function ensureFallbackDirectory() {
  const dir = path.dirname(FALLBACK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(FALLBACK_LOOKUP_PATH)) {
    fs.writeFileSync(FALLBACK_LOOKUP_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ankicard';
  console.log(`Attempting to connect to MongoDB at: ${mongoUri}`);
  
  try {
    // 3 seconds timeout to fail fast and fallback
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoDBConnected = true;
    console.log('MongoDB successfully connected.');
  } catch (error) {
    console.warn('MongoDB connection failed. Switching to JSON local file fallback database.');
    isMongoDBConnected = false;
    ensureFallbackDirectory();
  }
}

export async function getAllCards() {
  if (isMongoDBConnected) {
    try {
      return await CardModel.find({});
    } catch (err) {
      console.error('MongoDB read error, falling back to JSON file:', err);
    }
  }
  
  // JSON Fallback DB Read
  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function updateCardState(id, isLearned) {
  if (isMongoDBConnected) {
    try {
      const updated = await CardModel.findByIdAndUpdate(id, { isLearned }, { new: true });
      if (updated) return updated;
    } catch (err) {
      console.error('MongoDB update error, falling back to JSON file:', err);
    }
  }

  // JSON Fallback DB Update
  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
  const cards = JSON.parse(data);
  const cardIndex = cards.findIndex(c => c._id === id || c.id === id);
  if (cardIndex !== -1) {
    cards[cardIndex].isLearned = isLearned;
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(cards, null, 2), 'utf-8');
    return cards[cardIndex];
  }
  return null;
}

export async function seedDatabase(cardsData) {
  if (isMongoDBConnected) {
    try {
      await CardModel.deleteMany({});
      const seeded = await CardModel.insertMany(cardsData);
      console.log(`Seeded ${seeded.length} cards to MongoDB successfully.`);
      return true;
    } catch (err) {
      console.error('MongoDB seeding failed, writing seed data to JSON fallback:', err);
    }
  }

  // JSON Fallback DB Seeding
  ensureFallbackDirectory();
  // Generate random IDs for the fallback data to resemble MongoDB ObjectIDs
  const processedCards = cardsData.map((c, index) => ({
    _id: `fallback_id_${Date.now()}_${index}`,
    ...c,
    isLearned: c.isLearned || false
  }));
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(processedCards, null, 2), 'utf-8');
  console.log(`Seeded ${processedCards.length} cards to local JSON fallback database.`);
  return true;
}

export async function getAllLookups() {
  if (isMongoDBConnected) {
    try {
      return await LookupModel.find({}).sort({ timestamp: -1 });
    } catch (err) {
      console.error('MongoDB read lookup error, falling back to JSON file:', err);
    }
  }
  
  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_LOOKUP_PATH, 'utf-8');
  const lookups = JSON.parse(data);
  return lookups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function addLookup(lookupData) {
  if (isMongoDBConnected) {
    try {
      const newLookup = new LookupModel(lookupData);
      return await newLookup.save();
    } catch (err) {
      console.error('MongoDB write lookup error, falling back to JSON file:', err);
    }
  }

  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_LOOKUP_PATH, 'utf-8');
  const lookups = JSON.parse(data);
  const newLookup = {
    _id: `lookup_id_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...lookupData,
    timestamp: lookupData.timestamp || new Date().toISOString()
  };
  lookups.push(newLookup);
  fs.writeFileSync(FALLBACK_LOOKUP_PATH, JSON.stringify(lookups, null, 2), 'utf-8');
  return newLookup;
}

export async function deleteLookup(id) {
  if (isMongoDBConnected) {
    try {
      return await LookupModel.findByIdAndDelete(id);
    } catch (err) {
      console.error('MongoDB delete lookup error, falling back to JSON file:', err);
    }
  }

  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_LOOKUP_PATH, 'utf-8');
  const lookups = JSON.parse(data);
  const filtered = lookups.filter(l => l._id !== id && l.id !== id);
  if (lookups.length !== filtered.length) {
    fs.writeFileSync(FALLBACK_LOOKUP_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return null;
}

export async function addCard(cardData) {
  if (isMongoDBConnected) {
    try {
      const card = new CardModel(cardData);
      return await card.save();
    } catch (err) {
      console.error('MongoDB add card error, falling back to JSON file:', err);
    }
  }

  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
  const cards = JSON.parse(data);
  const newCard = {
    _id: `fallback_id_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...cardData,
    isLearned: cardData.isLearned || false
  };
  cards.push(newCard);
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(cards, null, 2), 'utf-8');
  return newCard;
}
