import { NextRequest, NextResponse } from "next/server";
import { recordAttempt } from "@/lib/quizAttempts";
import { answerWord } from "@/lib/wordSrs";

export async function POST(req: NextRequest) {
  const { wordId, direction, isCorrect } = await req.json();

  if (
    typeof wordId !== "number" ||
    typeof isCorrect !== "boolean" ||
    (direction !== "kanji_to_meaning" &&
      direction !== "reading_to_meaning" &&
      direction !== "meaning_to_word")
  ) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const attempt = await recordAttempt(wordId, direction, isCorrect);
  await answerWord(wordId, isCorrect);
  return NextResponse.json({ id: attempt.id });
}
