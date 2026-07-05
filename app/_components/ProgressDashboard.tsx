import type { DashboardStats, SetProgress } from "@/lib/dashboard";

/** 홈 진도 대시보드: 진도율·오늘 복습/미학습·레벨 분포 막대·단어장별 진도. (#9) */
export function ProgressDashboard({
  stats,
  sets,
}: {
  stats: DashboardStats;
  sets: SetProgress[];
}) {
  const maxCount = Math.max(...stats.levelCounts, 1);

  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">진도율</p>
          <p className="text-3xl font-bold">{stats.progressRate}%</p>
          <p className="mt-1 text-xs text-gray-400">
            레벨 4 이상 / 전체 {stats.totalWords}개
          </p>
        </div>
        <div className="flex flex-col justify-center gap-1 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">오늘 복습 {stats.dueToday}개</p>
          <p className="text-sm text-gray-600">미학습 {stats.unlearned}개</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <p className="mb-3 text-sm font-semibold">레벨 분포</p>
        <ul className="flex flex-col gap-2">
          {stats.levelCounts.map((count, lv) => (
            <li key={lv} className="flex items-center gap-2">
              <span className="w-9 text-xs text-gray-500">Lv.{lv}</span>
              <div className="h-3 flex-1 rounded-sm bg-gray-100">
                <div
                  className="h-3 rounded-sm bg-blue-600"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs text-gray-600">
                {count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {sets.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-3 text-sm font-semibold">단어장별 진도</p>
          <ul className="flex flex-col gap-2">
            {sets.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className="flex-1 truncate text-sm">{s.name}</span>
                <div className="h-2 w-32 rounded-sm bg-gray-100">
                  <div
                    className="h-2 rounded-sm bg-blue-600"
                    style={{ width: `${s.progressRate}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm text-gray-600">
                  {s.progressRate}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
