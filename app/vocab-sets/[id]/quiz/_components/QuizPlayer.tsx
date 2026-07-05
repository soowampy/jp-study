"use client";

import { useRef, useState } from "react";
import {
  summarizeSession,
  type QuizAnswer,
  type QuizQuestion,
} from "@/lib/quiz";

export function QuizPlayer({
  questions,
  onAnswer,
}: {
  questions: QuizQuestion[];
  onAnswer?: (wordId: number, isCorrect: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const startedAtRef = useRef(new Date());

  if (index >= questions.length) {
    const summary = summarizeSession(answers, startedAtRef.current, new Date());
    const wrongWords = questions.filter((q) =>
      summary.wrongWordIds.includes(q.wordId),
    );

    return (
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold">세션 결과</h2>
        <p className="text-3xl font-bold">정답률 {summary.accuracy}%</p>
        <p className="text-sm text-gray-600">
          {summary.correct} / {summary.total} 정답 · 소요시간{" "}
          {summary.durationSec}초
        </p>
        {wrongWords.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-red-600">틀린 단어</p>
            <ul className="mt-1 flex flex-col gap-1 text-sm">
              {wrongWords.map((q) => (
                <li key={q.wordId}>
                  {q.prompt}
                  {q.promptReading && (
                    <span className="ml-2 text-gray-500">
                      {q.promptReading}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const q = questions[index];
  const answer = (choiceIndex: number) => {
    const isCorrect = choiceIndex === q.answerIndex;
    onAnswer?.(q.wordId, isCorrect);
    setAnswers((prev) => [...prev, { wordId: q.wordId, isCorrect }]);
    setIndex(index + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        {index + 1} / {questions.length}
      </p>
      <div className="flex items-baseline gap-3 rounded-lg border border-gray-200 p-6">
        <span className="text-3xl font-bold">{q.prompt}</span>
        {q.promptReading && (
          <span className="text-gray-600">{q.promptReading}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {q.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => answer(i)}
            className="rounded-md border border-gray-300 px-4 py-3 text-left hover:bg-gray-50"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
