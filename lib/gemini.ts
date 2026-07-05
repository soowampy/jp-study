import { GoogleGenAI } from "@google/genai";

/** 무료 티어 10 RPM 보호용 호출 간 최소 간격 (6초 + 버퍼). */
export const GEMINI_MIN_CALL_INTERVAL_MS = 6500;

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
