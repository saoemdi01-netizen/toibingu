import { connectDB, getAllCards } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const cards = await getAllCards();
  console.log('Total cards in db:', cards.length);
  const categories = {};
  cards.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  console.log('Categories:', categories);
  
  const m2Cards = cards.filter(c => c.category !== 'General');
  console.log('M2 cards count:', m2Cards.length);
  if (m2Cards.length > 0) {
    console.log('Sample M2 card:', m2Cards[0]);
  }
  process.exit(0);
}
run();
