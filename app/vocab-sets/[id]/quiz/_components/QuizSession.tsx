"use client";

import { useState } from "react";
import { QuizPlayer } from "@/app/vocab-sets/[id]/quiz/_components/QuizPlayer";
import type { QuizQuestion } from "@/lib/quiz";

/** QuizPlayer 답안을 POST /api/quiz-attempts 로 기록하는 글루. */
export function QuizSession({ questions }: { questions: QuizQuestion[] }) {
  // 서버 컴포넌트가 재렌더(dev Fast Refresh 등)되어 새로 섞인 문제가 내려와도
  // 진행 중 세션은 마운트 시점의 문제로 고정한다.
  const [sessionQuestions] = useState(questions);

  return (
    <QuizPlayer
      questions={sessionQuestions}
      onAnswer={(wordId, isCorrect) => {
        void fetch("/api/quiz-attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wordId,
            direction: sessionQuestions[0]?.direction,
            isCorrect,
          }),
        });
      }}
    />
  );
}
