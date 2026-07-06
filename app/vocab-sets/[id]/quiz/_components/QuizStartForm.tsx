"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuizDirection } from "@/lib/quiz";
import type { QuizMode } from "@/lib/srs";

const DIRECTIONS: { value: QuizDirection; label: string }[] = [
  { value: "kanji_to_meaning", label: "한자→뜻 — 漢字를 보고 뜻 고르기" },
  { value: "reading_to_meaning", label: "후리가나→뜻 — 읽기를 보고 뜻 고르기" },
  { value: "meaning_to_word", label: "뜻→단어 — 뜻을 보고 단어 고르기" },
];

const MODES: { value: QuizMode; label: string }[] = [
  { value: "review", label: "복습 우선 (기본)" },
  { value: "all", label: "전체 랜덤" },
  { value: "unmastered", label: "정답 제외 — 아직 못 외운 단어만" },
  { value: "bookmarked", label: "저장 단어만" },
];

const COUNTS = [
  { value: "10", label: "10문제" },
  { value: "20", label: "20문제" },
  { value: "all", label: "전체" },
];

/** 퀴즈 시작 화면: 유형·문제 수·출제 방식 선택 → 시작 링크. (#11) */
export function QuizStartForm({ setId }: { setId: number }) {
  const [direction, setDirection] =
    useState<QuizDirection>("kanji_to_meaning");
  const [count, setCount] = useState("20");
  const [mode, setMode] = useState<QuizMode>("review");

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">유형</legend>
        {DIRECTIONS.map((d) => (
          <label
            key={d.value}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:bg-gray-50"
          >
            <input
              type="radio"
              name="direction"
              checked={direction === d.value}
              onChange={() => setDirection(d.value)}
            />
            {d.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">출제 방식</legend>
        {MODES.map((m) => (
          <label
            key={m.value}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:bg-gray-50"
          >
            <input
              type="radio"
              name="mode"
              checked={mode === m.value}
              onChange={() => setMode(m.value)}
            />
            {m.label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">문제 수</legend>
        <div className="flex gap-2">
          {COUNTS.map((c) => (
            <label
              key={c.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              <input
                type="radio"
                name="count"
                checked={count === c.value}
                onChange={() => setCount(c.value)}
              />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Link
        href={`/vocab-sets/${setId}/quiz?direction=${direction}&count=${count}&mode=${mode}`}
        className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        퀴즈 시작
      </Link>
    </div>
  );
}
