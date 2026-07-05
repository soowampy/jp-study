import type { Example } from "@/lib/enrich";

/** 단어장 뷰 카드 1장에 필요한 데이터 (#6) */
export type WordCard = {
  id: number;
  kanji: string | null;
  reading: string;
  meaningKo: string;
  synonyms: string[];
  examples: Example[];
  enrichFailed: boolean;
  level: number;
  needsReview: boolean;
  unlearned: boolean;
};

export type WordWithSrs = {
  id: number;
  kanji: string | null;
  reading: string;
  meaningKo: string;
  synonyms: string | null;
  examples: string | null;
  enrichFailed: boolean;
  srs: { level: number; nextReviewDate: Date } | null;
};

export type WordFilter = {
  query?: string;
  level?: number | null;
  status?: "all" | "review" | "unlearned";
};

function parseJsonArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Word + WordSrs 를 카드 데이터로 변환한다. SRS 없으면 level 0 = 미학습. */
export function toWordCard(word: WordWithSrs, today: Date): WordCard {
  return {
    id: word.id,
    kanji: word.kanji,
    reading: word.reading,
    meaningKo: word.meaningKo,
    synonyms: parseJsonArray<string>(word.synonyms),
    examples: parseJsonArray<Example>(word.examples),
    enrichFailed: word.enrichFailed,
    level: word.srs?.level ?? 0,
    needsReview:
      word.srs !== null && word.srs.nextReviewDate.getTime() <= today.getTime(),
    unlearned: word.srs === null,
  };
}

/** 검색어(漢字·후리가나·뜻) + 레벨 + 상태(복습필요/미학습) 필터. */
export function filterWordCards(
  cards: WordCard[],
  filter: WordFilter,
): WordCard[] {
  const query = filter.query?.trim() ?? "";

  return cards.filter((c) => {
    if (
      query &&
      !(c.kanji ?? "").includes(query) &&
      !c.reading.includes(query) &&
      !c.meaningKo.includes(query)
    ) {
      return false;
    }
    if (filter.level != null && c.level !== filter.level) return false;
    if (filter.status === "review" && !c.needsReview) return false;
    if (filter.status === "unlearned" && !c.unlearned) return false;
    return true;
  });
}
