"use client";

import { use, useEffect, useState } from "react";
import { ParseReviewTable } from "@/app/review/_components/ParseReviewTable";
import type { ParsedWord } from "@/lib/parse";

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
  const [job, setJob] = useState<Job | null>(null);

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

  if (!job) {
    return <main className="mx-auto max-w-3xl p-8">불러오는 중…</main>;
  }

  const words: ParsedWord[] = job.resultJson
    ? (JSON.parse(job.resultJson) as ParsedWord[])
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

      {words.length > 0 && <ParseReviewTable words={words} />}
    </main>
  );
}
