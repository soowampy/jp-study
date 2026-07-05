import { NextRequest, NextResponse } from "next/server";
import { validatePdfFile, extractPdfText } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, reason: "파일이 없습니다." },
      { status: 400 },
    );
  }

  const invalid = validatePdfFile({ type: file.type, size: file.size });
  if (invalid) {
    return NextResponse.json({ ok: false, reason: invalid }, { status: 400 });
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const result = await extractPdfText(data);

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
