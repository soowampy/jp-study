import Link from "next/link";

/** 모든 페이지 상단 고정 헤더: 홈 링크 + 새 단어장. (R10) */
export function GlobalHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <Link href="/" className="font-bold">
          JP 단어장
        </Link>
        <Link
          href="/upload"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          새 단어장
        </Link>
      </div>
    </header>
  );
}
