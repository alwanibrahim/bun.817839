import { Bot, session } from "grammy";
import { MyContext, SessionData } from "./types";
import { commants } from "../bots/handlers/commants";
import { setupMenu } from "../bots/handlers/menu";
import { cart } from "../bots/handlers/cart";

const token = process.env.TELEGRAM_BOT_TOKEN!;
const bot = new Bot<MyContext>(token);

bot.use(
  session({
    initial: (): SessionData => ({
      cart: {},
      step: "idle",
    }),
  })
);

commants(bot);
setupMenu(bot);
cart(bot);

bot.start({
  onStart: () => console.log("✅ Bot sudah mulai"),
  drop_pending_updates: true,
});
