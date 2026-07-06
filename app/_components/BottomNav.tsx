import Link from "next/link";

/** 모든 페이지 하단 고정 내비게이션: 홈·뒤로가기·앞으로가기. (#12) */
export function BottomNav({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-center gap-2 px-6">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          뒤로가기
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          홈
        </Link>
        <button
          onClick={onForward}
          disabled={!canGoForward}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          앞으로가기
        </button>
      </div>
    </nav>
  );
}
