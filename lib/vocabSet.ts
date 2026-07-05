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
