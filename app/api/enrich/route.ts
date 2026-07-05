import { NextRequest, NextResponse } from "next/server";
import { startEnrichmentJob } from "@/lib/enrichJob";

export async function POST(req: NextRequest) {
  const { setId } = await req.json();

  if (typeof setId !== "number") {
    return NextResponse.json({ error: "setId가 필요합니다." }, { status: 400 });
  }

  const jobId = await startEnrichmentJob(setId);
  if (jobId === null) {
    return NextResponse.json({ error: "이미 생성 중입니다." }, { status: 409 });
  }
  return NextResponse.json({ jobId });
}
