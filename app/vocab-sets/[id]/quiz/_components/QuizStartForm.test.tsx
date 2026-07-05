import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizStartForm } from "@/app/vocab-sets/[id]/quiz/_components/QuizStartForm";

describe("QuizStartForm", () => {
  it("방향·문제 수 선택이 시작 링크의 direction/count에 반영된다", () => {
    render(<QuizStartForm setId={3} />);

    // 기본값: 정방향, 20문제
    const link = screen.getByRole("link", { name: "퀴즈 시작" });
    expect(link).toHaveAttribute(
      "href",
      "/vocab-sets/3/quiz?direction=word_to_meaning&count=20",
    );

    fireEvent.click(screen.getByLabelText(/역방향/));
    fireEvent.click(screen.getByLabelText("10문제"));
    expect(link).toHaveAttribute(
      "href",
      "/vocab-sets/3/quiz?direction=meaning_to_word&count=10",
    );

    fireEvent.click(screen.getByLabelText("전체"));
    expect(link).toHaveAttribute(
      "href",
      "/vocab-sets/3/quiz?direction=meaning_to_word&count=all",
    );
  });
});
