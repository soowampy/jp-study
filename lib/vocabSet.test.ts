import { describe, it, expect, afterAll } from "vitest";
import { confirmVocabSet } from "@/lib/vocabSet";
import { prisma } from "@/lib/db";

describe("confirmVocabSet", () => {
  const createdIds: number[] = [];

  afterAll(async () => {
    for (const id of createdIds) {
      await prisma.vocabSet.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("이름과 단어로 VocabSet+Word 를 저장하고 setId 를 반환한다", async () => {
    const { setId } = await confirmVocabSet("N3 테스트", [
      { kanji: "水", reading: "みず", meaningKo: "물" },
      { kanji: null, reading: "あき", meaningKo: "가을" },
    ]);
    createdIds.push(setId);

    const set = await prisma.vocabSet.findUnique({
      where: { id: setId },
      include: { words: true },
    });
    expect(set?.name).toBe("N3 테스트");
    expect(set?.totalWords).toBe(2);
    expect(set?.words).toHaveLength(2);
    expect(set?.words.find((w) => w.kanji === null)?.reading).toBe("あき");
  });
});
