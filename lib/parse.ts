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

/**
 * 텍스트를 maxChars 이하 청크로 분할한다.
 * 줄바꿈이 있으면 줄 경계를 유지하며 그리디 병합하고, 줄바꿈 없이 긴 줄은
 * 공백(없으면 강제) 경계로 쪼갠다. → unpdf가 페이지를 병합해 줄바꿈이 적어도
 * 큰 PDF가 한 덩어리가 되지 않아, 진행률이 실제로 갱신되고 LLM 출력이 잘리지 않는다.
 */
export function chunkText(text: string, maxChars = 1500): string[] {
  const normalized = text.trim();
  if (!normalized) return [];

  // 1) 줄 단위로 나누되, maxChars 초과 줄은 공백/강제 경계로 더 쪼갠다.
  const segments: string[] = [];
  for (const line of normalized.split(/\r?\n/)) {
    let rest = line;
    while (rest.length > maxChars) {
      let cut = rest.lastIndexOf(" ", maxChars);
      if (cut <= 0) cut = maxChars;
      segments.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trimStart();
    }
    if (rest.length > 0) segments.push(rest);
  }

  // 2) segment를 maxChars 이하로 그리디 병합해 청크를 만든다.
  const chunks: string[] = [];
  let current = "";
  for (const seg of segments) {
    if (current.length > 0 && current.length + 1 + seg.length > maxChars) {
      chunks.push(current);
      current = seg;
    } else {
      current = current.length > 0 ? `${current}\n${seg}` : seg;
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}
