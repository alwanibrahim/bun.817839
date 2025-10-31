const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
export class telegramController {
  static async telegram({ request }: any) {
    const body = await request.json();

    // Telegram message structure
    const message = body?.message;
    if (!message) {
      return "ok"; // ignore non-message updates
    }

    const chatId = message.chat.id;
    const firstName = message.from?.first_name || "Bos";

    // Auto reply back
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Halo, ${firstName}! 👋`,
      }),
    });

    return "ok";
  }
}
