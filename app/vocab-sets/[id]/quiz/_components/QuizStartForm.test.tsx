import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizStartForm } from "@/app/vocab-sets/[id]/quiz/_components/QuizStartForm";

describe("QuizStartForm", () => {
  it("유형·문제 수·출제 방식 선택이 시작 링크 href의 direction/count/mode에 반영된다", () => {
    render(<QuizStartForm setId={3} />);

    // 기본값: 한자→뜻, 20문제, 복습 우선
    const link = screen.getByRole("link", { name: "퀴즈 시작" });
    expect(link).toHaveAttribute(
      "href",
      "/vocab-sets/3/quiz?direction=kanji_to_meaning&count=20&mode=review",
    );

    fireEvent.click(screen.getByLabelText(/후리가나→뜻/));
    fireEvent.click(screen.getByLabelText("10문제"));
    fireEvent.click(screen.getByLabelText(/정답 제외/));
    expect(link).toHaveAttribute(
      "href",
      "/vocab-sets/3/quiz?direction=reading_to_meaning&count=10&mode=unmastered",
    );

    fireEvent.click(screen.getByLabelText(/뜻→단어/));
    fireEvent.click(screen.getByLabelText("전체"));
    fireEvent.click(screen.getByLabelText(/저장 단어만/));
    expect(link).toHaveAttribute(
      "href",
      "/vocab-sets/3/quiz?direction=meaning_to_word&count=all&mode=bookmarked",
    );

    fireEvent.click(screen.getByLabelText(/전체 랜덤/));
    expect(link).toHaveAttribute(
      "href",
      "/vocab-sets/3/quiz?direction=meaning_to_word&count=all&mode=all",
    );
  });
});
