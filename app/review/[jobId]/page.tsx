"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewEditor } from "@/app/review/_components/ReviewEditor";
import type { EditableWord } from "@/lib/confirm";

type Job = {
  status: string;
  processed: number;
  total: number;
  resultJson: string | null;
};

export default function ReviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [name, setName] = useState("새 단어장");

  useEffect(() => {
    let stopped = false;
    async function poll() {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = (await res.json()) as Job;
      if (stopped) return;
      setJob(data);
      if (data.status === "running") setTimeout(poll, 1500);
    }
    poll();
    return () => {
      stopped = true;
    };
  }, [jobId]);

  async function handleConfirm(words: EditableWord[]) {
    const res = await fetch("/api/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, words }),
    });
    if (res.ok) router.push("/");
  }

  if (!job) {
    return <main className="mx-auto max-w-3xl p-8">불러오는 중…</main>;
  }

  const words: EditableWord[] = job.resultJson
    ? (JSON.parse(job.resultJson) as EditableWord[])
    : [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">파싱 검수</h1>

      {job.status === "running" && (
        <p className="mb-4 text-sm text-gray-500">
          파싱 중… {job.processed}/{job.total}
        </p>
      )}
      {job.status === "failed" && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          파싱에 실패했습니다.
        </p>
      )}

      {job.status === "done" && (
        <>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">단어장 이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1"
            />
          </label>
          <ReviewEditor initialWords={words} onConfirm={handleConfirm} />
        </>
      )}
    </main>
  );
}
