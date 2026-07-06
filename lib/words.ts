import { prisma } from "@/lib/db";

/** 단어 저장(북마크) 상태를 설정한다. (#11) */
export async function setBookmarked(
  wordId: number,
  bookmarked: boolean,
): Promise<void> {
  await prisma.word.update({ where: { id: wordId }, data: { bookmarked } });
}
