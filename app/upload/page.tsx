"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExtractResult } from "@/lib/pdf";
import { UploadResult } from "@/app/upload/_components/UploadResult";

export default function UploadPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function startParse(text: string) {
    const res = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const { jobId } = await res.json();
    router.push(`/review/${jobId}`);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setResult((await res.json()) as ExtractResult);
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">PDF 업로드</h1>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-10 text-gray-500 hover:border-blue-400">
        <span>PDF 파일을 선택하세요 (최대 10MB)</span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {loading && <p className="mt-4 text-sm text-gray-500">추출 중…</p>}
      {result && (
        <div className="mt-6">
          <UploadResult result={result} />
          {result.ok && (
            <button
              onClick={() => startParse(result.text)}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              AI 파싱 시작
            </button>
          )}
        </div>
      )}
    </main>
  );
}
