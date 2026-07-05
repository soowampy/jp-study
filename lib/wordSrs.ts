import { prisma } from "@/lib/db";
import { applyAnswer } from "@/lib/srs";

/** 퀴즈 답안 1건을 WordSrs에 반영한다(없으면 생성). (#8) */
export async function answerWord(
  wordId: number,
  isCorrect: boolean,
  today: Date = new Date(),
): Promise<void> {
  const current = await prisma.wordSrs.findUnique({ where: { wordId } });
  const next = applyAnswer(current, isCorrect, today);

  await prisma.wordSrs.upsert({
    where: { wordId },
    create: { wordId, ...next },
    update: next,
  });
}
