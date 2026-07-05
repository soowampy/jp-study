"use client";

import { useRef, useState } from "react";
import {
  summarizeSession,
  type QuizAnswer,
  type QuizQuestion,
} from "@/lib/quiz";

/** 보기 버튼 스타일: 피드백 단계에서 정답 green, 선택한 오답 red. (design-system) */
function choiceClass(
  i: number,
  answerIndex: number,
  pickedIndex: number | null,
  inFeedback: boolean,
): string {
  const base = "rounded-lg border px-4 py-3 text-left text-sm";
  if (!inFeedback) {
    return `${base} border-gray-300 bg-white hover:bg-gray-50`;
  }
  if (i === answerIndex) return `${base} border-green-500 bg-green-50`;
  if (i === pickedIndex) return `${base} border-red-500 bg-red-50`;
  return `${base} border-gray-200 bg-white opacity-40`;
}

/** 화면 전환 직후 이 시간(ms) 안에 온 클릭은 무시한다. 더블클릭·고스트 클릭이
 *  같은 좌표의 다른 버튼('다음'/보기)에 꽂혀 의도치 않은 진행·오답이 되는 것을 막는다. */
const CLICK_GUARD_MS = 250;

export function QuizPlayer({
  questions,
  onAnswer,
}: {
  questions: QuizQuestion[];
  onAnswer?: (wordId: number, isCorrect: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [phase, setPhase] = useState<"question" | "feedback">("question");
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const startedAtRef = useRef(new Date());
  const transitionAtRef = useRef(0);

  const guarded = () => Date.now() - transitionAtRef.current < CLICK_GUARD_MS;

  if (index >= questions.length) {
    const summary = summarizeSession(answers, startedAtRef.current, new Date());
    const wrongWords = questions.filter((q) =>
      summary.wrongWordIds.includes(q.wordId),
    );

    return (
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold">세션 결과</h2>
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
  const inFeedback = phase === "feedback";
  const pickedCorrect = pickedIndex !== null && pickedIndex === q.answerIndex;

  // choiceIndex가 null이면 "정답 보기"(오답 처리). 답은 문제당 1회만 제출된다.
  const submit = (choiceIndex: number | null) => {
    if (inFeedback || guarded()) return;
    const isCorrect = choiceIndex === q.answerIndex;
    onAnswer?.(q.wordId, isCorrect);
    setAnswers((prev) => [...prev, { wordId: q.wordId, isCorrect }]);
    setPickedIndex(choiceIndex);
    setPhase("feedback");
    transitionAtRef.current = Date.now();
  };

  const next = () => {
    if (guarded()) return;
    setIndex(index + 1);
    setPhase("question");
    setPickedIndex(null);
    setHintShown(false);
    transitionAtRef.current = Date.now();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        {index + 1} / {questions.length}
      </p>

      <div className="flex items-baseline gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <span className="text-3xl font-bold">{q.prompt}</span>
        {q.promptReading && (
          <span className="text-gray-600">{q.promptReading}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {q.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => submit(i)}
            disabled={inFeedback}
            className={choiceClass(i, q.answerIndex, pickedIndex, inFeedback)}
          >
            {choice}
            {inFeedback && q.choiceMeanings && (
              <span className="ml-2 text-xs text-gray-500">
                {q.choiceMeanings[i]}
              </span>
            )}
          </button>
        ))}
      </div>

      {hintShown && q.hint && (
        <p className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          {q.hint}
        </p>
      )}

      {inFeedback ? (
        <div className="flex items-center gap-4">
          {pickedCorrect ? (
            <p className="text-sm font-semibold text-green-600">정답!</p>
          ) : (
            <>
              {pickedIndex !== null && (
                <p className="text-sm font-semibold text-red-600">오답</p>
              )}
              <p className="text-sm text-gray-600">
                정답: {q.choices[q.answerIndex]}
              </p>
            </>
          )}
          <button
            onClick={next}
            className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            다음
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setHintShown(true)}
            disabled={!q.hint || hintShown}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            힌트 보기
          </button>
          <button
            onClick={() => submit(null)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            정답 보기
          </button>
        </div>
      )}
    </div>
  );
}
