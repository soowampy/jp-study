import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteVocabSetButton } from "@/app/vocab-sets/[id]/_components/DeleteVocabSetButton";

describe("DeleteVocabSetButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("confirm에서 확인하면 onDelete가 호출된다", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn();
    render(<DeleteVocabSetButton onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "단어장 삭제" }));

    expect(onDelete).toHaveBeenCalled();
  });

  it("confirm에서 취소하면 onDelete가 호출되지 않는다", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = vi.fn();
    render(<DeleteVocabSetButton onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "단어장 삭제" }));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
