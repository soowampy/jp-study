import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WordCardList } from "@/app/vocab-sets/[id]/_components/WordCardList";
import type { WordCard } from "@/lib/wordCards";

function card(overrides: Partial<WordCard>): WordCard {
  return {
    id: 0,
    kanji: null,
    reading: "",
    meaningKo: "",
    synonyms: [],
    examples: [],
    enrichFailed: false,
    bookmarked: false,
    level: 0,
    needsReview: false,
    unlearned: true,
    ...overrides,
  };
}

const mizu = card({
  id: 1,
  kanji: "水",
  reading: "みず",
  meaningKo: "물",
  synonyms: ["お冷"],
  examples: [{ jp: "水を飲む", reading: "みずをのむ", ko: "물을 마신다" }],
  level: 3,
  needsReview: true,
  unlearned: false,
});
const aki = card({
  id: 2,
  kanji: "秋",
  reading: "あき",
  meaningKo: "가을",
  level: 0,
  needsReview: false,
  unlearned: true,
});

describe("WordCardList", () => {
  it("카드에 漢字/후리가나/뜻/유의어/예문이 보인다", () => {
    render(<WordCardList cards={[mizu]} />);

    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.getByText("みず")).toBeInTheDocument();
    expect(screen.getByText("물")).toBeInTheDocument();
    expect(screen.getByText("お冷")).toBeInTheDocument();
    expect(screen.getByText("水を飲む")).toBeInTheDocument();
    expect(screen.getByText("물을 마신다")).toBeInTheDocument();
  });

  it("각 카드에 SRS 레벨 뱃지가 표시된다", () => {
    render(<WordCardList cards={[mizu, aki]} />);

    expect(screen.getByText("Lv.3")).toBeInTheDocument();
    expect(screen.getByText("Lv.0")).toBeInTheDocument();
  });

  it("생성 실패 단어에는 '생성 실패, 재시도'가 표시된다", () => {
    render(<WordCardList cards={[card({ ...aki, enrichFailed: true })]} />);

    expect(screen.getByText("생성 실패, 재시도")).toBeInTheDocument();
  });

  it("검색어를 입력하면 일치하는 카드만 남는다", () => {
    render(<WordCardList cards={[mizu, aki]} />);

    fireEvent.change(screen.getByPlaceholderText("검색"), {
      target: { value: "가을" },
    });

    expect(screen.getByText("秋")).toBeInTheDocument();
    expect(screen.queryByText("水")).not.toBeInTheDocument();
  });

  it("'복습필요' 필터를 누르면 next_review_date <= today 카드만 남는다", () => {
    render(<WordCardList cards={[mizu, aki]} />);

    fireEvent.click(screen.getByText("복습필요"));

    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.queryByText("秋")).not.toBeInTheDocument();
  });

  it("'미학습' 필터를 누르면 미학습 카드만 남는다", () => {
    render(<WordCardList cards={[mizu, aki]} />);

    fireEvent.click(screen.getByText("미학습"));

    expect(screen.getByText("秋")).toBeInTheDocument();
    expect(screen.queryByText("水")).not.toBeInTheDocument();
  });

  it("레벨 필터를 고르면 그 레벨 카드만 남는다", () => {
    render(<WordCardList cards={[mizu, aki]} />);

    fireEvent.change(screen.getByLabelText("레벨 필터"), {
      target: { value: "3" },
    });

    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.queryByText("秋")).not.toBeInTheDocument();
  });

  it("필터 결과가 없으면 빈 상태 안내가 보인다", () => {
    render(<WordCardList cards={[mizu, aki]} />);

    fireEvent.change(screen.getByPlaceholderText("검색"), {
      target: { value: "없는말" },
    });

    expect(screen.getByText("일치하는 단어가 없습니다")).toBeInTheDocument();
  });

  it("저장 토글 버튼을 누르면 onToggleBookmark(id)가 호출된다 (#11)", () => {
    const onToggleBookmark = vi.fn();
    render(
      <WordCardList
        cards={[mizu, aki]}
        onToggleBookmark={onToggleBookmark}
      />,
    );

    const toggles = screen.getAllByRole("button", { name: "저장" });
    fireEvent.click(toggles[0]);

    expect(onToggleBookmark).toHaveBeenCalledWith(mizu.id);
  });

  it("저장된 카드는 저장 버튼이 aria-pressed=true다 (#11)", () => {
    render(
      <WordCardList cards={[{ ...mizu, bookmarked: true }, aki]} />,
    );

    const toggles = screen.getAllByRole("button", { name: "저장" });

    expect(toggles[0]).toHaveAttribute("aria-pressed", "true");
    expect(toggles[1]).toHaveAttribute("aria-pressed", "false");
  });

  it("'저장됨' 필터를 누르면 저장된 카드만 남는다 (#11)", () => {
    render(
      <WordCardList cards={[{ ...mizu, bookmarked: true }, aki]} />,
    );

    fireEvent.click(screen.getByText("저장됨"));

    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.queryByText("秋")).not.toBeInTheDocument();
  });
});
