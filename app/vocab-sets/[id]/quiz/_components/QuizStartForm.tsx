"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuizDirection } from "@/lib/quiz";

const DIRECTIONS: { value: QuizDirection; label: string }[] = [
  { value: "word_to_meaning", label: "정방향 — 단어(漢字+후리가나) → 뜻" },
  { value: "meaning_to_word", label: "역방향 — 뜻 → 단어" },
];

const COUNTS = [
  { value: "10", label: "10문제" },
  { value: "20", label: "20문제" },
  { value: "all", label: "전체" },
];

/** 퀴즈 시작 화면: 방향·문제 수 선택 → 시작 링크. (R5 개정) */
export function QuizStartForm({ setId }: { setId: number }) {
  const [direction, setDirection] = useState<QuizDirection>("word_to_meaning");
  const [count, setCount] = useState("20");

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">방향</legend>
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
        href={`/vocab-sets/${setId}/quiz?direction=${direction}&count=${count}`}
        className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        퀴즈 시작
      </Link>
    </div>
  );
}
