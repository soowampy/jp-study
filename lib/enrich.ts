export type Example = { jp: string; reading: string; ko: string };
export type Enrichment = { synonyms: string[]; examples: Example[] };

/** Gemini enrichment 응답(JSON)을 Enrichment[]로 파싱. 방어적으로 펜스 제거. */
export function parseEnrichmentJson(raw: string): Enrichment[] {
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  const data = JSON.parse(cleaned);
  if (!Array.isArray(data)) {
    throw new Error("생성 결과가 JSON 배열이 아닙니다.");
  }

  return data.map((row) => ({
    synonyms: Array.isArray(row.synonyms) ? row.synonyms.map(String) : [],
    examples: Array.isArray(row.examples)
      ? row.examples.map((e: { jp?: unknown; reading?: unknown; ko?: unknown }) => ({
          jp: String(e.jp ?? ""),
          reading: String(e.reading ?? ""),
          ko: String(e.ko ?? ""),
        }))
      : [],
  }));
}

/** 배열을 size 단위 배치로 나눈다. (Pass2 묶음 호출용) */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/** 단어 카드에 표시할 생성 상태 라벨. 실패면 재시도 안내, 아니면 null. */
export function enrichmentLabel(word: { enrichFailed: boolean }): string | null {
  return word.enrichFailed ? "생성 실패, 재시도" : null;
}
