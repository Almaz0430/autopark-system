import { GoogleGenerativeAI } from "@google/generative-ai";

// Получаем API-ключ из переменных окружения
const apiKey = process.env.GEMINI_API_KEY;

// Проверяем, что ключ доступен
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Отправляет промпт в Gemini API и возвращает ответ.
 * @param prompt - Промпт для отправки в Gemini.
 * @returns Ответ от Gemini API.
 */
export async function getGeminiResponse(prompt: string) {
  try {
    // Используем актуальную модель
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { success: true, text };
  } catch (error: any) {
    console.error("Ошибка при получении ответа от Gemini:", error);
    return { success: false, error: error.message };
  }
}
