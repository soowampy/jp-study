"use client";

/** 단어장 삭제 버튼. confirm() 확인 후에만 onDelete를 호출한다. (#13) */
export function DeleteVocabSetButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={() => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
          onDelete();
        }
      }}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
    >
      단어장 삭제
    </button>
  );
}
