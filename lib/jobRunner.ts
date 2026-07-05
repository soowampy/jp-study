/**
 * 청크 배열을 순차 처리하는 제네릭 러너. 각 청크는 최대 maxRetries 회 재시도한다.
 * 실패한 청크만 재시도하고(다른 청크에 영향 없음), 최종 실패 수를 집계한다. (ADR-1)
 */
export async function runWithRetry<C, T>(
  chunks: C[],
  process: (chunk: C) => Promise<T[]>,
  opts: {
    maxRetries?: number;
    onProgress?: (processed: number, total: number) => void | Promise<void>;
  } = {},
): Promise<{ results: T[]; failedChunks: number }> {
  const maxRetries = opts.maxRetries ?? 3;
  const results: T[] = [];
  let failedChunks = 0;

  for (let i = 0; i < chunks.length; i++) {
    let done = false;
    for (let attempt = 1; attempt <= maxRetries && !done; attempt++) {
      try {
        const chunkResults = await process(chunks[i]);
        results.push(...chunkResults);
        done = true;
      } catch {
        if (attempt >= maxRetries) failedChunks++;
      }
    }
    await opts.onProgress?.(i + 1, chunks.length);
  }

  return { results, failedChunks };
}
