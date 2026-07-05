import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParseReviewTable } from "@/app/review/_components/ParseReviewTable";

describe("ParseReviewTable", () => {
  it("파싱된 행을 漢字/후리가나/뜻으로 보여준다", () => {
    render(
      <ParseReviewTable
        words={[
          { kanji: "暖まる", reading: "あたたまる", meaningKo: "따뜻해지다" },
          { kanji: null, reading: "あき", meaningKo: "가을" },
        ]}
      />,
    );

    expect(screen.getByText("暖まる")).toBeInTheDocument();
    expect(screen.getByText("あたたまる")).toBeInTheDocument();
    expect(screen.getByText("따뜻해지다")).toBeInTheDocument();
    // kana 단어(kanji=null)도 reading/뜻이 보인다
    expect(screen.getByText("あき")).toBeInTheDocument();
    expect(screen.getByText("가을")).toBeInTheDocument();
  });
});
