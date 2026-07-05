import { describe, it, expect } from "vitest";
import { validateConfirm } from "@/lib/confirm";

describe("validateConfirm", () => {
  it("행이 0개면 최소 1개 안내를 반환한다", () => {
    expect(validateConfirm([])).toBe("최소 1개 단어가 필요합니다.");
  });

  it("reading이 빈 행이 있으면 후리가나 안내를 반환한다 (kanji=null 허용)", () => {
    const reason = validateConfirm([
      { kanji: null, reading: "", meaningKo: "물" },
    ]);
    expect(reason).toBeTruthy();
    expect(reason).toContain("후리가나");
  });

  it("모든 행이 유효하면 null을 반환한다", () => {
    expect(
      validateConfirm([{ kanji: "水", reading: "みず", meaningKo: "물" }]),
    ).toBeNull();
  });
});
