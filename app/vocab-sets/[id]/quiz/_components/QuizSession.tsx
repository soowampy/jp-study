"use client";

import { QuizPlayer } from "@/app/vocab-sets/[id]/quiz/_components/QuizPlayer";
import type { QuizQuestion } from "@/lib/quiz";

/** QuizPlayer 답안을 POST /api/quiz-attempts 로 기록하는 글루. */
export function QuizSession({ questions }: { questions: QuizQuestion[] }) {
  return (
    <QuizPlayer
      questions={questions}
      onAnswer={(wordId, isCorrect) => {
        void fetch("/api/quiz-attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wordId,
            direction: questions[0]?.direction,
            isCorrect,
          }),
        });
      }}
    />
  );
}
