import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "일본어 단어 학습",
  description: "PDF 단어장으로 일본어 단어를 외우는 개인용 학습 도구",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
