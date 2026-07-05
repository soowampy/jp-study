import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizPlayer } from "@/app/vocab-sets/[id]/quiz/_components/QuizPlayer";
import type { QuizQuestion } from "@/lib/quiz";

const q1: QuizQuestion = {
  wordId: 1,
  direction: "word_to_meaning",
  prompt: "水",
  promptReading: "みず",
  choices: ["물", "가을", "사과", "산"],
  answerIndex: 0,
};
const q2: QuizQuestion = {
  wordId: 2,
  direction: "word_to_meaning",
  prompt: "秋",
  promptReading: "あき",
  choices: ["가을", "물", "사과", "산"],
  answerIndex: 0,
};

describe("QuizPlayer", () => {
  it("문제(漢字+후리가나)와 보기 버튼 4개가 보인다", () => {
    render(<QuizPlayer questions={[q1, q2]} />);

    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.getByText("みず")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "물" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "가을" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "사과" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "산" })).toBeInTheDocument();
  });

  it("정답을 클릭하면 onAnswer(wordId, true)가 호출되고 다음 문제로 넘어간다", () => {
    const onAnswer = vi.fn();
    render(<QuizPlayer questions={[q1, q2]} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByRole("button", { name: "물" }));

    expect(onAnswer).toHaveBeenCalledWith(1, true);
    expect(screen.getByText("秋")).toBeInTheDocument();
  });

  it("오답을 클릭하면 onAnswer(wordId, false)가 호출된다", () => {
    const onAnswer = vi.fn();
    render(<QuizPlayer questions={[q1, q2]} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByRole("button", { name: "산" }));

    expect(onAnswer).toHaveBeenCalledWith(1, false);
  });

  it("마지막 문제 후 정답률·소요시간·틀린 단어 목록이 요약된다", () => {
    render(<QuizPlayer questions={[q1, q2]} />);

    fireEvent.click(screen.getByRole("button", { name: "물" })); // q1 정답
    fireEvent.click(screen.getByRole("button", { name: "사과" })); // q2 오답

    expect(screen.getByText(/정답률/)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    expect(screen.getByText(/소요시간/)).toBeInTheDocument();
    // 틀린 단어(秋)가 요약에 보인다
    expect(screen.getByText(/秋/)).toBeInTheDocument();
  });
});
