import { NextRequest, NextResponse } from "next/server";
import { startParseJob } from "@/lib/parseJob";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text가 필요합니다." }, { status: 400 });
  }

  const jobId = await startParseJob(text);
  return NextResponse.json({ jobId });
}
