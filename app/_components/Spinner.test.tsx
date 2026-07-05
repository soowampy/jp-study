import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "@/app/_components/Spinner";

describe("Spinner", () => {
  it("role=status와 '로딩 중' 라벨을 가진다", () => {
    render(<Spinner />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("로딩 중")).toBeInTheDocument();
  });
});
