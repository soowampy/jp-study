import { prisma } from "@/lib/db";
import { EnrichProgress } from "@/app/vocab-sets/[id]/_components/EnrichProgress";
import { WordCardListSection } from "@/app/vocab-sets/[id]/_components/WordCardListSection";
import { VocabSetHeaderSection } from "@/app/vocab-sets/[id]/_components/VocabSetHeaderSection";
import { toWordCard } from "@/lib/wordCards";
import { getLastStudiedAt, formatLastStudied } from "@/lib/vocabSet";

export default async function VocabSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const setId = Number(id);

  const set = await prisma.vocabSet.findUnique({
    where: { id: setId },
    include: { _count: { select: { words: true } } },
  });

  if (!set) {
    return (
      <main className="mx-auto max-w-3xl p-8">단어장을 찾을 수 없습니다.</main>
    );
  }

  const job = await prisma.job.findFirst({
    where: { type: "enrich", setId },
    orderBy: { id: "desc" },
  });

  const words = await prisma.word.findMany({
    where: { setId },
    include: { srs: true },
    orderBy: { id: "asc" },
  });
  const today = new Date();
  const cards = words.map((w) => toWordCard(w, today));
  const lastStudied = formatLastStudied(await getLastStudiedAt(setId), today);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <VocabSetHeaderSection id={setId} name={set.name} />
      <p className="mb-6 text-sm text-gray-500">
        {set._count.words}개 단어 · 마지막 학습: {lastStudied}
      </p>
      {job && <EnrichProgress jobId={job.id} />}
      <div className="mt-6">
        <WordCardListSection cards={cards} />
      </div>
    </main>
  );
}
