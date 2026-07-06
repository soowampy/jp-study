export type QuizDirection =
  | "kanji_to_meaning"
  | "reading_to_meaning"
  | "meaning_to_word";

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
  choiceMeanings: string[] | null; // 역방향 피드백용: 보기 순서대로 각 단어의 뜻 (#10)
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

/** 보기/정답에 쓰는 표시값. 한자→뜻·후리가나→뜻은 뜻, 뜻→단어는 漢字+후리가나 결합(kana면 후리가나만). */
function choiceLabel(word: QuizWord, direction: QuizDirection): string {
  if (direction === "meaning_to_word") {
    return word.kanji ? `${word.kanji} (${word.reading})` : word.reading;
  }
  return word.meaningKo;
}

/**
 * 4지선다 세션을 만든다. 최대 20문제, 문제 단어 중복 없음.
 * 오답 3개는 같은 단어장의 다른 단어에서 뽑는다. (#7)
 * 유형 3종(한자→뜻/후리가나→뜻/뜻→단어) — kanji_to_meaning은 kanji=null 단어를 문제 대상에서 제외한다. (#11)
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

  const eligible =
    direction === "kanji_to_meaning" ? words.filter((w) => w.kanji) : words;
  if (eligible.length === 0) {
    throw new Error("한자 단어가 없어 이 유형을 낼 수 없습니다");
  }

  // pool이 주어지면 words는 이미 우선순위로 선별된 세션 — 순서를 유지한다. (#8)
  const selected = opts.pool
    ? eligible.slice(0, size)
    : shuffle(eligible).slice(0, size);

  return selected.map((word) => {
    const wrong = shuffle(pool.filter((w) => w.id !== word.id)).slice(0, 3);
    const choiceWords = shuffle([word, ...wrong]);

    return {
      wordId: word.id,
      direction,
      prompt:
        direction === "kanji_to_meaning"
          ? (word.kanji as string)
          : direction === "reading_to_meaning"
            ? word.reading
            : word.meaningKo,
      promptReading: direction === "kanji_to_meaning" ? word.reading : null,
      choices: choiceWords.map((w) => choiceLabel(w, direction)),
      answerIndex: choiceWords.findIndex((w) => w.id === word.id),
      hint: word.examples?.[0]?.jp ?? word.synonyms?.[0] ?? null,
      choiceMeanings:
        direction === "meaning_to_word"
          ? choiceWords.map((w) => w.meaningKo)
          : null,
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
