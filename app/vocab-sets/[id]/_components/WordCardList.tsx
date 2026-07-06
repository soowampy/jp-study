"use client";

import { useState } from "react";
import {
  filterWordCards,
  type WordCard,
  type WordFilter,
} from "@/lib/wordCards";
import { enrichmentLabel } from "@/lib/enrich";

const STATUSES: { value: NonNullable<WordFilter["status"]>; label: string }[] =
  [
    { value: "all", label: "전체" },
    { value: "review", label: "복습필요" },
    { value: "unlearned", label: "미학습" },
    { value: "bookmarked", label: "저장됨" },
  ];

export function WordCardList({
  cards,
  onToggleBookmark,
}: {
  cards: WordCard[];
  onToggleBookmark?: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [status, setStatus] =
    useState<NonNullable<WordFilter["status"]>>("all");

  const visible = filterWordCards(cards, { query, level, status });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={
              status === s.value
                ? "rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
                : "rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            }
          >
            {s.label}
          </button>
        ))}
        <select
          aria-label="레벨 필터"
          value={level ?? ""}
          onChange={(e) =>
            setLevel(e.target.value === "" ? null : Number(e.target.value))
          }
          className="rounded-md border border-gray-300 px-2 py-2 text-sm"
        >
          <option value="">레벨 전체</option>
          {[0, 1, 2, 3, 4, 5].map((lv) => (
            <option key={lv} value={lv}>
              레벨 {lv}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          일치하는 단어가 없습니다
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((card) => (
            <li
              key={card.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-baseline gap-3">
                {card.kanji && (
                  <span className="text-xl font-bold">{card.kanji}</span>
                )}
                <span className="text-gray-600">{card.reading}</span>
                <span>{card.meaningKo}</span>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  Lv.{card.level}
                </span>
                <button
                  aria-label="저장"
                  aria-pressed={card.bookmarked}
                  onClick={() => onToggleBookmark?.(card.id)}
                  className={
                    card.bookmarked
                      ? "ml-auto rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                      : "ml-auto rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs hover:bg-gray-50"
                  }
                >
                  저장
                </button>
              </div>

              {enrichmentLabel(card) && (
                <p className="mt-2 text-xs text-red-600">
                  {enrichmentLabel(card)}
                </p>
              )}

              {card.synonyms.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  유의어:{" "}
                  {card.synonyms.map((s) => (
                    <span key={s} className="mr-2">
                      {s}
                    </span>
                  ))}
                </p>
              )}

              {card.examples.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  {card.examples.map((ex, i) => (
                    <li key={i}>
                      <span>{ex.jp}</span>{" "}
                      <span className="text-gray-400">({ex.reading})</span>{" "}
                      <span className="text-gray-600">{ex.ko}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
