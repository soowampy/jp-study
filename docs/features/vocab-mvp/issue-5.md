# issue-5 — AI 생성(Pass 2) enrichment 잡 + 폴링

> GitHub: soowampy/jp-study#5
> AI provider: Gemini 2.5 Flash. #3의 잡 러너(runWithRetry/jobs) 재사용.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

- [x] **parseEnrichmentJson 기본**: JSON을 `{synonyms[], examples:{jp,reading,ko}[]}[]`로 파싱·매핑한다. (AC2)
- [x] **parseEnrichmentJson 오류**: 배열이 아니거나 깨진 JSON이면 예외를 던진다.
- [x] **chunkArray 20개 묶음**: 배열을 size 단위 배치로 나눈다(45→[20,20,5]). (Pass2 묶음 호출)
- [x] **enrichmentLabel 실패**: enrichFailed면 "생성 실패, 재시도"를 반환한다. (AC4)
- [x] **enrichmentLabel 정상**: 실패 아니면 null을 반환한다.
- [x] **saveEnrichment 저장**: 단어에 synonyms/examples/enrichedAt를 저장한다. (AC2)
- [x] **markEnrichFailed 저장**: 지정한 단어들의 enrichFailed=true로 표시한다. (AC4)
- [x] **hasActiveEnrichJob**: 실행 중 enrich 잡이 있으면 true, 없으면 false. (AC3)
- [x] **startEnrichmentJob 중복 차단**: 이미 실행 중이면 null을 반환한다(새 잡 미생성). (AC3)
- [x] **runWithRetry onChunkFailed**: 청크가 최종 실패하면 onChunkFailed 콜백이 그 청크로 호출된다. (AC4)

## 관련 파일 (Green에서 생성)

- `lib/enrich.ts` — `Enrichment`, `parseEnrichmentJson`, `chunkArray`, `enrichmentLabel`
- `lib/enrichJob.ts` — `saveEnrichment`, `markEnrichFailed`, `hasActiveEnrichJob`, `startEnrichmentJob`
- `lib/jobRunner.ts` — `onChunkFailed` 콜백 추가
- `lib/jobs.ts` — `createJob`에 setId 옵션 추가
- Prisma `Word.enrichFailed` 컬럼 + 마이그레이션
- (글루) `app/api/enrich/route.ts`, `/api/confirm`에서 확정 후 enrichment 시작,
  최소 `app/vocab-sets/[id]/page.tsx`(생성 진행바) — 카드 리스트는 #6

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본. 진행바는 폴링, 실패 단어는 "생성 실패, 재시도".
