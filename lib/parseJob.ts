import { chunkText, parseWordsJson, type ParsedWord } from "@/lib/parse";
import { generateJson, GEMINI_MIN_CALL_INTERVAL_MS } from "@/lib/gemini";
import { runWithRetry } from "@/lib/jobRunner";
import { createJob, setProgress, completeJob } from "@/lib/jobs";

const MAX_CHARS_PER_CHUNK = 1500;

function buildParsePrompt(chunk: string): string {
  return [
    "다음 텍스트에서 일본어 단어를 추출해 JSON 배열로만 출력하세요.",
    '각 항목은 {"kanji": 한자표기 또는 null, "reading": 후리가나, "meaning_ko": 한국어 뜻} 형식입니다.',
    "후리가나 컬럼이 있으면 그 값을 reading으로 그대로 사용하고, kana 단어는 kanji를 null로 두세요.",
    "섹션헤더(【】), 예문(☀), 페이지헤더는 제외하세요.",
    "",
    "텍스트:",
    chunk,
  ].join("\n");
}

/**
 * 파싱 잡을 시작한다. 잡을 만들고 즉시 jobId를 반환하며, 청크 처리는 서버 백그라운드로
 * 진행하면서 진행률을 DB에 기록한다. 클라이언트는 GET /api/jobs/:id 로 폴링한다. (ADR-1)
 */
export async function startParseJob(text: string): Promise<number> {
  const chunks = chunkText(text, MAX_CHARS_PER_CHUNK);
  const job = await createJob("parse", chunks.length);

  void (async () => {
    const { results, failedChunks, lastError } = await runWithRetry<string, ParsedWord>(
      chunks,
      async (chunk) => parseWordsJson(await generateJson(buildParsePrompt(chunk))),
      {
        maxRetries: 3,
        onProgress: (processed) => setProgress(job.id, processed),
        minCallIntervalMs: GEMINI_MIN_CALL_INTERVAL_MS,
      },
    );
    const status =
      results.length === 0 && failedChunks > 0 ? "failed" : "done";
    await completeJob(job.id, status, JSON.stringify(results), lastError);
  })().catch(async (error) => {
    const message = error instanceof Error ? error.message : String(error);
    await completeJob(job.id, "failed", "[]", message);
  });

  return job.id;
}
