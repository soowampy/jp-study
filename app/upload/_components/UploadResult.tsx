import type { ExtractResult } from "@/lib/pdf";

export function UploadResult({ result }: { result: ExtractResult }) {
  if (!result.ok) {
    return (
      <p
        role="alert"
        className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {result.reason}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-600">{result.lineCount}줄 추출됨</p>
      <pre className="max-h-80 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs whitespace-pre-wrap">
        {result.text}
      </pre>
    </div>
  );
}
