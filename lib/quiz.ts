export type QuizDirection = "word_to_meaning" | "meaning_to_word";

export type QuizWord = {
  id: number;
  kanji: string | null;
  reading: string;
  meaningKo: string;
  synonyms?: string[];
  examples?: { jp: string }[];
};

export type QuizQuestion = {
  wordId: number;
  direction: QuizDirection;
  prompt: string;
  promptReading: string | null;
  choices: string[];
  answerIndex: number;
  hint: string | null; // 예문 jp 우선, 없으면 유의어 (#10)
};

export type QuizAnswer = { wordId: number; isCorrect: boolean };

export type QuizSummary = {
  total: number;
  correct: number;
  accuracy: number;
  durationSec: number;
  wrongWordIds: number[];
};

export const MIN_QUIZ_WORDS = 4;
export const SESSION_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 보기/정답에 쓰는 표시값. 정방향은 뜻, 역방향은 단어 표기(漢字 없으면 reading). */
function choiceLabel(word: QuizWord, direction: QuizDirection): string {
  return direction === "word_to_meaning"
    ? word.meaningKo
    : (word.kanji ?? word.reading);
}

/**
 * 4지선다 세션을 만든다. 최대 20문제, 문제 단어 중복 없음.
 * 오답 3개는 같은 단어장의 다른 단어에서 뽑는다. (#7)
 */
export function buildQuizSession(
  words: QuizWord[],
  direction: QuizDirection,
  opts: { pool?: QuizWord[]; size?: number } = {},
): QuizQuestion[] {
  const pool = opts.pool ?? words;
  const size = opts.size ?? SESSION_SIZE;
  if (pool.length < MIN_QUIZ_WORDS) {
    throw new Error("단어가 4개 이상이어야 합니다");
  }

  // pool이 주어지면 words는 이미 우선순위로 선별된 세션 — 순서를 유지한다. (#8)
  const selected = opts.pool
    ? words.slice(0, size)
    : shuffle(words).slice(0, size);

  return selected.map((word) => {
    const wrong = shuffle(pool.filter((w) => w.id !== word.id))
      .slice(0, 3)
      .map((w) => choiceLabel(w, direction));
    const answer = choiceLabel(word, direction);
    const choices = shuffle([answer, ...wrong]);

    return {
      wordId: word.id,
      direction,
      prompt:
        direction === "word_to_meaning"
          ? (word.kanji ?? word.reading)
          : word.meaningKo,
      promptReading:
        direction === "word_to_meaning" && word.kanji ? word.reading : null,
      choices,
      answerIndex: choices.indexOf(answer),
      hint: word.examples?.[0]?.jp ?? word.synonyms?.[0] ?? null,
    };
  });
}

/** 세션 답안을 정답률·소요시간·틀린 단어로 요약한다. (#7 AC4) */
export function summarizeSession(
  answers: QuizAnswer[],
  startedAt: Date,
  endedAt: Date,
): QuizSummary {
  const correct = answers.filter((a) => a.isCorrect).length;
  return {
    total: answers.length,
    correct,
    accuracy: Math.round((correct / answers.length) * 100),
    durationSec: Math.round((endedAt.getTime() - startedAt.getTime()) / 1000),
    wrongWordIds: answers.filter((a) => !a.isCorrect).map((a) => a.wordId),
  };
}
