import { NextRequest, NextResponse } from "next/server";
import { confirmVocabSet } from "@/lib/vocabSet";

export async function POST(req: NextRequest) {
  const { name, words } = await req.json();

  if (!name || !Array.isArray(words) || words.length === 0) {
    return NextResponse.json(
      { error: "name과 words가 필요합니다." },
      { status: 400 },
    );
  }

  const { setId } = await confirmVocabSet(name, words);
  return NextResponse.json({ setId });
}
