import { NextRequest, NextResponse } from "next/server";
import { confirmVocabSet } from "@/lib/vocabSet";
import { startEnrichmentJob } from "@/lib/enrichJob";

export async function POST(req: NextRequest) {
  const { name, words } = await req.json();

  if (!name || !Array.isArray(words) || words.length === 0) {
    return NextResponse.json(
      { error: "name과 words가 필요합니다." },
      { status: 400 },
    );
  }

  const { setId } = await confirmVocabSet(name, words);
  // 확정 즉시 유의어·예문 생성(Pass 2) 시작 (ADR-4)
  const jobId = await startEnrichmentJob(setId);
  return NextResponse.json({ setId, jobId });
}
