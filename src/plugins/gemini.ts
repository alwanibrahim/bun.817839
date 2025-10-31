import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function askGemini(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini Error:", err);
    return "⚠️ AI lagi error. Coba ulang sebentar.";
  }
}
