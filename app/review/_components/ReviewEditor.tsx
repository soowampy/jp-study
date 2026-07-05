"use client";

import { useState } from "react";
import {
  validateConfirm,
  isRowIncomplete,
  type EditableWord,
} from "@/lib/confirm";

export function ReviewEditor({
  initialWords,
  onConfirm,
}: {
  initialWords: EditableWord[];
  onConfirm: (words: EditableWord[]) => void;
}) {
  const [words, setWords] = useState<EditableWord[]>(initialWords);
  const [error, setError] = useState<string | null>(null);

  function update(i: number, field: keyof EditableWord, value: string) {
    setWords((ws) =>
      ws.map((w, idx) =>
        idx === i
          ? { ...w, [field]: field === "kanji" ? value || null : value }
          : w,
      ),
    );
  }

  function remove(i: number) {
    setWords((ws) => ws.filter((_, idx) => idx !== i));
  }

  function add() {
    setWords((ws) => [...ws, { kanji: null, reading: "", meaningKo: "" }]);
  }

  function confirm() {
    const err = validateConfirm(words);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onConfirm(words);
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-gray-500">
            <th className="p-2">漢字</th>
            <th className="p-2">후리가나</th>
            <th className="p-2">뜻</th>
            <th className="p-2"></th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {words.map((w, i) => (
            <tr
              key={i}
              className={
                isRowIncomplete(w)
                  ? "border-b border-gray-100 bg-amber-50"
                  : "border-b border-gray-100"
              }
            >
              <td className="p-2">
                <input
                  placeholder="한자"
                  value={w.kanji ?? ""}
                  onChange={(e) => update(i, "kanji", e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1"
                />
              </td>
              <td className="p-2">
                <input
                  placeholder="후리가나"
                  value={w.reading}
                  onChange={(e) => update(i, "reading", e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1"
                />
              </td>
              <td className="p-2">
                <input
                  placeholder="뜻"
                  value={w.meaningKo}
                  onChange={(e) => update(i, "meaningKo", e.target.value)}
                  className="w-full rounded border border-gray-200 px-2 py-1"
                />
              </td>
              <td className="p-2">
                {isRowIncomplete(w) && (
                  <span className="rounded bg-amber-200 px-2 py-1 text-xs text-amber-800">
                    확인 필요
                  </span>
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => remove(i)}
                  className="text-sm text-red-600 hover:underline"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-3">
        <button
          onClick={add}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          행 추가
        </button>
        <button
          onClick={confirm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          확정
        </button>
      </div>
    </div>
  );
}
