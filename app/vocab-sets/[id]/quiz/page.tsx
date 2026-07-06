import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  buildQuizSession,
  MIN_QUIZ_WORDS,
  SESSION_SIZE,
  type QuizDirection,
} from "@/lib/quiz";
import { selectSessionWords, type QuizMode } from "@/lib/srs";
import { QuizSession } from "@/app/vocab-sets/[id]/quiz/_components/QuizSession";
import { QuizStartForm } from "@/app/vocab-sets/[id]/quiz/_components/QuizStartForm";

function parseJsonArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const MODE_EMPTY_MESSAGE: Record<QuizMode, string> = {
  all: "출제할 단어가 없습니다.",
  unmastered: "아직 못 외운 단어가 없습니다.",
  review: "오늘 복습할 단어가 없습니다. (복습 대상·미학습 없음)",
  bookmarked: "저장한 단어가 없습니다.",
};

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ direction?: string; count?: string; mode?: string }>;
}) {
  const { id } = await params;
  const { direction, count, mode } = await searchParams;
  const setId = Number(id);

  const set = await prisma.vocabSet.findUnique({ where: { id: setId } });
  if (!set) {
    return (
      <main className="mx-auto max-w-3xl p-6">단어장을 찾을 수 없습니다.</main>
    );
  }

  const words = await prisma.word.findMany({
    where: { setId },
    include: { srs: true },
    orderBy: { id: "asc" },
  });

  if (words.length < MIN_QUIZ_WORDS) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4">단어가 4개 이상이어야 합니다.</p>
        <Link href={`/vocab-sets/${setId}`} className="text-blue-600 underline">
          단어장으로 돌아가기
        </Link>
      </main>
    );
  }

  if (
    direction !== "kanji_to_meaning" &&
    direction !== "reading_to_meaning" &&
    direction !== "meaning_to_word"
  ) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-6 text-2xl font-bold">{set.name} — 퀴즈</h1>
        <QuizStartForm setId={setId} />
      </main>
    );
  }

  const size =
    count === "all" ? Infinity : count === "10" ? 10 : SESSION_SIZE;
  const quizMode: QuizMode =
    mode === "all" || mode === "unmastered" || mode === "bookmarked"
      ? mode
      : "review";

  const quizWords = words.map((w) => ({
    id: w.id,
    kanji: w.kanji,
    reading: w.reading,
    meaningKo: w.meaningKo,
    synonyms: parseJsonArray<string>(w.synonyms),
    examples: parseJsonArray<{ jp: string }>(w.examples),
    bookmarked: w.bookmarked,
    srs: w.srs,
  }));

  const sessionWords = selectSessionWords(quizWords, new Date(), size, quizMode);
  if (sessionWords.length === 0) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4">{MODE_EMPTY_MESSAGE[quizMode]}</p>
        <Link href={`/vocab-sets/${setId}`} className="text-blue-600 underline">
          단어장으로 돌아가기
        </Link>
      </main>
    );
  }

  let questions;
  try {
    questions = buildQuizSession(sessionWords, direction as QuizDirection, {
      pool: quizWords,
      size,
    });
  } catch (e) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4">{(e as Error).message}</p>
        <Link href={`/vocab-sets/${setId}`} className="text-blue-600 underline">
          단어장으로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{set.name} — 퀴즈</h1>
      <QuizSession questions={questions} />
    </main>
  );
}
