import { NextRequest, NextResponse } from "next/server";
import { renameVocabSet, deleteVocabSet } from "@/lib/vocabSet";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { name } = await req.json();

  if (typeof name !== "string") {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    await renameVocabSet(Number(id), name);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteVocabSet(Number(id));
  return NextResponse.json({ ok: true });
}
