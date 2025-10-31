import {InlineKeyboard, Bot} from 'grammy'
import {MyContext} from '../types'

export async function commants(bot:Bot<MyContext>) {
   bot.command("start", async (ctx) => {
    await ctx.reply("Halo ges 👋 Selamat datang di Bot MVP", {
      reply_markup: new InlineKeyboard()
        .text("🛍️ Produk", "open_products")
        .text("🧺 Keranjang", "open_cart")
        .row()
        .text("💳 Bayar", "open_checkout"),
    });
  });

  // /help
  bot.command("help", (ctx) =>
    ctx.reply("Gunakan /start untuk membuka menu utama.")
  );
}