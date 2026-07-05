import { describe, it, expect, afterAll } from "vitest";
import {
  saveEnrichment,
  markEnrichFailed,
  hasActiveEnrichJob,
  startEnrichmentJob,
} from "@/lib/enrichJob";
import { prisma } from "@/lib/db";

describe("enrichJob", () => {
  const setIds: number[] = [];
  const jobIds: number[] = [];

  afterAll(async () => {
    for (const id of jobIds) {
      await prisma.job.delete({ where: { id } }).catch(() => {});
    }
    for (const id of setIds) {
      await prisma.vocabSet.delete({ where: { id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  async function makeSet() {
    const set = await prisma.vocabSet.create({
      data: {
        name: "enrich 테스트",
        words: {
          create: [
            { kanji: "水", reading: "みず", meaningKo: "물" },
            { kanji: "秋", reading: "あき", meaningKo: "가을" },
          ],
        },
      },
      include: { words: true },
    });
    setIds.push(set.id);
    return set;
  }

  it("saveEnrichment이 단어에 synonyms/examples/enrichedAt를 저장한다", async () => {
    const set = await makeSet();
    const word = set.words[0];

    await saveEnrichment(word.id, {
      synonyms: ["お水"],
      examples: [{ jp: "水を飲む。", reading: "みずをのむ。", ko: "물을 마시다." }],
    });

    const updated = await prisma.word.findUnique({ where: { id: word.id } });
    expect(JSON.parse(updated!.synonyms!)).toEqual(["お水"]);
    expect(JSON.parse(updated!.examples!)[0].ko).toBe("물을 마시다.");
    expect(updated!.enrichedAt).not.toBeNull();
  });

  it("markEnrichFailed가 지정 단어들의 enrichFailed=true로 표시한다", async () => {
    const set = await makeSet();
    const ids = set.words.map((w) => w.id);

    await markEnrichFailed(ids);

    const words = await prisma.word.findMany({ where: { id: { in: ids } } });
    expect(words.every((w) => w.enrichFailed)).toBe(true);
  });

  it("hasActiveEnrichJob은 실행 중 enrich 잡이 있을 때 true", async () => {
    const set = await makeSet();
    expect(await hasActiveEnrichJob(set.id)).toBe(false);

    const job = await prisma.job.create({
      data: { type: "enrich", status: "running", total: 1, setId: set.id },
    });
    jobIds.push(job.id);

    expect(await hasActiveEnrichJob(set.id)).toBe(true);
  });

  it("startEnrichmentJob은 이미 실행 중이면 null을 반환한다(중복 차단)", async () => {
    const set = await makeSet();
    const job = await prisma.job.create({
      data: { type: "enrich", status: "running", total: 1, setId: set.id },
    });
    jobIds.push(job.id);

    const result = await startEnrichmentJob(set.id);
    expect(result).toBeNull();
  });
});
