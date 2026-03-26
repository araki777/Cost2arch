import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const fetchGemini = async (prompt: string) => {
  // ユーザーの要望に合わせてモデルを使用
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
