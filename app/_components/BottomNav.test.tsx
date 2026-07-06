import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/app/_components/BottomNav";

describe("BottomNav", () => {
  it("홈·뒤로가기·앞으로가기 3개 버튼이 보인다", () => {
    render(
      <BottomNav
        canGoBack={true}
        canGoForward={true}
        onBack={vi.fn()}
        onForward={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "홈" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "뒤로가기" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "앞으로가기" }),
    ).toBeInTheDocument();
  });

  it("canGoBack=false면 뒤로가기 버튼이 비활성화된다", () => {
    render(
      <BottomNav
        canGoBack={false}
        canGoForward={true}
        onBack={vi.fn()}
        onForward={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "뒤로가기" })).toBeDisabled();
  });

  it("canGoForward=false면 앞으로가기 버튼이 비활성화된다", () => {
    render(
      <BottomNav
        canGoBack={true}
        canGoForward={false}
        onBack={vi.fn()}
        onForward={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "앞으로가기" })).toBeDisabled();
  });

  it("홈 버튼은 '/'로 이동하는 링크다", () => {
    render(
      <BottomNav
        canGoBack={true}
        canGoForward={true}
        onBack={vi.fn()}
        onForward={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: "홈" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
