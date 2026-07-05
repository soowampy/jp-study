import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuizSession } from "@/app/vocab-sets/[id]/quiz/_components/QuizSession";
import type { QuizQuestion } from "@/lib/quiz";

const q1: QuizQuestion = {
  wordId: 1,
  direction: "word_to_meaning",
  prompt: "水",
  promptReading: "みず",
  choices: ["물", "가을", "사과", "산"],
  answerIndex: 0,
  hint: null,
  choiceMeanings: null,
};
const q2: QuizQuestion = {
  wordId: 2,
  direction: "word_to_meaning",
  prompt: "秋",
  promptReading: "あき",
  choices: ["가을", "물", "사과", "산"],
  answerIndex: 0,
  hint: null,
  choiceMeanings: null,
};

describe("QuizSession", () => {
  it("진행 중 questions prop이 바뀌어도(서버 재렌더) 처음 세션을 유지한다", () => {
    const { rerender } = render(<QuizSession questions={[q1]} />);
    expect(screen.getByText("水")).toBeInTheDocument();

    // dev Fast Refresh 등으로 서버 컴포넌트가 재실행되어 새로 섞인 문제가 내려와도
    rerender(<QuizSession questions={[q2]} />);

    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.queryByText("秋")).not.toBeInTheDocument();
  });
});
