export type ParsedWord = {
  kanji: string | null;
  reading: string;
  meaningKo: string;
};

/**
 * LLM이 반환한 JSON 문자열을 ParsedWord[] 로 파싱한다.
 * Gemini JSON 모드가 순수 JSON을 주지만, 방어적으로 ```json 펜스를 제거한다. (ADR 6.3)
 */
export function parseWordsJson(raw: string): ParsedWord[] {
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  const data = JSON.parse(cleaned);
  if (!Array.isArray(data)) {
    throw new Error("파싱 결과가 JSON 배열이 아닙니다.");
  }

  return data.map((row) => ({
    kanji: row.kanji ?? null,
    reading: String(row.reading ?? ""),
    meaningKo: String(row.meaning_ko ?? row.meaningKo ?? ""),
  }));
}

/** 텍스트를 linesPerChunk 줄 단위 청크로 분할한다. */
export function chunkLines(text: string, linesPerChunk: number): string[] {
  const lines = text.split(/\r?\n/);
  const chunks: string[] = [];
  for (let i = 0; i < lines.length; i += linesPerChunk) {
    chunks.push(lines.slice(i, i + linesPerChunk).join("\n"));
  }
  return chunks;
}
