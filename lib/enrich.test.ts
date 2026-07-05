import { describe, it, expect } from "vitest";
import { parseEnrichmentJson, chunkArray, enrichmentLabel } from "@/lib/enrich";

describe("parseEnrichmentJson", () => {
  it("JSON을 Enrichment[]로 파싱·매핑한다", () => {
    const raw = JSON.stringify([
      {
        synonyms: ["温まる", "ぬくもる"],
        examples: [
          { jp: "体が暖まった。", reading: "からだがあたたまった。", ko: "몸이 따뜻해졌다." },
        ],
      },
    ]);

    const list = parseEnrichmentJson(raw);

    expect(list).toHaveLength(1);
    expect(list[0].synonyms).toEqual(["温まる", "ぬくもる"]);
    expect(list[0].examples[0]).toEqual({
      jp: "体が暖まった。",
      reading: "からだがあたたまった。",
      ko: "몸이 따뜻해졌다.",
    });
  });

  it("배열이 아니거나 깨진 JSON이면 예외를 던진다", () => {
    expect(() => parseEnrichmentJson("깨짐")).toThrow();
    expect(() => parseEnrichmentJson('{"synonyms":[]}')).toThrow();
  });
});

describe("chunkArray", () => {
  it("배열을 size 단위 배치로 나눈다 (45 → 20,20,5)", () => {
    const arr = Array.from({ length: 45 }, (_, i) => i);

    const batches = chunkArray(arr, 20);

    expect(batches.map((b) => b.length)).toEqual([20, 20, 5]);
  });
});

describe("enrichmentLabel", () => {
  it("enrichFailed면 '생성 실패, 재시도'를 반환한다", () => {
    expect(enrichmentLabel({ enrichFailed: true })).toBe("생성 실패, 재시도");
  });

  it("실패가 아니면 null을 반환한다", () => {
    expect(enrichmentLabel({ enrichFailed: false })).toBeNull();
  });
});
