import { prisma } from "@/lib/db";

/** 진행률을 서버가 소유하는 잡 레코드 (ADR-1). type: "parse" | "enrich". */
export function createJob(type: string, total: number, setId?: number) {
  return prisma.job.create({ data: { type, total, setId } });
}

export function getJob(id: number) {
  return prisma.job.findUnique({ where: { id } });
}

export function setProgress(id: number, processed: number) {
  return prisma.job.update({ where: { id }, data: { processed } });
}

export function completeJob(id: number, status: string, resultJson: string) {
  return prisma.job.update({
    where: { id },
    data: { status, resultJson },
  });
}
