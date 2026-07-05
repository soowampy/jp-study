"use client";

import { useEffect, useState } from "react";

type Job = { status: string; processed: number; total: number };

export function EnrichProgress({ jobId }: { jobId: number }) {
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

  if (!job) return null;

  if (job.status === "running") {
    return (
      <p className="text-sm text-blue-600">
        유의어·예문 생성 중… {job.processed}/{job.total}
      </p>
    );
  }
  if (job.status === "done") {
    return (
      <p className="text-sm text-green-600">
        생성 완료 ✓ (단어 카드는 #6에서 표시됩니다)
      </p>
    );
  }
  return (
    <p role="alert" className="text-sm text-red-700">
      생성에 실패했습니다.
    </p>
  );
}
