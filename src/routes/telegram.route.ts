import { Bot } from "grammy";
import { Elysia } from "elysia";
import {askGemini} from '../plugins/gemini'

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Inisialisasi bot saat aplikasi start
let botInitialized = false;

async function initializeBot() {
  if (!botInitialized) {
    await bot.init();
    botInitialized = true;
    console.log("Bot initialized successfully");
  }
}

bot.on("message:text", async (santai) => {
    const teks = santai.message.text.toLocaleLowerCase()
    switch (teks) {
        case "santai":
            const respose = await askGemini(teks)
            return santai.reply(respose)
            break;
        case "mimi":
            return santai.reply(`santai kawan mimi ${santai.from.first_name}`)
            break;
        case "walawe":
            return santai.reply(`santai kawan walawe ${santai.from.first_name}`)
            break;
    
        default:
            break;
    }
  santai.reply(`Halo, ${santai.from.first_name}! 👋`);
});

async function handleUpdate(body: any) {
  try {
    // Pastikan bot sudah diinisialisasi
    if (!botInitialized) {
      await initializeBot();
    }
    await bot.handleUpdate(body);
    return "ok";
  } catch (error) {
    console.error("Error handling update:", error);
    return "error";
  }
}

export const telegeramEndPoint = new Elysia()
  .post("/api/telegram/webhook", async ({ request }) => {
    const body = await request.json();
    return await handleUpdate(body);
  });