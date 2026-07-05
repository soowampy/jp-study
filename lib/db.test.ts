import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";

// 이 테스트가 통과하려면 마이그레이션으로 4개 테이블이 생성되어 있어야 한다. (AC1)
describe("데이터 모델 라운드트립", () => {
  const createdSetIds: number[] = [];

  afterAll(async () => {
    // onDelete: Cascade 로 Word/WordSrs 도 함께 삭제된다.
    for (const id of createdSetIds) {
      await prisma.vocabSet.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("VocabSet · Word · WordSrs · QuizAttempt 를 생성하고 관계로 조회할 수 있다", async () => {
    const set = await prisma.vocabSet.create({
      data: {
        name: "테스트 단어장",
        words: {
          create: {
            reading: "あたたまる",
            kanji: "暖まる",
            meaningKo: "따뜻해지다",
            srs: { create: {} },
          },
        },
      },
      include: { words: { include: { srs: true } } },
    });
    createdSetIds.push(set.id);

    expect(set.userId).toBe(1); // 무인증 기본값
    expect(set.words).toHaveLength(1);

    const word = set.words[0];
    expect(word.reading).toBe("あたたまる");
    expect(word.srs).not.toBeNull();
    expect(word.srs?.level).toBe(0); // 기본 레벨

    const attempt = await prisma.quizAttempt.create({
      data: { wordId: word.id, direction: "word_to_meaning", isCorrect: true },
    });
    expect(attempt.isCorrect).toBe(true);

    // 관계 재조회
    const reloaded = await prisma.vocabSet.findUnique({
      where: { id: set.id },
      include: { words: { include: { srs: true } } },
    });
    expect(reloaded?.words[0].srs?.correctCount).toBe(0);
  });
});
