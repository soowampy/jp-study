import { describe, it, expect } from "vitest";
import {
  buildQuizSession,
  summarizeSession,
  type QuizWord,
} from "@/lib/quiz";

const words: QuizWord[] = [
  { id: 1, kanji: "水", reading: "みず", meaningKo: "물" },
  { id: 2, kanji: "秋", reading: "あき", meaningKo: "가을" },
  { id: 3, kanji: null, reading: "りんご", meaningKo: "사과" },
  { id: 4, kanji: "山", reading: "やま", meaningKo: "산" },
];

describe("buildQuizSession", () => {
  it("정방향: 문제=漢字+후리가나, choices[answerIndex]가 정답 뜻이다", () => {
    const questions = buildQuizSession(words, "word_to_meaning");
    const q = questions.find((q) => q.wordId === 1)!;

    expect(q.prompt).toBe("水");
    expect(q.promptReading).toBe("みず");
    expect(q.direction).toBe("word_to_meaning");
    expect(q.choices).toHaveLength(4);
    expect(q.choices[q.answerIndex]).toBe("물");
  });

  it("정방향: 오답 3개는 같은 단어장의 다른 단어 뜻이고 중복이 없다", () => {
    const questions = buildQuizSession(words, "word_to_meaning");
    const q = questions.find((q) => q.wordId === 1)!;

    const allMeanings = words.map((w) => w.meaningKo);
    for (const choice of q.choices) {
      expect(allMeanings).toContain(choice);
    }
    expect(new Set(q.choices).size).toBe(4);
  });

  it("kana 단어(kanji null): 문제=reading, promptReading은 null이다", () => {
    const questions = buildQuizSession(words, "word_to_meaning");
    const q = questions.find((q) => q.wordId === 3)!;

    expect(q.prompt).toBe("りんご");
    expect(q.promptReading).toBeNull();
  });

  it("역방향: 문제=뜻, 보기=단어 표기, choices[answerIndex]가 정답 단어다", () => {
    const questions = buildQuizSession(words, "meaning_to_word");
    const q = questions.find((q) => q.wordId === 1)!;

    expect(q.prompt).toBe("물");
    expect(q.promptReading).toBeNull();
    expect(q.direction).toBe("meaning_to_word");
    expect(q.choices).toHaveLength(4);
    expect(q.choices[q.answerIndex]).toBe("水");

    const labels = words.map((w) => w.kanji ?? w.reading);
    for (const choice of q.choices) {
      expect(labels).toContain(choice);
    }
  });

  it("단어가 4개 미만이면 '단어가 4개 이상이어야 합니다' 에러를 던진다", () => {
    expect(() => buildQuizSession(words.slice(0, 3), "word_to_meaning")).toThrow(
      "단어가 4개 이상이어야 합니다",
    );
  });

  it("단어 25개면 20문제만 출제되고 문제 단어가 중복되지 않는다", () => {
    const many: QuizWord[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      kanji: `漢${i}`,
      reading: `よみ${i}`,
      meaningKo: `뜻${i}`,
    }));

    const questions = buildQuizSession(many, "word_to_meaning");

    expect(questions).toHaveLength(20);
    expect(new Set(questions.map((q) => q.wordId)).size).toBe(20);
  });

  it("단어가 20개 미만이면 있는 만큼만 출제된다", () => {
    const five: QuizWord[] = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      kanji: `漢${i}`,
      reading: `よみ${i}`,
      meaningKo: `뜻${i}`,
    }));

    const questions = buildQuizSession(five, "word_to_meaning");

    expect(questions).toHaveLength(5);
  });
});

describe("buildQuizSession — pool 옵션 (#8)", () => {
  it("세션 단어 순서를 유지하고 오답 보기는 pool에서 뽑는다", () => {
    const session = [words[1], words[0]]; // 우선순위대로 정렬된 2개

    const questions = buildQuizSession(session, "word_to_meaning", {
      pool: words,
    });

    expect(questions.map((q) => q.wordId)).toEqual([2, 1]);
    for (const q of questions) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
    }
  });
});

describe("summarizeSession", () => {
  const answers = [
    { wordId: 1, isCorrect: true },
    { wordId: 2, isCorrect: false },
    { wordId: 3, isCorrect: true },
    { wordId: 4, isCorrect: false },
  ];

  it("정답률: 4문제 중 2개 정답이면 accuracy=50", () => {
    const summary = summarizeSession(
      answers,
      new Date("2026-07-06T10:00:00Z"),
      new Date("2026-07-06T10:01:30Z"),
    );

    expect(summary.total).toBe(4);
    expect(summary.correct).toBe(2);
    expect(summary.accuracy).toBe(50);
  });

  it("소요시간: startedAt/endedAt 차이를 초 단위로 계산한다", () => {
    const summary = summarizeSession(
      answers,
      new Date("2026-07-06T10:00:00Z"),
      new Date("2026-07-06T10:01:30Z"),
    );

    expect(summary.durationSec).toBe(90);
  });

  it("틀린 단어 목록: 오답 처리된 wordId 목록을 반환한다", () => {
    const summary = summarizeSession(
      answers,
      new Date("2026-07-06T10:00:00Z"),
      new Date("2026-07-06T10:01:30Z"),
    );

    expect(summary.wrongWordIds).toEqual([2, 4]);
  });
});
