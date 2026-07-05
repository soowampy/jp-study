import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlobalHeader } from "@/app/_components/GlobalHeader";

describe("GlobalHeader", () => {
  it("홈 링크와 '새 단어장' 버튼이 보인다", () => {
    render(<GlobalHeader />);

    expect(screen.getByRole("link", { name: "JP 단어장" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "새 단어장" })).toHaveAttribute(
      "href",
      "/upload",
    );
  });
});
