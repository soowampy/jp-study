import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditableTitle } from "@/app/vocab-sets/[id]/_components/EditableTitle";

describe("EditableTitle", () => {
  it("제목 텍스트를 클릭하면 입력창으로 바뀐다", () => {
    render(<EditableTitle name="내 단어장" onSave={vi.fn()} />);

    fireEvent.click(screen.getByText("내 단어장"));

    expect(screen.getByDisplayValue("내 단어장")).toBeInTheDocument();
  });

  it("유효한 이름 입력 후 Enter 시 onSave(name)이 호출되고 보기 모드로 돌아간다", () => {
    const onSave = vi.fn();
    render(<EditableTitle name="내 단어장" onSave={onSave} />);

    fireEvent.click(screen.getByText("내 단어장"));
    const input = screen.getByDisplayValue("내 단어장");
    fireEvent.change(input, { target: { value: "새 이름" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSave).toHaveBeenCalledWith("새 이름");
    expect(screen.queryByDisplayValue("새 이름")).not.toBeInTheDocument();
  });

  it("빈 문자열이면 Enter를 눌러도 onSave가 호출되지 않는다", () => {
    const onSave = vi.fn();
    render(<EditableTitle name="내 단어장" onSave={onSave} />);

    fireEvent.click(screen.getByText("내 단어장"));
    const input = screen.getByDisplayValue("내 단어장");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSave).not.toHaveBeenCalled();
  });
});
