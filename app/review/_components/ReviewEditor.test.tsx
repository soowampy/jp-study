import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewEditor } from "@/app/review/_components/ReviewEditor";

const two = [
  { kanji: "水", reading: "みず", meaningKo: "물" },
  { kanji: "秋", reading: "あき", meaningKo: "가을" },
];

describe("ReviewEditor", () => {
  it("행 삭제를 누르면 행이 줄어든다", () => {
    render(<ReviewEditor initialWords={two} onConfirm={vi.fn()} />);
    expect(screen.getAllByPlaceholderText("후리가나")).toHaveLength(2);

    fireEvent.click(screen.getAllByText("삭제")[0]);

    expect(screen.getAllByPlaceholderText("후리가나")).toHaveLength(1);
  });

  it("행 추가를 누르면 빈 행이 늘어난다", () => {
    render(
      <ReviewEditor initialWords={[two[0]]} onConfirm={vi.fn()} />,
    );
    expect(screen.getAllByPlaceholderText("후리가나")).toHaveLength(1);

    fireEvent.click(screen.getByText("행 추가"));

    expect(screen.getAllByPlaceholderText("후리가나")).toHaveLength(2);
  });

  it("입력값을 바꾸면 그 값이 반영된다", () => {
    render(
      <ReviewEditor initialWords={[two[1]]} onConfirm={vi.fn()} />,
    );
    const readingInput = screen.getByPlaceholderText("후리가나") as HTMLInputElement;

    fireEvent.change(readingInput, { target: { value: "あきかぜ" } });

    expect(readingInput.value).toBe("あきかぜ");
  });

  it("미완성 행(빈 reading)은 '확인 필요'로 강조된다", () => {
    render(
      <ReviewEditor
        initialWords={[two[0], { kanji: null, reading: "", meaningKo: "물" }]}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getAllByText("확인 필요")).toHaveLength(1);
  });

  it("빈 reading 상태에서 확정하면 onConfirm이 호출되지 않고 안내가 뜬다", () => {
    const onConfirm = vi.fn();
    render(
      <ReviewEditor
        initialWords={[{ kanji: "水", reading: "", meaningKo: "물" }]}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText("확정"));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("후리가나");
  });

  it("유효한 상태에서 확정하면 onConfirm이 단어 목록으로 호출된다", () => {
    const onConfirm = vi.fn();
    render(<ReviewEditor initialWords={[two[0]]} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText("확정"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith([two[0]]);
  });
});
