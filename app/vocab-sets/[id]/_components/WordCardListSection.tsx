"use client";

import { useState } from "react";
import { WordCardList } from "@/app/vocab-sets/[id]/_components/WordCardList";
import type { WordCard } from "@/lib/wordCards";

/** WordCardList 저장 토글을 PATCH /api/words/:id/bookmark 로 기록하는 글루. (#11) */
export function WordCardListSection({ cards }: { cards: WordCard[] }) {
  const [items, setItems] = useState(cards);

  const onToggleBookmark = (id: number) => {
    const next = !items.find((c) => c.id === id)?.bookmarked;
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, bookmarked: next } : c)),
    );
    void fetch(`/api/words/${id}/bookmark`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookmarked: next }),
    });
  };

  return <WordCardList cards={items} onToggleBookmark={onToggleBookmark} />;
}
