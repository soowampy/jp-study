import { SESSION_SIZE } from "@/lib/quiz";

export type SrsState = {
  level: number;
  nextReviewDate: Date;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: Date | null;
};

export type WordWithSrsRef = {
  srs: { level: number; nextReviewDate: Date; correctCount?: number } | null;
  bookmarked?: boolean;
};

/** 출제 방식 4종 (#11) */
export type QuizMode = "all" | "unmastered" | "review" | "bookmarked";

/** 레벨 0~5 복습 간격(일). Leitner 경량판 (#8) */
export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];

function addDays(date: Date, days: number): Date {
  const out = new Date(date);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 정·오답에 따라 SRS 상태를 갱신한다.
 * 정답: level=min(level+1,5), next=today+interval[level]. 오답: level=0, next=today.
 */
export function applyAnswer(
  current: SrsState | null,
  isCorrect: boolean,
  today: Date,
): SrsState {
  const base = current ?? {
    level: 0,
    nextReviewDate: today,
    correctCount: 0,
    wrongCount: 0,
    lastReviewedAt: null,
  };
  const level = isCorrect ? Math.min(base.level + 1, 5) : 0;

  return {
    level,
    nextReviewDate: isCorrect ? addDays(today, SRS_INTERVALS[level]) : today,
    correctCount: base.correctCount + (isCorrect ? 1 : 0),
    wrongCount: base.wrongCount + (isCorrect ? 0 : 1),
    lastReviewedAt: today,
  };
}

/**
 * 출제 대상을 고른다. mode 기본값 'review': 복습 대상(next<=today) → 미학습(SRS 없음) 순.
 * 복습일이 안 된 학습 단어는 제외, 최대 size개.
 * mode='all': 전체에서 무작위. mode='unmastered': correctCount=0(미학습 포함)만.
 * mode='bookmarked': 저장한 단어만. (#11)
 */
export function selectSessionWords<T extends WordWithSrsRef>(
  words: T[],
  today: Date,
  size: number = SESSION_SIZE,
  mode: QuizMode = "review",
): T[] {
  if (mode === "all") {
    return shuffle(words).slice(0, size);
  }
  if (mode === "unmastered") {
    return words
      .filter((w) => (w.srs?.correctCount ?? 0) === 0)
      .slice(0, size);
  }
  if (mode === "bookmarked") {
    return words.filter((w) => w.bookmarked).slice(0, size);
  }

  const review = words.filter(
    (w) => w.srs !== null && w.srs.nextReviewDate.getTime() <= today.getTime(),
  );
  const unlearned = words.filter((w) => w.srs === null);
  return [...review, ...unlearned].slice(0, size);
}
