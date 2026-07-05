import { extractText, getDocumentProxy } from "unpdf";

export const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export type ExtractResult =
  | { ok: true; text: string; lineCount: number }
  | { ok: false; reason: string };

/** 업로드 파일이 PDF·크기 제약을 만족하는지 검증. 통과하면 null, 아니면 거부 사유. */
export function validatePdfFile(file: {
  type: string;
  size: number;
}): string | null {
  if (file.type !== "application/pdf") {
    return "PDF 파일만 업로드할 수 있습니다.";
  }
  if (file.size > MAX_SIZE) {
    return "파일 크기는 10MB 이하여야 합니다.";
  }
  return null;
}

/** unpdf 로 텍스트를 추출. 비어 있으면 실패 사유를 담아 반환. */
export async function extractPdfText(data: Uint8Array): Promise<ExtractResult> {
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: true });
  const merged = Array.isArray(text) ? text.join("\n") : (text ?? "");

  if (!merged.trim()) {
    return { ok: false, reason: "텍스트를 추출할 수 없습니다." };
  }

  const lineCount = merged
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0).length;

  return { ok: true, text: merged, lineCount };
}
