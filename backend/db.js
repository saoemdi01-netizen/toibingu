import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DB_PATH = path.join(__dirname, 'data', 'db_fallback.json');
const FALLBACK_LOOKUP_PATH = path.join(__dirname, 'data', 'lookup_fallback.json');
const FALLBACK_LIGHTNING_PATH = path.join(__dirname, 'data', 'lightning_db.json');

// Mongoose schema definition for Cards (Toibingu primary)
const CardSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  example: { type: String, required: true },
  exampleTranslation: { type: String }, // Vietnamese translation of the example sentence
  category: { type: String, required: true }, // e.g. "General", "Innere Medizin", etc.
  module: { type: Number, required: true },
  isLearned: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true }
});
const CardModel = mongoose.model('Card', CardSchema);

// Lookup History Schema
const LookupSchema = new mongoose.Schema({
  word: { type: String, required: true },
  german: { type: String, required: true },
  translation: { type: mongoose.Schema.Types.Mixed, required: true },
  context: { type: String },
  type: { type: String, required: true }, // 'quick' | 'deep'
  timestamp: { type: Date, default: Date.now }
});
const LookupModel = mongoose.model('Lookup', LookupSchema);

// Lightning Decks & Cards Schema
const DeckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const DeckModel = mongoose.model('Deck', DeckSchema);

const LightningCardSchema = new mongoose.Schema({
  deckId: { type: String, required: true },
  type: { type: String, required: true }, // 'basic' | 'cloze'
  front: { type: String, required: true },
  back: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const LightningCardModel = mongoose.model('LightningCard', LightningCardSchema);

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
  if (!fs.existsSync(FALLBACK_LIGHTNING_PATH)) {
    fs.writeFileSync(FALLBACK_LIGHTNING_PATH, JSON.stringify({ decks: [], cards: [] }, null, 2), 'utf-8');
  }
}

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ankicard';
  console.log(`Attempting to connect to MongoDB at: ${mongoUri}`);
  
  try {
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
  ensureFallbackDirectory();
  const processedCards = cardsData.map((c, index) => ({
    _id: `fallback_id_${Date.now()}_${index}`,
    ...c,
    isLearned: c.isLearned || false
  }));
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(processedCards, null, 2), 'utf-8');
  console.log(`Seeded ${processedCards.length} cards to local JSON fallback database.`);
  return true;
}

// Lookup History Functions
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
      const card = new CardModel({
        isPublished: cardData.isPublished !== undefined ? cardData.isPublished : false,
        ...cardData
      });
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
    isPublished: cardData.isPublished !== undefined ? cardData.isPublished : false,
    ...cardData,
    isLearned: cardData.isLearned || false
  };
  cards.push(newCard);
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(cards, null, 2), 'utf-8');
  return newCard;
}

export async function updateCardFields(id, updateData) {
  if (isMongoDBConnected) {
    try {
      const updated = await CardModel.findByIdAndUpdate(id, updateData, { new: true });
      if (updated) return updated;
    } catch (err) {
      console.error('MongoDB update card fields error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
  const cards = JSON.parse(data);
  const cardIndex = cards.findIndex(c => c._id === id || c.id === id);
  if (cardIndex !== -1) {
    Object.assign(cards[cardIndex], updateData);
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(cards, null, 2), 'utf-8');
    return cards[cardIndex];
  }
  return null;
}

export async function deleteCard(id) {
  if (isMongoDBConnected) {
    try {
      const deleted = await CardModel.findByIdAndDelete(id);
      if (deleted) return true;
    } catch (err) {
      console.error('MongoDB delete card error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
  const cards = JSON.parse(data);
  const filtered = cards.filter(c => c._id !== id && c.id !== id);
  if (cards.length !== filtered.length) {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}

// Lightning Decks Functions
export async function getLightningDecks() {
  if (isMongoDBConnected) {
    try {
      const dbDecks = await DeckModel.find({});
      return dbDecks.map(d => ({ id: d._id.toString(), name: d.name, createdAt: d.createdAt }));
    } catch (err) {
      console.error('MongoDB read decks error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const data = fs.readFileSync(FALLBACK_LIGHTNING_PATH, 'utf-8');
  return JSON.parse(data).decks;
}

export async function addLightningDeck(name) {
  if (isMongoDBConnected) {
    try {
      const newDeck = new DeckModel({ name });
      const saved = await newDeck.save();
      return { id: saved._id.toString(), name: saved.name, createdAt: saved.createdAt };
    } catch (err) {
      console.error('MongoDB write deck error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const fileData = JSON.parse(fs.readFileSync(FALLBACK_LIGHTNING_PATH, 'utf-8'));
  const newDeck = {
    id: Date.now().toString(),
    name: name,
    createdAt: new Date().toISOString()
  };
  fileData.decks.push(newDeck);
  fs.writeFileSync(FALLBACK_LIGHTNING_PATH, JSON.stringify(fileData, null, 2), 'utf-8');
  return newDeck;
}

export async function deleteLightningDeck(deckId) {
  if (isMongoDBConnected) {
    try {
      await DeckModel.findByIdAndDelete(deckId);
      await LightningCardModel.deleteMany({ deckId });
      return true;
    } catch (err) {
      console.error('MongoDB delete deck error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const fileData = JSON.parse(fs.readFileSync(FALLBACK_LIGHTNING_PATH, 'utf-8'));
  fileData.decks = fileData.decks.filter(d => d.id !== deckId);
  fileData.cards = fileData.cards.filter(c => c.deckId !== deckId);
  fs.writeFileSync(FALLBACK_LIGHTNING_PATH, JSON.stringify(fileData, null, 2), 'utf-8');
  return true;
}

// Lightning Cards Functions
export async function getLightningCards(deckId) {
  if (isMongoDBConnected) {
    try {
      const dbCards = await LightningCardModel.find({ deckId });
      return dbCards.map(c => ({ id: c._id.toString(), deckId: c.deckId, type: c.type, front: c.front, back: c.back, createdAt: c.createdAt }));
    } catch (err) {
      console.error('MongoDB read cards error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const fileData = JSON.parse(fs.readFileSync(FALLBACK_LIGHTNING_PATH, 'utf-8'));
  return fileData.cards.filter(c => c.deckId === deckId);
}

export async function addLightningCards(cards, deckId, deckName) {
  let targetDeckId = deckId;
  
  if (!targetDeckId || targetDeckId === '__new__' || targetDeckId.startsWith('__new___') || targetDeckId.startsWith('__new__:')) {
    let name = deckName || 'Bài học mặc định';
    if (targetDeckId && targetDeckId.startsWith('__new__信号:')) {
      name = targetDeckId.replace('__new__信号:', '');
    } else if (targetDeckId && targetDeckId.startsWith('__new__:')) {
      name = targetDeckId.replace('__new__:', '');
    }
    
    const existingDecks = await getLightningDecks();
    const match = existingDecks.find(d => d.name.toLowerCase() === name.trim().toLowerCase());
    if (match) {
      targetDeckId = match.id;
    } else {
      const created = await addLightningDeck(name);
      targetDeckId = created.id;
    }
  }

  if (isMongoDBConnected) {
    try {
      const cardsToSave = cards.map(c => ({
        deckId: targetDeckId,
        type: c.type || 'basic',
        front: c.front,
        back: c.back
      }));
      const saved = await LightningCardModel.insertMany(cardsToSave);
      return { success: true, added: saved.length, deckId: targetDeckId };
    } catch (err) {
      console.error('MongoDB write cards error, falling back to JSON file:', err);
    }
  }

  ensureFallbackDirectory();
  const fileData = JSON.parse(fs.readFileSync(FALLBACK_LIGHTNING_PATH, 'utf-8'));
  const newCards = cards.map((c, index) => ({
    id: (Date.now() + index).toString() + '_' + Math.floor(Math.random() * 1000),
    deckId: targetDeckId,
    type: c.type || 'basic',
    front: c.front,
    back: c.back,
    createdAt: new Date().toISOString()
  }));
  fileData.cards.push(...newCards);
  fs.writeFileSync(FALLBACK_LIGHTNING_PATH, JSON.stringify(fileData, null, 2), 'utf-8');
  return { success: true, added: newCards.length, deckId: targetDeckId };
}

export async function deleteLightningCard(cardId) {
  if (isMongoDBConnected) {
    try {
      await LightningCardModel.findByIdAndDelete(cardId);
      return true;
    } catch (err) {
      console.error('MongoDB delete card error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const fileData = JSON.parse(fs.readFileSync(FALLBACK_LIGHTNING_PATH, 'utf-8'));
  fileData.cards = fileData.cards.filter(c => c.id !== cardId && c._id !== cardId);
  fs.writeFileSync(FALLBACK_LIGHTNING_PATH, JSON.stringify(fileData, null, 2), 'utf-8');
  return true;
}

export async function updateLightningCard(cardId, updateData) {
  if (isMongoDBConnected) {
    try {
      const updated = await LightningCardModel.findByIdAndUpdate(cardId, updateData, { new: true });
      if (updated) return true;
    } catch (err) {
      console.error('MongoDB update card error, falling back to JSON file:', err);
    }
  }
  ensureFallbackDirectory();
  const fileData = JSON.parse(fs.readFileSync(FALLBACK_LIGHTNING_PATH, 'utf-8'));
  const idx = fileData.cards.findIndex(c => c.id === cardId || c._id === cardId);
  if (idx !== -1) {
    Object.assign(fileData.cards[idx], updateData);
    fs.writeFileSync(FALLBACK_LIGHTNING_PATH, JSON.stringify(fileData, null, 2), 'utf-8');
    return true;
  }
  return false;
}
