export type DashboardWord = {
  srs: { level: number; nextReviewDate: Date } | null;
};

export type DashboardStats = {
  totalWords: number;
  progressRate: number; // (레벨 4+ 수 / 전체 수) × 100, 반올림
  dueToday: number; // nextReviewDate <= today
  unlearned: number; // SRS 없음
  levelCounts: number[]; // 레벨 0~5 분포 (미학습은 레벨 0)
};

export type SetProgress = {
  id: number;
  name: string;
  totalWords: number;
  progressRate: number;
};

/** 홈 대시보드 집계. 진도율·오늘 복습·미학습·레벨 분포를 한 번에 계산한다. (#9) */
export function computeDashboard(
  words: DashboardWord[],
  today: Date,
): DashboardStats {
  const levelCounts = [0, 0, 0, 0, 0, 0];
  let learned = 0; // 레벨 4+
  let dueToday = 0;
  let unlearned = 0;

  for (const word of words) {
    const level = word.srs?.level ?? 0;
    levelCounts[level]++;
    if (level >= 4) learned++;
    if (word.srs === null) unlearned++;
    else if (word.srs.nextReviewDate.getTime() <= today.getTime()) dueToday++;
  }

  return {
    totalWords: words.length,
    progressRate:
      words.length === 0 ? 0 : Math.round((learned / words.length) * 100),
    dueToday,
    unlearned,
    levelCounts,
  };
}
