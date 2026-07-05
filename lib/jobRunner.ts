/**
 * 429(rate limit) 에러에서 재시도 대기 시간(ms)을 계산한다.
 * 서버가 "retry in Ns"를 제시하면 그 값 + 1초 버퍼, 힌트가 없으면 20초.
 * 429가 아니면 0 (즉시 재시도).
 */
export function retryDelayMs(error: unknown): number {
  const status = (error as { status?: number } | null)?.status;
  if (status !== 429) return 0;

  const message = error instanceof Error ? error.message : String(error);
  const hint = message.match(/retry in ([\d.]+)\s*s/i);
  if (hint) return Math.ceil(Number(hint[1]) * 1000) + 1000;
  return 20000;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 청크 배열을 순차 처리하는 제네릭 러너. 각 청크는 최대 maxRetries 회 재시도한다.
 * 실패한 청크만 재시도하고(다른 청크에 영향 없음), 최종 실패 수를 집계한다. (ADR-1)
 * minCallIntervalMs 로 호출 간 최소 간격을 두고(무료 티어 분당 한도 보호),
 * 429 에러는 서버 제시 시간만큼 대기 후 재시도한다.
 */
export async function runWithRetry<C, T>(
  chunks: C[],
  process: (chunk: C) => Promise<T[]>,
  opts: {
    maxRetries?: number;
    onProgress?: (processed: number, total: number) => void | PromiseLike<unknown>;
    onChunkFailed?: (chunk: C) => void | PromiseLike<unknown>;
    minCallIntervalMs?: number;
    sleep?: (ms: number) => Promise<void>;
  } = {},
): Promise<{ results: T[]; failedChunks: number; lastError?: string }> {
  const maxRetries = opts.maxRetries ?? 3;
  const sleep = opts.sleep ?? defaultSleep;
  const interval = opts.minCallIntervalMs ?? 0;
  const results: T[] = [];
  let failedChunks = 0;
  let lastError: string | undefined;
  let firstCall = true;

  for (let i = 0; i < chunks.length; i++) {
    let done = false;
    for (let attempt = 1; attempt <= maxRetries && !done; attempt++) {
      if (!firstCall && interval > 0) await sleep(interval);
      firstCall = false;

      try {
        const chunkResults = await process(chunks[i]);
        results.push(...chunkResults);
        done = true;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        if (attempt >= maxRetries) {
          failedChunks++;
          await opts.onChunkFailed?.(chunks[i]);
        } else {
          const backoff = retryDelayMs(error);
          if (backoff > 0) await sleep(backoff);
        }
      }
    }
    await opts.onProgress?.(i + 1, chunks.length);
  }

  if (failedChunks === 0) lastError = undefined;
  return { results, failedChunks, lastError };
}
