import { prisma } from "@/lib/db";
import type { EditableWord } from "@/lib/confirm";

/** 확정된 단어 목록을 VocabSet + Word 로 저장한다. (검수 확정 → #5 enrichment 대상) */
export async function confirmVocabSet(
  name: string,
  words: EditableWord[],
): Promise<{ setId: number; wordCount: number }> {
  const set = await prisma.vocabSet.create({
    data: {
      name,
      totalWords: words.length,
      words: {
        create: words.map((w) => ({
          kanji: w.kanji,
          reading: w.reading,
          meaningKo: w.meaningKo,
        })),
      },
    },
    include: { words: true },
  });

  return { setId: set.id, wordCount: set.words.length };
}

/** 단어장 이름을 수정한다. 빈 이름은 거부. (#13) */
export async function renameVocabSet(id: number, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("이름을 입력해주세요.");
  }
  await prisma.vocabSet.update({ where: { id }, data: { name: trimmed } });
}

/** 단어장을 삭제한다. 소속 Word/WordSrs는 cascade로 함께 삭제된다. (#13) */
export async function deleteVocabSet(id: number): Promise<void> {
  await prisma.vocabSet.delete({ where: { id } });
}

/** 단어장 소속 단어들의 QuizAttempt 중 가장 최신 answeredAt. 기록 없으면 null. (#14) */
export async function getLastStudiedAt(setId: number): Promise<Date | null> {
  const words = await prisma.word.findMany({
    where: { setId },
    select: { id: true },
  });
  const wordIds = words.map((w) => w.id);
  if (wordIds.length === 0) return null;

  const agg = await prisma.quizAttempt.aggregate({
    where: { wordId: { in: wordIds } },
    _max: { answeredAt: true },
  });
  return agg._max.answeredAt;
}

/** 마지막 학습 날짜를 사람이 읽는 문구로 바꾼다. (#14) */
export function formatLastStudied(date: Date | null, today: Date): string {
  if (!date) return "학습 기록 없음";
  const days = Math.floor((today.getTime() - date.getTime()) / 86400000);
  if (days <= 0) return "오늘";
  return `${days}일 전`;
}
