import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VocabSetList } from "@/app/_components/VocabSetList";

describe("VocabSetList", () => {
  it("빈 목록이면 안내 문구와 업로드 링크를 보여준다", () => {
    render(<VocabSetList sets={[]} />);

    expect(screen.getByText("단어장이 없습니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /업로드/ })).toHaveAttribute(
      "href",
      "/upload",
    );
  });

  it("단어장이 있으면 각 이름을 보여준다", () => {
    render(
      <VocabSetList
        sets={[
          { id: 1, name: "N3 총정리(와카메)" },
          { id: 2, name: "비즈니스 일본어" },
        ]}
      />,
    );

    expect(screen.getByText("N3 총정리(와카메)")).toBeInTheDocument();
    expect(screen.getByText("비즈니스 일본어")).toBeInTheDocument();
    // 빈 상태 문구는 나오지 않는다
    expect(screen.queryByText("단어장이 없습니다")).not.toBeInTheDocument();
  });
});
