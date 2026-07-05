import { describe, it, expect, afterAll } from "vitest";
import { createJob, getJob, setProgress } from "@/lib/jobs";
import { prisma } from "@/lib/db";

describe("jobs 라운드트립", () => {
  const createdIds: number[] = [];

  afterAll(async () => {
    for (const id of createdIds) {
      await prisma.job.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("createJob → getJob 이 total/processed/status 를 반환하고 setProgress 가 갱신한다", async () => {
    const job = await createJob("parse", 10);
    createdIds.push(job.id);

    const loaded = await getJob(job.id);
    expect(loaded?.total).toBe(10);
    expect(loaded?.processed).toBe(0);
    expect(loaded?.status).toBe("running");

    await setProgress(job.id, 4);
    const updated = await getJob(job.id);
    expect(updated?.processed).toBe(4);
  });
});
