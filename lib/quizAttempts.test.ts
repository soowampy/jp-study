import { describe, it, expect, afterAll } from "vitest";
import { recordAttempt } from "@/lib/quizAttempts";
import { prisma } from "@/lib/db";

describe("quizAttempts", () => {
  const attemptIds: number[] = [];

  afterAll(async () => {
    for (const id of attemptIds) {
      await prisma.quizAttempt.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("recordAttempt가 QuizAttempt(wordId, direction, isCorrect)를 저장한다", async () => {
    const attempt = await recordAttempt(9999, "kanji_to_meaning", false);
    attemptIds.push(attempt.id);

    const loaded = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
    });
    expect(loaded?.wordId).toBe(9999);
    expect(loaded?.direction).toBe("kanji_to_meaning");
    expect(loaded?.isCorrect).toBe(false);
    expect(loaded?.answeredAt).not.toBeNull();
  });
});
