import { describe, it, expect } from "vitest";
import { parseWordsJson, chunkLines } from "@/lib/parse";

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

describe("chunkLines", () => {
  it("텍스트를 지정한 줄 수 단위 청크로 나눈다", () => {
    const text = "a\nb\nc\nd\ne";

    const chunks = chunkLines(text, 2);

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toBe("a\nb");
    expect(chunks[2]).toBe("e");
  });
});
