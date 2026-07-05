import { prisma } from "@/lib/db";
import type { QuizDirection } from "@/lib/quiz";

/** 퀴즈 답안 1건을 QuizAttempt 로그로 저장한다. (#7, 통계·복습 근거) */
export function recordAttempt(
  wordId: number,
  direction: QuizDirection,
  isCorrect: boolean,
) {
  return prisma.quizAttempt.create({
    data: { wordId, direction, isCorrect },
  });
}
