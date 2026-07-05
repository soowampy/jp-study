/** 로딩 스피너. 페이지 전환·비동기 작업 대기 표시용. (R10) */
export function Spinner() {
  return (
    <div role="status" className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      <span className="sr-only">로딩 중</span>
    </div>
  );
}
