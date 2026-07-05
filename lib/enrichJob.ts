import { prisma } from "@/lib/db";
import {
  chunkArray,
  parseEnrichmentJson,
  type Enrichment,
} from "@/lib/enrich";
import { generateJson } from "@/lib/gemini";
import { runWithRetry } from "@/lib/jobRunner";
import { createJob, setProgress, completeJob } from "@/lib/jobs";

const BATCH_SIZE = 20;

type WordRow = { id: number; kanji: string | null; reading: string; meaningKo: string };

/** 단어에 유의어·예문을 저장하고 생성 완료로 표시. */
export function saveEnrichment(wordId: number, enrichment: Enrichment) {
  return prisma.word.update({
    where: { id: wordId },
    data: {
      synonyms: JSON.stringify(enrichment.synonyms),
      examples: JSON.stringify(enrichment.examples),
      enrichedAt: new Date(),
      enrichFailed: false,
    },
  });
}

/** 청크 최종 실패 시 해당 단어들을 "생성 실패, 재시도"로 표시. */
export function markEnrichFailed(wordIds: number[]) {
  return prisma.word.updateMany({
    where: { id: { in: wordIds } },
    data: { enrichFailed: true },
  });
}

/** 단어장에 실행 중인 enrichment 잡이 있는지. (중복 실행 차단용) */
export async function hasActiveEnrichJob(setId: number): Promise<boolean> {
  const count = await prisma.job.count({
    where: { type: "enrich", setId, status: "running" },
  });
  return count > 0;
}

function buildEnrichPrompt(words: WordRow[]): string {
  const list = words
    .map((w) => `${w.kanji ?? ""}(${w.reading}) = ${w.meaningKo}`)
    .join("\n");
  return [
    "다음 일본어 단어 각각에 유의어 1~3개와 예문 2개를 붙여 JSON 배열로만 출력하세요.",
    "배열 순서는 입력 순서와 정확히 같아야 하며, 길이도 같아야 합니다.",
    '각 항목: {"synonyms": string[], "examples": [{"jp": 일본어문장, "reading": 후리가나, "ko": 한국어번역}]}',
    "",
    "단어 목록:",
    list,
  ].join("\n");
}

/**
 * 확정된 단어장에 대해 enrichment 잡을 시작한다. 이미 실행 중이면 null.
 * 20개 배치로 Gemini 호출(최대 3회 재시도), 진행률은 폴링, 최종 실패 청크는 표시. (ADR-1 재사용)
 */
export async function startEnrichmentJob(setId: number): Promise<number | null> {
  if (await hasActiveEnrichJob(setId)) return null;

  const words = (await prisma.word.findMany({
    where: { setId },
    select: { id: true, kanji: true, reading: true, meaningKo: true },
  })) as WordRow[];
  const batches = chunkArray(words, BATCH_SIZE);
  const job = await createJob("enrich", batches.length, setId);

  void (async () => {
    await runWithRetry<WordRow[], never>(
      batches,
      async (batch) => {
        const raw = await generateJson(buildEnrichPrompt(batch));
        const enrichments = parseEnrichmentJson(raw);
        if (enrichments.length !== batch.length) {
          throw new Error("생성 개수가 단어 수와 일치하지 않습니다.");
        }
        for (let i = 0; i < batch.length; i++) {
          await saveEnrichment(batch[i].id, enrichments[i]);
        }
        return [];
      },
      {
        maxRetries: 3,
        onProgress: (processed) => setProgress(job.id, processed),
        onChunkFailed: (batch) => markEnrichFailed(batch.map((w) => w.id)),
      },
    );
    await completeJob(job.id, "done", "[]");
  })().catch(async () => {
    await completeJob(job.id, "failed", "[]");
  });

  return job.id;
}
