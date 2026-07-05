import { describe, it, expect } from "vitest";
import { parseWordsJson, chunkText } from "@/lib/parse";

describe("parseWordsJson", () => {
  it("JSON 배열을 ParsedWord[] 로 파싱·매핑한다", () => {
    const raw = JSON.stringify([
      { kanji: "暖まる", reading: "あたたまる", meaning_ko: "따뜻해지다" },
      { kanji: null, reading: "あき", meaning_ko: "가을" },
    ]);

    const words = parseWordsJson(raw);

    expect(words).toHaveLength(2);
    expect(words[0]).toEqual({
      kanji: "暖まる",
      reading: "あたたまる",
      meaningKo: "따뜻해지다",
    });
    expect(words[1].kanji).toBeNull();
  });

  it("```json 펜스가 있어도 파싱한다", () => {
    const raw = '```json\n[{"kanji":"水","reading":"みず","meaning_ko":"물"}]\n```';

    const words = parseWordsJson(raw);

    expect(words[0].meaningKo).toBe("물");
  });

  it("소스가 준 reading 값을 변형 없이 그대로 사용한다", () => {
    const raw = JSON.stringify([
      { kanji: "秋", reading: "あき", meaning_ko: "가을" },
    ]);

    const words = parseWordsJson(raw);

    expect(words[0].reading).toBe("あき");
  });

  it("배열이 아니거나 깨진 JSON이면 예외를 던진다", () => {
    expect(() => parseWordsJson("이건 JSON이 아님")).toThrow();
    expect(() => parseWordsJson('{"kanji":"水"}')).toThrow();
  });
});

describe("chunkText", () => {
  it("maxChars 이하 텍스트는 청크 1개로 둔다", () => {
    expect(chunkText("짧은 텍스트", 100)).toEqual(["짧은 텍스트"]);
  });

  it("여러 줄을 maxChars 이하로 그리디 병합한다", () => {
    // "aa\nbb"(5) 후 "cc"(2)
    expect(chunkText("aa\nbb\ncc", 5)).toEqual(["aa\nbb", "cc"]);
  });

  it("줄바꿈 없는 긴 텍스트도 여러 청크로 나눈다 (핵심: 진행률/출력 안전)", () => {
    const long = "a".repeat(250);

    const chunks = chunkText(long, 100);

    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(100);
    }
  });

  it("빈 텍스트는 빈 배열", () => {
    expect(chunkText("   ", 100)).toEqual([]);
  });
});
