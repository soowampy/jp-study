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
  hint: "水を飲む。",
};
const q2: QuizQuestion = {
  wordId: 2,
  direction: "word_to_meaning",
  prompt: "秋",
  promptReading: "あき",
  choices: ["가을", "물", "사과", "산"],
  answerIndex: 0,
  hint: null,
};

describe("QuizPlayer", () => {
  it("문제·보기 4개와 '힌트 보기'·'정답 보기' 버튼이 보인다", () => {
    render(<QuizPlayer questions={[q1, q2]} />);

    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.getByText("みず")).toBeInTheDocument();
    for (const choice of ["물", "가을", "사과", "산"]) {
      expect(screen.getByRole("button", { name: choice })).toBeInTheDocument();
    }
    expect(
      screen.getByRole("button", { name: "힌트 보기" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "정답 보기" }),
    ).toBeInTheDocument();
  });

  it("정답 선택 시 즉시 넘어가지 않고 '정답!'과 '다음' 버튼이 보이며 onAnswer가 호출된다", () => {
    const onAnswer = vi.fn();
    render(<QuizPlayer questions={[q1, q2]} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByRole("button", { name: "물" }));

    expect(onAnswer).toHaveBeenCalledWith(1, true);
    expect(screen.getByText("정답!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
    // 다음 문제로 즉시 넘어가지 않는다
    expect(screen.queryByText("秋")).not.toBeInTheDocument();
  });

  it("오답 선택 시 '오답'과 정답('정답: 물')이 노출된다", () => {
    const onAnswer = vi.fn();
    render(<QuizPlayer questions={[q1, q2]} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByRole("button", { name: "산" }));

    expect(onAnswer).toHaveBeenCalledWith(1, false);
    expect(screen.getByText("오답")).toBeInTheDocument();
    expect(screen.getByText("정답: 물")).toBeInTheDocument();
  });

  it("'다음' 클릭 시 다음 문제로 진행하고 마지막 문제 후 결과가 요약된다", () => {
    vi.useFakeTimers();
    render(<QuizPlayer questions={[q1, q2]} />);

    fireEvent.click(screen.getByRole("button", { name: "물" })); // q1 정답
    vi.advanceTimersByTime(300);
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("秋")).toBeInTheDocument();

    vi.advanceTimersByTime(300);
    fireEvent.click(screen.getByRole("button", { name: "가을" })); // q2 정답
    vi.advanceTimersByTime(300);
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText(/정답률/)).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/소요시간/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("전환 직후(250ms 이내)의 클릭은 무시된다 — 더블클릭/고스트 클릭 방지", () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    render(<QuizPlayer questions={[q1, q2]} onAnswer={onAnswer} />);

    // 답 선택 직후 같은 좌표에 온 '다음'이 곧바로 눌려도 무시된다
    fireEvent.click(screen.getByRole("button", { name: "물" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("정답!")).toBeInTheDocument(); // 아직 피드백 화면

    // 250ms 지난 뒤의 '다음'은 정상 동작
    vi.advanceTimersByTime(300);
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("秋")).toBeInTheDocument();

    // 문제 전환 직후의 보기 클릭도 무시된다 (의도치 않은 오답 방지)
    fireEvent.click(screen.getByRole("button", { name: "물" }));
    expect(onAnswer).toHaveBeenCalledTimes(1); // q1 답변 1건뿐
    expect(screen.queryByText("오답")).not.toBeInTheDocument();

    // 250ms 뒤에는 정상 제출
    vi.advanceTimersByTime(300);
    fireEvent.click(screen.getByRole("button", { name: "가을" }));
    expect(screen.getByText("정답!")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("'힌트 보기' 클릭 시 힌트가 표시되고, 힌트가 없으면 버튼이 비활성이다", () => {
    const first = render(<QuizPlayer questions={[q1, q2]} />);

    fireEvent.click(screen.getByRole("button", { name: "힌트 보기" }));
    expect(screen.getByText("水を飲む。")).toBeInTheDocument();

    first.unmount();
    render(<QuizPlayer questions={[q2]} />);
    expect(screen.getByRole("button", { name: "힌트 보기" })).toBeDisabled();
  });

  it("'정답 보기' 클릭 시 오답으로 기록되고 피드백 단계로 전환된다", () => {
    const onAnswer = vi.fn();
    render(<QuizPlayer questions={[q1, q2]} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }));

    expect(onAnswer).toHaveBeenCalledWith(1, false);
    expect(screen.getByText("정답: 물")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
  });
});
