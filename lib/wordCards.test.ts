import { describe, it, expect } from "vitest";
import { toWordCard, filterWordCards, type WordCard } from "@/lib/wordCards";

const today = new Date("2026-07-05T00:00:00.000Z");

const baseWord = {
  id: 1,
  kanji: "水" as string | null,
  reading: "みず",
  meaningKo: "물",
  synonyms: '["お冷"]' as string | null,
  examples:
    '[{"jp":"水を飲む","reading":"みずをのむ","ko":"물을 마신다"},{"jp":"水が冷たい","reading":"みずがつめたい","ko":"물이 차갑다"}]' as
      | string
      | null,
  enrichFailed: false,
  bookmarked: false,
  srs: null as { level: number; nextReviewDate: Date } | null,
};

describe("toWordCard", () => {
  it("synonyms/examples JSON 문자열을 배열로 파싱한다", () => {
    const card = toWordCard(baseWord, today);

    expect(card.synonyms).toEqual(["お冷"]);
    expect(card.examples).toHaveLength(2);
    expect(card.examples[0]).toEqual({
      jp: "水を飲む",
      reading: "みずをのむ",
      ko: "물을 마신다",
    });
  });

  it("synonyms/examples가 null이면 빈 배열이 된다", () => {
    const card = toWordCard(
      { ...baseWord, synonyms: null, examples: null },
      today,
    );

    expect(card.synonyms).toEqual([]);
    expect(card.examples).toEqual([]);
  });

  it("깨진 JSON은 빈 배열로 방어 처리한다", () => {
    const card = toWordCard(
      { ...baseWord, synonyms: "{oops", examples: "not json" },
      today,
    );

    expect(card.synonyms).toEqual([]);
    expect(card.examples).toEqual([]);
  });

  it("SRS 레코드가 없으면 level 0, 미학습이며 복습필요가 아니다", () => {
    const card = toWordCard({ ...baseWord, srs: null }, today);

    expect(card.level).toBe(0);
    expect(card.unlearned).toBe(true);
    expect(card.needsReview).toBe(false);
  });

  it("SRS가 있으면 그 레벨을 쓰고 미학습이 아니다", () => {
    const card = toWordCard(
      {
        ...baseWord,
        srs: { level: 3, nextReviewDate: new Date("2026-08-01T00:00:00.000Z") },
      },
      today,
    );

    expect(card.level).toBe(3);
    expect(card.unlearned).toBe(false);
  });

  it("next_review_date <= today면 복습필요다", () => {
    const past = toWordCard(
      {
        ...baseWord,
        srs: { level: 2, nextReviewDate: new Date("2026-07-01T00:00:00.000Z") },
      },
      today,
    );
    const exact = toWordCard(
      { ...baseWord, srs: { level: 2, nextReviewDate: today } },
      today,
    );
    const future = toWordCard(
      {
        ...baseWord,
        srs: { level: 2, nextReviewDate: new Date("2026-07-10T00:00:00.000Z") },
      },
      today,
    );

    expect(past.needsReview).toBe(true);
    expect(exact.needsReview).toBe(true);
    expect(future.needsReview).toBe(false);
  });

  it("bookmarked 값을 그대로 카드에 매핑한다 (#11)", () => {
    const bookmarked = toWordCard({ ...baseWord, bookmarked: true }, today);
    const notBookmarked = toWordCard(
      { ...baseWord, bookmarked: false },
      today,
    );

    expect(bookmarked.bookmarked).toBe(true);
    expect(notBookmarked.bookmarked).toBe(false);
  });
});

function card(overrides: Partial<WordCard>): WordCard {
  return {
    id: 0,
    kanji: null,
    reading: "",
    meaningKo: "",
    synonyms: [],
    examples: [],
    enrichFailed: false,
    bookmarked: false,
    level: 0,
    needsReview: false,
    unlearned: true,
    ...overrides,
  };
}

const mizu = card({
  id: 1,
  kanji: "水",
  reading: "みず",
  meaningKo: "물",
  level: 3,
  needsReview: true,
  unlearned: false,
});
const aki = card({
  id: 2,
  kanji: "秋",
  reading: "あき",
  meaningKo: "가을",
  level: 0,
  needsReview: false,
  unlearned: true,
});

describe("filterWordCards", () => {
  it("검색어가 漢字·후리가나·뜻 어디든 일치하면 남긴다", () => {
    expect(filterWordCards([mizu, aki], { query: "水" })).toEqual([mizu]);
    expect(filterWordCards([mizu, aki], { query: "あき" })).toEqual([aki]);
    expect(filterWordCards([mizu, aki], { query: "가을" })).toEqual([aki]);
  });

  it("검색어가 비어 있으면 전체를 반환한다", () => {
    expect(filterWordCards([mizu, aki], { query: "  " })).toEqual([mizu, aki]);
    expect(filterWordCards([mizu, aki], {})).toEqual([mizu, aki]);
  });

  it("일치하는 단어가 없으면 빈 배열이다", () => {
    expect(filterWordCards([mizu, aki], { query: "없는말" })).toEqual([]);
  });

  it("레벨 필터는 해당 레벨만 남긴다", () => {
    expect(filterWordCards([mizu, aki], { level: 3 })).toEqual([mizu]);
    expect(filterWordCards([mizu, aki], { level: 0 })).toEqual([aki]);
  });

  it("'복습필요' 필터는 needsReview 단어만 남긴다", () => {
    expect(filterWordCards([mizu, aki], { status: "review" })).toEqual([mizu]);
  });

  it("'미학습' 필터는 unlearned 단어만 남긴다", () => {
    expect(filterWordCards([mizu, aki], { status: "unlearned" })).toEqual([
      aki,
    ]);
  });

  it("검색어와 필터를 조합할 수 있다", () => {
    expect(
      filterWordCards([mizu, aki], { query: "가을", status: "review" }),
    ).toEqual([]);
    expect(
      filterWordCards([mizu, aki], { query: "みず", status: "review" }),
    ).toEqual([mizu]);
  });

  it("'저장됨' 필터는 bookmarked 단어만 남긴다 (#11)", () => {
    const saved = card({ ...mizu, id: 3, bookmarked: true });

    expect(
      filterWordCards([mizu, aki, saved], { status: "bookmarked" }),
    ).toEqual([saved]);
  });
});
