import { describe, it, expect } from "vitest";
import { applyAnswer, selectSessionWords, type SrsState } from "@/lib/srs";

const today = new Date("2026-07-06T00:00:00Z");

function srs(overrides: Partial<SrsState>): SrsState {
  return {
    level: 0,
    nextReviewDate: today,
    correctCount: 0,
    wrongCount: 0,
    lastReviewedAt: null,
    ...overrides,
  };
}

describe("applyAnswer", () => {
  it("레벨 2 정답 → 레벨 3, nextReviewDate=today+7일", () => {
    const next = applyAnswer(srs({ level: 2 }), true, today);

    expect(next.level).toBe(3);
    expect(next.nextReviewDate.toISOString()).toBe(
      "2026-07-13T00:00:00.000Z",
    );
  });

  it("레벨 5 정답 → 레벨 5 유지, nextReviewDate=today+30일", () => {
    const next = applyAnswer(srs({ level: 5 }), true, today);

    expect(next.level).toBe(5);
    expect(next.nextReviewDate.toISOString()).toBe(
      "2026-08-05T00:00:00.000Z",
    );
  });

  it("오답 → 레벨 0, nextReviewDate=today", () => {
    const next = applyAnswer(srs({ level: 4 }), false, today);

    expect(next.level).toBe(0);
    expect(next.nextReviewDate.toISOString()).toBe(today.toISOString());
  });

  it("정답 기록: correctCount+1, lastReviewedAt=today", () => {
    const next = applyAnswer(
      srs({ correctCount: 2, wrongCount: 1 }),
      true,
      today,
    );

    expect(next.correctCount).toBe(3);
    expect(next.wrongCount).toBe(1);
    expect(next.lastReviewedAt?.toISOString()).toBe(today.toISOString());
  });

  it("오답 기록: wrongCount+1, lastReviewedAt=today", () => {
    const next = applyAnswer(
      srs({ correctCount: 2, wrongCount: 1 }),
      false,
      today,
    );

    expect(next.correctCount).toBe(2);
    expect(next.wrongCount).toBe(2);
    expect(next.lastReviewedAt?.toISOString()).toBe(today.toISOString());
  });

  it("SRS 없는 신규 단어 정답 → 레벨 1, correctCount=1", () => {
    const next = applyAnswer(null, true, today);

    expect(next.level).toBe(1);
    expect(next.correctCount).toBe(1);
    expect(next.wrongCount).toBe(0);
    expect(next.nextReviewDate.toISOString()).toBe(
      "2026-07-07T00:00:00.000Z",
    );
  });
});

describe("selectSessionWords", () => {
  const word = (
    id: number,
    s: { level: number; nextReviewDate: Date } | null,
  ) => ({ id, srs: s });

  it("복습 대상(nextReviewDate<=today)이 미학습보다 앞에 온다", () => {
    const words = [
      word(1, null),
      word(2, { level: 2, nextReviewDate: new Date("2026-07-01T00:00:00Z") }),
      word(3, null),
      word(4, { level: 1, nextReviewDate: today }), // 경계 포함
    ];

    const selected = selectSessionWords(words, today);

    expect(new Set(selected.slice(0, 2).map((w) => w.id))).toEqual(
      new Set([2, 4]),
    );
    expect(new Set(selected.slice(2).map((w) => w.id))).toEqual(
      new Set([1, 3]),
    );
  });

  it("학습됐지만 복습일이 안 된 단어는 제외된다", () => {
    const words = [
      word(1, null),
      word(2, { level: 3, nextReviewDate: new Date("2026-07-20T00:00:00Z") }),
    ];

    const selected = selectSessionWords(words, today);

    expect(selected.map((w) => w.id)).toEqual([1]);
  });

  it("출제 대상이 25개면 20개만 선택된다", () => {
    const words = Array.from({ length: 25 }, (_, i) => word(i + 1, null));

    expect(selectSessionWords(words, today)).toHaveLength(20);
  });

  it("size 옵션: 출제 대상 25개에 size 10이면 10개만 선택된다", () => {
    const words = Array.from({ length: 25 }, (_, i) => word(i + 1, null));

    expect(selectSessionWords(words, today, 10)).toHaveLength(10);
  });

  it("출제 대상이 5개면 5개만 구성된다", () => {
    const words = Array.from({ length: 5 }, (_, i) => word(i + 1, null));

    expect(selectSessionWords(words, today)).toHaveLength(5);
  });
});

describe("selectSessionWords — 출제 방식(mode) (#11)", () => {
  const wordWith = (
    id: number,
    overrides: {
      srs?: { level: number; nextReviewDate: Date; correctCount?: number } | null;
      bookmarked?: boolean;
    } = {},
  ) => ({ id, srs: overrides.srs ?? null, bookmarked: overrides.bookmarked });

  it("mode='all': 전체 단어에서 size만큼 선택된다", () => {
    const words = Array.from({ length: 10 }, (_, i) => wordWith(i + 1));

    const selected = selectSessionWords(words, today, 5, "all");

    expect(selected).toHaveLength(5);
    for (const w of selected) {
      expect(words.map((x) => x.id)).toContain(w.id);
    }
  });

  it("mode='unmastered': correctCount=0(또는 SRS 없음)인 단어만 선택된다", () => {
    const words = [
      wordWith(1, { srs: null }), // 미학습 → correctCount 0 취급
      wordWith(2, {
        srs: { level: 2, nextReviewDate: today, correctCount: 3 },
      }),
      wordWith(3, {
        srs: { level: 1, nextReviewDate: today, correctCount: 0 },
      }),
    ];

    const selected = selectSessionWords(words, today, 20, "unmastered");

    expect(new Set(selected.map((w) => w.id))).toEqual(new Set([1, 3]));
  });

  it("mode='bookmarked': bookmarked=true인 단어만 선택된다", () => {
    const words = [
      wordWith(1, { bookmarked: true }),
      wordWith(2, { bookmarked: false }),
      wordWith(3, { bookmarked: true }),
    ];

    const selected = selectSessionWords(words, today, 20, "bookmarked");

    expect(new Set(selected.map((w) => w.id))).toEqual(new Set([1, 3]));
  });

  it("mode 생략 시 기본값은 'review'(기존 동작)다", () => {
    const words = [
      wordWith(1),
      wordWith(2, {
        srs: {
          level: 2,
          nextReviewDate: new Date("2026-07-01T00:00:00Z"),
        },
      }),
    ];

    const selected = selectSessionWords(words, today, 20);

    expect(selected[0].id).toBe(2);
    expect(selected[1].id).toBe(1);
  });
});
