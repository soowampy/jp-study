import { describe, it, expect, afterAll } from "vitest";
import {
  confirmVocabSet,
  renameVocabSet,
  deleteVocabSet,
  getLastStudiedAt,
  formatLastStudied,
} from "@/lib/vocabSet";
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

describe("renameVocabSet (#13)", () => {
  const createdIds: number[] = [];

  afterAll(async () => {
    for (const id of createdIds) {
      await prisma.vocabSet.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("공백만 있는 이름이면 에러를 던지고 이름이 바뀌지 않는다", async () => {
    const { setId } = await confirmVocabSet("원래 이름", [
      { kanji: "水", reading: "みず", meaningKo: "물" },
    ]);
    createdIds.push(setId);

    await expect(renameVocabSet(setId, "   ")).rejects.toThrow();

    const set = await prisma.vocabSet.findUnique({ where: { id: setId } });
    expect(set?.name).toBe("원래 이름");
  });

  it("유효한 이름이면 VocabSet.name이 갱신된다", async () => {
    const { setId } = await confirmVocabSet("원래 이름2", [
      { kanji: "水", reading: "みず", meaningKo: "물" },
    ]);
    createdIds.push(setId);

    await renameVocabSet(setId, "새 이름");

    const set = await prisma.vocabSet.findUnique({ where: { id: setId } });
    expect(set?.name).toBe("새 이름");
  });
});

describe("deleteVocabSet (#13)", () => {
  it("VocabSet과 소속 Word/WordSrs가 cascade 삭제된다", async () => {
    const { setId } = await confirmVocabSet("삭제 테스트", [
      { kanji: "水", reading: "みず", meaningKo: "물" },
    ]);
    const set = await prisma.vocabSet.findUnique({
      where: { id: setId },
      include: { words: true },
    });
    const wordId = set!.words[0].id;
    await prisma.wordSrs.create({ data: { wordId } });

    await deleteVocabSet(setId);

    expect(await prisma.vocabSet.findUnique({ where: { id: setId } })).toBeNull();
    expect(await prisma.word.findUnique({ where: { id: wordId } })).toBeNull();
    expect(
      await prisma.wordSrs.findUnique({ where: { wordId } }),
    ).toBeNull();
  });
});

describe("getLastStudiedAt (#14)", () => {
  const createdIds: number[] = [];

  afterAll(async () => {
    for (const id of createdIds) {
      await prisma.vocabSet.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("학습 기록(QuizAttempt)이 없으면 null을 반환한다", async () => {
    const { setId } = await confirmVocabSet("학습 기록 없음 테스트", [
      { kanji: "水", reading: "みず", meaningKo: "물" },
    ]);
    createdIds.push(setId);

    expect(await getLastStudiedAt(setId)).toBeNull();
  });

  it("단어장 소속 단어에 QuizAttempt가 여럿이면 가장 최신 answeredAt을 반환한다", async () => {
    const { setId } = await confirmVocabSet("최신값 테스트", [
      { kanji: "水", reading: "みず", meaningKo: "물" },
      { kanji: "秋", reading: "あき", meaningKo: "가을" },
    ]);
    createdIds.push(setId);
    const set = await prisma.vocabSet.findUnique({
      where: { id: setId },
      include: { words: true },
    });
    const [w1, w2] = set!.words;
    const older = new Date("2026-07-01T00:00:00Z");
    const newer = new Date("2026-07-05T00:00:00Z");
    await prisma.quizAttempt.create({
      data: {
        wordId: w1.id,
        direction: "kanji_to_meaning",
        isCorrect: true,
        answeredAt: older,
      },
    });
    await prisma.quizAttempt.create({
      data: {
        wordId: w2.id,
        direction: "kanji_to_meaning",
        isCorrect: true,
        answeredAt: newer,
      },
    });

    const latest = await getLastStudiedAt(setId);
    expect(latest?.toISOString()).toBe(newer.toISOString());
  });
});

describe("formatLastStudied (#14)", () => {
  const today = new Date("2026-07-06T00:00:00Z");

  it("null이면 '학습 기록 없음'을 반환한다", () => {
    expect(formatLastStudied(null, today)).toBe("학습 기록 없음");
  });

  it("오늘 날짜면 '오늘'을 반환한다", () => {
    expect(formatLastStudied(today, today)).toBe("오늘");
  });

  it("3일 전 날짜면 '3일 전'을 반환한다", () => {
    const threeDaysAgo = new Date("2026-07-03T00:00:00Z");
    expect(formatLastStudied(threeDaysAgo, today)).toBe("3일 전");
  });
});
