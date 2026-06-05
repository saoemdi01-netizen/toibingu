import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'db_fallback.json');

async function run() {
  console.log("1. Clearing medical cards from db_fallback.json...");
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    const cards = JSON.parse(data);
    const generalCardsOnly = cards.filter(c => c.category === 'General');
    console.log(`Fallback JSON currently has ${cards.length} cards. Filtering out medical...`);
    fs.writeFileSync(dbPath, JSON.stringify(generalCardsOnly, null, 2), 'utf8');
    console.log(`Fallback JSON updated. General cards left: ${generalCardsOnly.length}`);
  } else {
    console.log("No fallback JSON file found.");
  }

  console.log("2. Attempting to clear medical cards from MongoDB (if connected)...");
  const mongoUri = 'mongodb://localhost:27017/ankicard';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to MongoDB successfully!");
    
    // Define schema
    const CardSchema = new mongoose.Schema({
      category: String
    });
    
    // Check if model already compiled to avoid overwriting error
    const CardModel = mongoose.models.Card || mongoose.model('Card', CardSchema);
    
    // Delete cards where category is not 'General'
    const result = await CardModel.deleteMany({ category: { $ne: 'General' } });
    console.log(`MongoDB operation success: Deleted ${result.deletedCount} medical cards.`);
  } catch (err) {
    console.warn("MongoDB connection failed or not running, skipped MongoDB deletion. Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Finished database clearing.");
  }
}

run().catch(console.error);
