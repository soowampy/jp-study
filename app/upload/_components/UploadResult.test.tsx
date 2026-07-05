import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UploadResult } from "@/app/upload/_components/UploadResult";

describe("UploadResult", () => {
  it("성공 결과면 줄 수와 텍스트 미리보기를 보여준다", () => {
    render(
      <UploadResult
        result={{ ok: true, text: "暖まる\nあたたまる", lineCount: 2 }}
      />,
    );

    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/暖まる/)).toBeInTheDocument();
  });

  it("실패 결과면 사유를 alert 로 보여준다", () => {
    render(
      <UploadResult
        result={{ ok: false, reason: "PDF 파일만 업로드할 수 있습니다." }}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("PDF 파일만 업로드할 수 있습니다.");
  });
});
