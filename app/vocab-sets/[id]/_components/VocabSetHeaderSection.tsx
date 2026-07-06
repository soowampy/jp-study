"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditableTitle } from "@/app/vocab-sets/[id]/_components/EditableTitle";
import { DeleteVocabSetButton } from "@/app/vocab-sets/[id]/_components/DeleteVocabSetButton";

/** 단어장 상세 제목(수정) + 퀴즈 시작 + 삭제를 API에 연결하는 글루. (#13) */
export function VocabSetHeaderSection({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const router = useRouter();

  return (
    <div className="mb-2 flex items-center justify-between">
      <EditableTitle
        name={name}
        onSave={(newName) => {
          void fetch(`/api/vocab-sets/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName }),
          }).then(() => router.refresh());
        }}
      />
      <div className="flex items-center gap-2">
        <Link
          href={`/vocab-sets/${id}/quiz`}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
        >
          퀴즈 시작
        </Link>
        <DeleteVocabSetButton
          onDelete={() => {
            void fetch(`/api/vocab-sets/${id}`, { method: "DELETE" }).then(
              () => router.push("/"),
            );
          }}
        />
      </div>
    </div>
  );
}
