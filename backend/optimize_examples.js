import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'data', 'db_fallback.json');
const PROGRESS_PATH = path.join(__dirname, 'data', 'optimize_progress.json');
const OPTIMIZED_OUTPUT_PATH = path.join(__dirname, 'data', 'german_words_optimized.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment!");
  process.exit(1);
}

// Helper delay function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function optimizeBatch(batch) {
  const prompt = `Bạn là một chuyên gia ngôn ngữ tiếng Đức và tiếng Việt ôn thi TestDaF/DSH.
Nhiệm vụ của bạn là rà soát và viết lại các câu ví dụ tiếng Đức cho danh sách từ vựng dưới đây sao cho tự nhiên, đúng ngữ pháp và phù hợp trực tiếp với nghĩa dịch tiếng Việt được cung cấp.

Yêu cầu cụ thể:
1. Với mỗi từ, câu ví dụ tiếng Đức ("example") mới phải:
   - Sử dụng chính xác từ vựng đó ở dạng phù hợp.
   - Minh họa rõ nét, cụ thể nghĩa của từ trong ngữ cảnh học thuật (chuẩn TestDaF/DSH).
   - Cực kỳ tự nhiên, đúng ngữ pháp 100% (loại bỏ hoàn toàn các câu khuôn mẫu máy móc lặp đi lặp lại).
   - Nếu câu ví dụ hiện tại đã tốt và tự nhiên, có thể giữ nguyên.
2. Bổ sung trường "exampleTranslation" là bản dịch nghĩa tiếng Việt chuẩn xác, tự nhiên và trôi chảy cho câu ví dụ đó.
3. Trả về kết quả dưới dạng một mảng JSON duy nhất chứa các đối tượng có cấu trúc sau (không giải thích thêm, không bọc markdown \`\`\`json, chỉ trả về JSON thuần túy):
   [
     {
       "word": "từ vựng",
       "example": "câu ví dụ tiếng Đức đã tối ưu hoặc giữ nguyên",
       "exampleTranslation": "bản dịch tiếng Việt của câu ví dụ"
     }
   ]

Danh sách từ vựng cần xử lý:
${JSON.stringify(batch.map(c => ({ word: c.word, translation: c.translation, example: c.example })), null, 2)}`;

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "API error");
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const text = data.candidates[0].content.parts[0].text.trim();
        return JSON.parse(text);
      }
      throw new Error("Invalid api response structure");
    } catch (err) {
      console.warn(`Error processing batch: ${err.message}. Retries remaining: ${retries - 1}`);
      retries--;
      if (retries === 0) throw err;
      await sleep(10000); // Wait 10s before retry on error
    }
  }
}

async function main() {
  console.log("=== STARTING GERMAN EXAMPLES OPTIMIZATION ===");
  
  if (!fs.existsSync(DB_PATH)) {
    console.error("No db_fallback.json file found!");
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  const germanCards = dbData.filter(c => c.category === 'General');
  console.log(`Found ${germanCards.length} German cards to optimize.`);

  let progress = { completed: [] };
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
      console.log(`Resuming from checkpoint. Already optimized: ${progress.completed.length} cards.`);
    } catch (e) {
      console.warn("Could not parse progress file, starting fresh.");
    }
  }

  const completedMap = new Map(progress.completed.map(c => [c.word.toLowerCase(), c]));
  const cardsToProcess = germanCards.filter(c => !completedMap.has(c.word.toLowerCase()));
  console.log(`Cards remaining to process: ${cardsToProcess.length}`);

  const batchSize = 25;
  for (let i = 0; i < cardsToProcess.length; i += batchSize) {
    const batch = cardsToProcess.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cardsToProcess.length / batchSize)} (${batch.length} cards)...`);

    try {
      const optimizedBatch = await optimizeBatch(batch);
      
      // Update progress
      for (const optCard of optimizedBatch) {
        progress.completed.push(optCard);
      }

      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
      console.log(`Successfully processed batch. Total optimized: ${progress.completed.length}`);
      
      // Gentle delay between batches to respect rate limits (6 seconds)
      await sleep(6000);
    } catch (err) {
      console.error(`FATAL ERROR processing batch starting with word ${batch[0]?.word}:`, err);
      console.log("Progress saved. You can rerun this script to resume.");
      process.exit(1);
    }
  }

  console.log("All cards processed successfully! Merging results...");
  
  // Create mapping of optimized results
  const finalMap = new Map(progress.completed.map(c => [c.word.toLowerCase(), c]));

  // Build the updated cards list
  const updatedCards = dbData.map(card => {
    if (card.category === 'General') {
      const opt = finalMap.get(card.word.toLowerCase());
      if (opt) {
        return {
          ...card,
          example: opt.example,
          exampleTranslation: opt.exampleTranslation
        };
      }
    }
    return card;
  });

  // Write to db_fallback.json
  fs.writeFileSync(DB_PATH, JSON.stringify(updatedCards, null, 2), 'utf-8');
  console.log(`Updated ${DB_PATH} with optimized sentences.`);

  // Save the pure German vocabulary optimized file for seeding
  const germanOptimized = updatedCards.filter(c => c.category === 'General').map(c => ({
    word: c.word,
    translation: c.translation,
    example: c.example,
    exampleTranslation: c.exampleTranslation,
    module: c.module
  }));
  fs.writeFileSync(OPTIMIZED_OUTPUT_PATH, JSON.stringify(germanOptimized, null, 2), 'utf-8');
  console.log(`Saved static seed file: ${OPTIMIZED_OUTPUT_PATH}`);

  // Clean up progress file
  if (fs.existsSync(PROGRESS_PATH)) {
    fs.unlinkSync(PROGRESS_PATH);
  }

  console.log("=== OPTIMIZATION COMPLETED SUCCESSFULLY! ===");
}

main().catch(console.error);
