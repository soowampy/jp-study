import { NextRequest, NextResponse } from "next/server";
import { setBookmarked } from "@/lib/words";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { bookmarked } = await req.json();

  if (typeof bookmarked !== "boolean") {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  await setBookmarked(Number(id), bookmarked);
  return NextResponse.json({ ok: true });
}
