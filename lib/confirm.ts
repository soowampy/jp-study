export type EditableWord = {
  kanji: string | null;
  reading: string;
  meaningKo: string;
};

/** 확정 가능 여부를 검증. 통과하면 null, 아니면 안내 문구. */
export function validateConfirm(words: EditableWord[]): string | null {
  if (words.length === 0) {
    return "최소 1개 단어가 필요합니다.";
  }
  if (words.some((w) => !w.reading.trim())) {
    return "모든 행의 후리가나를 입력해주세요.";
  }
  return null;
}

/** reading/뜻이 비어 사용자 확인이 필요한 행인지. (파싱 애매/실패 행 강조용) */
export function isRowIncomplete(word: EditableWord): boolean {
  return !word.reading.trim() || !word.meaningKo.trim();
}
