import {InlineKeyboard, Bot, session} from 'grammy'
import {MyContext} from '../types'
interface Cart {
    [userId: number]: {[product: string]: number}
}
export const carts: Cart = {}
export async function cart(bot:Bot<MyContext>) {
    bot.callbackQuery(/^add_/, async(santai)=>{
        const product = santai.callbackQuery!.data.replace("add_", "")
        const userId = santai.from.id

        carts[userId] = carts[userId] || {}
        carts[userId][product] = (carts[userId][product] || 0) + 1;
        await santai.deleteMessage().catch(()=>{})

        await santai.answerCallbackQuery({text: `${product} telah di tambahkan`})
        console.log(`product ${product} telah di tambahkan `)        
        
    })

    bot.callbackQuery("open_cart", async(santai)=>{
        const userId = santai.from.id
        const cart = carts[userId] || {}
        const items = Object.entries(cart).map(([p, qty])=> `• ${p} x${qty}`).join("\n")

        await santai.editMessageText(items ? `isi keranjang kamu adalah:\n${items} `: "tidak ada item di dalam keranjang",{
            reply_markup: new InlineKeyboard().text("Hapus Semua", "clear_cart").row().text("kembali", "back_home")
        })
    })
    bot.callbackQuery("clear_cart", async(santai)=>{
        const userId = santai.from.id
        carts[userId] = {}
        await santai.answerCallbackQuery({text: "cart telah di kosongkan"})
        await santai.editMessageText("data sudah kosong", {
            reply_markup: new InlineKeyboard().text("Kembali", "back_home")
        })
    })
}