import { describe, it, expect } from "vitest";
import { computeDashboard, type DashboardWord } from "@/lib/dashboard";

const today = new Date("2026-07-06T00:00:00Z");

const words: DashboardWord[] = [
  { srs: null }, // 미학습 → 레벨 0 집계
  { srs: { level: 4, nextReviewDate: new Date("2026-07-20T00:00:00Z") } },
  { srs: { level: 5, nextReviewDate: new Date("2026-07-01T00:00:00Z") } }, // 복습 대상
  { srs: { level: 2, nextReviewDate: today } }, // 복습 대상 (경계)
];

describe("computeDashboard", () => {
  it("진도율: 전체 4개 중 레벨 4+가 2개면 progressRate=50", () => {
    const stats = computeDashboard(words, today);

    expect(stats.totalWords).toBe(4);
    expect(stats.progressRate).toBe(50);
  });

  it("단어가 없으면 progressRate=0", () => {
    const stats = computeDashboard([], today);

    expect(stats.totalWords).toBe(0);
    expect(stats.progressRate).toBe(0);
  });

  it("오늘 복습 수: nextReviewDate<=today(경계 포함) 단어 수", () => {
    const stats = computeDashboard(words, today);

    expect(stats.dueToday).toBe(2);
  });

  it("미학습 수: SRS 없는 단어 수", () => {
    const stats = computeDashboard(words, today);

    expect(stats.unlearned).toBe(1);
  });

  it("레벨 분포: 길이 6, 미학습은 레벨 0으로 집계", () => {
    const stats = computeDashboard(words, today);

    expect(stats.levelCounts).toEqual([1, 0, 1, 0, 1, 1]);
  });
});
