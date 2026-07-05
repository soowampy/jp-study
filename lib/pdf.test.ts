import { describe, it, expect, vi, beforeEach } from "vitest";

// unpdf 는 서버 전용 라이브러리 → 실제 PDF 없이 추출 래퍼 로직만 검증하기 위해 목킹.
vi.mock("unpdf", () => ({
  getDocumentProxy: vi.fn(async () => ({})),
  extractText: vi.fn(),
}));

import { validatePdfFile, extractPdfText, MAX_SIZE } from "@/lib/pdf";
import { extractText } from "unpdf";

describe("validatePdfFile", () => {
  it("PDF 타입이고 10MB 이하이면 null(에러 없음)을 반환한다", () => {
    expect(
      validatePdfFile({ type: "application/pdf", size: 5 * 1024 * 1024 }),
    ).toBeNull();
  });

  it("PDF가 아니면 거부 사유를 반환한다", () => {
    const reason = validatePdfFile({ type: "image/png", size: 1000 });
    expect(reason).toBeTruthy();
    expect(reason).toContain("PDF");
  });

  it("10MB를 초과하면 거부 사유를 반환한다", () => {
    const reason = validatePdfFile({
      type: "application/pdf",
      size: MAX_SIZE + 1,
    });
    expect(reason).toBeTruthy();
    expect(reason).toContain("10MB");
  });
});

describe("extractPdfText", () => {
  beforeEach(() => {
    vi.mocked(extractText).mockReset();
  });

  it("텍스트가 있으면 ok 와 줄 수를 반환한다", async () => {
    vi.mocked(extractText).mockResolvedValue({
      totalPages: 1,
      text: "暖まる\nあたたまる\n따뜻해지다",
    } as never);

    const result = await extractPdfText(new Uint8Array([1, 2, 3]));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lineCount).toBe(3);
      expect(result.text).toContain("暖まる");
    }
  });

  it("추출 텍스트가 비면 실패 사유를 반환한다", async () => {
    vi.mocked(extractText).mockResolvedValue({
      totalPages: 1,
      text: "   \n  ",
    } as never);

    const result = await extractPdfText(new Uint8Array([1, 2, 3]));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("텍스트를 추출할 수 없습니다.");
    }
  });
});
