import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { setBookmarked } from "@/lib/words";

describe("setBookmarked (#11)", () => {
  const createdSetIds: number[] = [];

  afterAll(async () => {
    for (const id of createdSetIds) {
      await prisma.vocabSet.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("true로 설정하면 Word.bookmarked가 true가 된다", async () => {
    const set = await prisma.vocabSet.create({
      data: {
        name: "북마크 테스트",
        words: { create: { reading: "みず", kanji: "水", meaningKo: "물" } },
      },
      include: { words: true },
    });
    createdSetIds.push(set.id);
    const wordId = set.words[0].id;

    await setBookmarked(wordId, true);

    const word = await prisma.word.findUnique({ where: { id: wordId } });
    expect(word?.bookmarked).toBe(true);
  });

  it("false로 되돌릴 수 있다", async () => {
    const set = await prisma.vocabSet.create({
      data: {
        name: "북마크 테스트2",
        words: {
          create: {
            reading: "あき",
            kanji: "秋",
            meaningKo: "가을",
            bookmarked: true,
          },
        },
      },
      include: { words: true },
    });
    createdSetIds.push(set.id);
    const wordId = set.words[0].id;

    await setBookmarked(wordId, false);

    const word = await prisma.word.findUnique({ where: { id: wordId } });
    expect(word?.bookmarked).toBe(false);
  });
});
