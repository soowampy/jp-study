import { describe, it, expect, vi } from "vitest";
import { runWithRetry, retryDelayMs } from "@/lib/jobRunner";

describe("runWithRetry", () => {
  it("청크가 2회 실패 후 성공하면 결과에 포함되고 failedChunks=0", async () => {
    let attempts = 0;
    const process = vi.fn(async (chunk: string) => {
      attempts++;
      if (attempts < 3) throw new Error("일시 실패");
      return [`${chunk}-ok`];
    });

    const { results, failedChunks } = await runWithRetry(["c1"], process, {
      maxRetries: 3,
    });

    expect(results).toEqual(["c1-ok"]);
    expect(failedChunks).toBe(0);
    expect(process).toHaveBeenCalledTimes(3);
  });

  it("청크가 3회 모두 실패하면 failedChunks로 집계, 나머지는 정상 처리하고 onProgress 호출", async () => {
    const process = vi.fn(async (chunk: string) => {
      if (chunk === "bad") throw new Error("영구 실패");
      return [`${chunk}-ok`];
    });
    const onProgress = vi.fn();

    const { results, failedChunks } = await runWithRetry(
      ["bad", "good"],
      process,
      { maxRetries: 3, onProgress },
    );

    expect(results).toEqual(["good-ok"]);
    expect(failedChunks).toBe(1);
    // 두 청크 모두 진행률 콜백이 호출되고, 마지막은 (2, 2)
    expect(onProgress).toHaveBeenCalledWith(2, 2);
  });

  it("청크가 최종 실패하면 onChunkFailed 콜백이 그 청크로 호출된다", async () => {
    const process = vi.fn(async (chunk: string) => {
      if (chunk === "bad") throw new Error("영구 실패");
      return [`${chunk}-ok`];
    });
    const onChunkFailed = vi.fn();

    await runWithRetry(["bad", "good"], process, {
      maxRetries: 2,
      onChunkFailed,
    });

    expect(onChunkFailed).toHaveBeenCalledTimes(1);
    expect(onChunkFailed).toHaveBeenCalledWith("bad");
  });

  it("minCallIntervalMs를 주면 호출 사이에만 그만큼 대기한다 (첫 호출 전 제외)", async () => {
    const sleep = vi.fn(async () => {});
    const process = vi.fn(async (chunk: string) => [`${chunk}-ok`]);

    await runWithRetry(["c1", "c2", "c3"], process, {
      minCallIntervalMs: 3500,
      sleep,
    });

    expect(process).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(3500);
  });

  it("429 에러면 서버 제시 시간만큼 대기 후 재시도한다", async () => {
    const sleep = vi.fn(async () => {});
    let attempts = 0;
    const process = vi.fn(async (chunk: string) => {
      attempts++;
      if (attempts === 1) {
        const err = new Error(
          "quota exceeded. Please retry in 2.5s.",
        ) as Error & { status: number };
        err.status = 429;
        throw err;
      }
      return [`${chunk}-ok`];
    });

    const { results, failedChunks } = await runWithRetry(["c1"], process, {
      maxRetries: 3,
      sleep,
    });

    expect(results).toEqual(["c1-ok"]);
    expect(failedChunks).toBe(0);
    // 2.5s + 1s 버퍼
    expect(sleep).toHaveBeenCalledWith(3500);
  });

  it("최종 실패 시 마지막 에러 메시지를 lastError로 반환한다", async () => {
    const process = vi.fn(async () => {
      throw new Error("영구 실패 사유");
    });

    const { failedChunks, lastError } = await runWithRetry(["c1"], process, {
      maxRetries: 2,
    });

    expect(failedChunks).toBe(1);
    expect(lastError).toContain("영구 실패 사유");
  });

  it("전부 성공하면 lastError가 없다", async () => {
    const { lastError } = await runWithRetry(
      ["c1"],
      async (c: string) => [c],
      {},
    );

    expect(lastError).toBeUndefined();
  });
});

describe("retryDelayMs", () => {
  it("429 + 'retry in Ns' 메시지면 그 시간 + 1초 버퍼(ms)를 반환한다", () => {
    const err = new Error("Please retry in 17.9s.") as Error & {
      status: number;
    };
    err.status = 429;

    expect(retryDelayMs(err)).toBe(18900);
  });

  it("429인데 대기 시간 힌트가 없으면 기본 20초를 반환한다", () => {
    const err = new Error("RESOURCE_EXHAUSTED") as Error & { status: number };
    err.status = 429;

    expect(retryDelayMs(err)).toBe(20000);
  });

  it("429가 아니면 0을 반환한다 (즉시 재시도)", () => {
    expect(retryDelayMs(new Error("JSON 파싱 실패"))).toBe(0);
    expect(retryDelayMs("문자열 에러")).toBe(0);
  });
});
