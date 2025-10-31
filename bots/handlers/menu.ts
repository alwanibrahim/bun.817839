import { InlineKeyboard, Bot } from "grammy";
import {cart, carts} from './cart'
import {MyContext} from '../types'

export function setupMenu(bot: Bot<MyContext>) {
  bot.callbackQuery("open_products", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("🛍️ Daftar Produk:", {
      reply_markup: new InlineKeyboard()
        .text("Produk A", "add_A")
        .text("Produk B", "add_B")
        .row()
        .text("⬅️ Kembali", "back_home"),
    });
  });

  bot.callbackQuery("open_cart", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id
    const cart = carts[userId] || {};
    const items = Object.entries(cart).map(([p, qty])=> `• ${p} x${qty}`).join("\n")
    await ctx.editMessageText(items ?  `product di cart kamu:\n ${items}`: "tidak ada product apapun di cart", {
      reply_markup: new InlineKeyboard().text(items? "Hapus semua": "", "clear_cart").row().text("⬅️ Kembali", "back_home"),
    });
  });

  bot.callbackQuery("open_checkout", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("💳 Pembayaran belum tersedia, ges!", {
      reply_markup: new InlineKeyboard().text("⬅️ Kembali", "back_home"),
    });
  });

  // balik ke home
  bot.callbackQuery("back_home", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("🏠 Kembali ke menu utama", {
      reply_markup: new InlineKeyboard()
        .text("🛍️ Produk", "open_products")
        .text("🧺 Keranjang", "open_cart")
        .row()
        .text("💳 Bayar", "open_checkout"),
    });
  });
}
