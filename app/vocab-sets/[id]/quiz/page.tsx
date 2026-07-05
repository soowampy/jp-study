import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  buildQuizSession,
  MIN_QUIZ_WORDS,
  type QuizDirection,
} from "@/lib/quiz";
import { selectSessionWords } from "@/lib/srs";
import { QuizSession } from "@/app/vocab-sets/[id]/quiz/_components/QuizSession";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ direction?: string }>;
}) {
  const { id } = await params;
  const { direction } = await searchParams;
  const setId = Number(id);

  const set = await prisma.vocabSet.findUnique({ where: { id: setId } });
  if (!set) {
    return (
      <main className="mx-auto max-w-3xl p-8">단어장을 찾을 수 없습니다.</main>
    );
  }

  const words = await prisma.word.findMany({
    where: { setId },
    include: { srs: true },
    orderBy: { id: "asc" },
  });

  if (words.length < MIN_QUIZ_WORDS) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="mb-4">단어가 4개 이상이어야 합니다.</p>
        <Link href={`/vocab-sets/${setId}`} className="text-blue-600 underline">
          단어장으로 돌아가기
        </Link>
      </main>
    );
  }

  if (direction !== "word_to_meaning" && direction !== "meaning_to_word") {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="mb-6 text-2xl font-bold">{set.name} — 퀴즈</h1>
        <div className="flex flex-col gap-3">
          <Link
            href={`/vocab-sets/${setId}/quiz?direction=word_to_meaning`}
            className="rounded-md border border-gray-300 px-4 py-3 hover:bg-gray-50"
          >
            정방향 — 단어(漢字+후리가나) → 뜻
          </Link>
          <Link
            href={`/vocab-sets/${setId}/quiz?direction=meaning_to_word`}
            className="rounded-md border border-gray-300 px-4 py-3 hover:bg-gray-50"
          >
            역방향 — 뜻 → 단어
          </Link>
        </div>
      </main>
    );
  }

  const sessionWords = selectSessionWords(words, new Date());
  if (sessionWords.length === 0) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="mb-4">오늘 출제할 단어가 없습니다. (복습 대상·미학습 없음)</p>
        <Link href={`/vocab-sets/${setId}`} className="text-blue-600 underline">
          단어장으로 돌아가기
        </Link>
      </main>
    );
  }

  const questions = buildQuizSession(sessionWords, direction as QuizDirection, {
    pool: words,
  });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">{set.name} — 퀴즈</h1>
      <QuizSession questions={questions} />
    </main>
  );
}
