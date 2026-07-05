import { GoogleGenAI } from "@google/genai";

/** Gemini 2.5 Flash 를 네이티브 JSON 모드로 호출해 텍스트(JSON 문자열)를 반환. (ADR-3) */
export async function generateJson(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  return res.text ?? "";
}
