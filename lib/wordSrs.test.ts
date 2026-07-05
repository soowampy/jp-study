import { describe, it, expect, afterAll } from "vitest";
import { answerWord } from "@/lib/wordSrs";
import { prisma } from "@/lib/db";

describe("wordSrs", () => {
  const setIds: number[] = [];

  afterAll(async () => {
    for (const id of setIds) {
      await prisma.vocabSet.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  async function makeWord() {
    const set = await prisma.vocabSet.create({
      data: {
        name: "srs 테스트",
        words: { create: [{ kanji: "水", reading: "みず", meaningKo: "물" }] },
      },
      include: { words: true },
    });
    setIds.push(set.id);
    return set.words[0];
  }

  it("SRS 없는 단어 정답 → WordSrs 생성(레벨 1, correctCount 1)", async () => {
    const word = await makeWord();

    await answerWord(word.id, true);

    const loaded = await prisma.wordSrs.findUnique({
      where: { wordId: word.id },
    });
    expect(loaded?.level).toBe(1);
    expect(loaded?.correctCount).toBe(1);
    expect(loaded?.wrongCount).toBe(0);
    expect(loaded?.lastReviewedAt).not.toBeNull();
  });

  it("기존 SRS 오답 → 레벨 0, wrongCount 증가, lastReviewedAt 갱신", async () => {
    const word = await makeWord();
    await prisma.wordSrs.create({
      data: { wordId: word.id, level: 3, correctCount: 5, wrongCount: 1 },
    });

    await answerWord(word.id, false);

    const loaded = await prisma.wordSrs.findUnique({
      where: { wordId: word.id },
    });
    expect(loaded?.level).toBe(0);
    expect(loaded?.correctCount).toBe(5);
    expect(loaded?.wrongCount).toBe(2);
    expect(loaded?.lastReviewedAt).not.toBeNull();
  });
});
