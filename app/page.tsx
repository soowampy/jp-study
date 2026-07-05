import { prisma } from "@/lib/db";
import { VocabSetList } from "@/app/_components/VocabSetList";

export default async function Home() {
  const sets = await prisma.vocabSet.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">내 단어장</h1>
      <VocabSetList sets={sets} />
    </main>
  );
}
