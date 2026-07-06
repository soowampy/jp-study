import Link from "next/link";
import { prisma } from "@/lib/db";
import { EnrichProgress } from "@/app/vocab-sets/[id]/_components/EnrichProgress";
import { WordCardListSection } from "@/app/vocab-sets/[id]/_components/WordCardListSection";
import { toWordCard } from "@/lib/wordCards";

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
  const cards = words.map((w) => toWordCard(w, new Date()));

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{set.name}</h1>
        <Link
          href={`/vocab-sets/${setId}/quiz`}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
        >
          퀴즈 시작
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">{set._count.words}개 단어</p>
      {job && <EnrichProgress jobId={job.id} />}
      <div className="mt-6">
        <WordCardListSection cards={cards} />
      </div>
    </main>
  );
}
