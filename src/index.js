import 'dotenv/config';
import { Bot } from './client/bot.js';
import { logger } from './utils/logger.js';

(async () => {
  const token = process.env.BOT_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const bot = new Bot(geminiApiKey);

  try {
    await bot.start(token);
  } catch (err) {
    logger.error(`Failed to start bot: ${err?.message || err}`);
    process.exit(1);
  }
})();
