import { describe, it, expect, vi } from "vitest";
import { runWithRetry } from "@/lib/jobRunner";

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
});
