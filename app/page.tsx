import { prisma } from "@/lib/db";
import { computeDashboard, type SetProgress } from "@/lib/dashboard";
import { getLastStudiedAt, formatLastStudied } from "@/lib/vocabSet";
import { ProgressDashboard } from "@/app/_components/ProgressDashboard";
import { VocabSetList } from "@/app/_components/VocabSetList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sets = await prisma.vocabSet.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      words: { select: { srs: { select: { level: true, nextReviewDate: true } } } },
    },
  });

  const today = new Date();
  const allWords = sets.flatMap((s) => s.words);
  const stats = computeDashboard(allWords, today);
  const setProgress: SetProgress[] = sets.map((s) => ({
    id: s.id,
    name: s.name,
    totalWords: s.words.length,
    progressRate: computeDashboard(s.words, today).progressRate,
  }));
  const setsWithLastStudied = await Promise.all(
    sets.map(async (s) => ({
      id: s.id,
      name: s.name,
      lastStudied: formatLastStudied(await getLastStudiedAt(s.id), today),
    })),
  );

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">내 단어장</h1>
      {allWords.length > 0 && (
        <div className="mb-6">
          <ProgressDashboard stats={stats} sets={setProgress} />
        </div>
      )}
      <VocabSetList sets={setsWithLastStudied} />
    </main>
  );
}
