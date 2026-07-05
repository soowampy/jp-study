# issue-3 — AI 파싱(Pass 1) + 잡 러너 + 폴링

> GitHub: soowampy/jp-study#3
> AI provider: **Gemini 2.5 Flash** (`@google/genai`, `GEMINI_API_KEY`). ADR-3 개정 반영.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

- [x] **parseWordsJson 기본**: JSON 배열 문자열을 `{kanji, reading, meaningKo}[]`로 파싱·매핑한다.
- [x] **parseWordsJson 펜스 제거**: ` ```json ... ``` ` 펜스가 있어도 파싱한다. (ADR 6.3)
- [x] **parseWordsJson reading 보존**: 소스가 준 reading 값을 변형 없이 그대로 사용한다(AI 미보완). (AC3)
- [x] **parseWordsJson 오류**: 배열이 아니거나 깨진 JSON이면 예외를 던진다.
- [x] **chunkText 분할**: 텍스트를 maxChars 이하 청크로 나눈다. 줄바꿈이 없는 큰 텍스트도 여러 청크로 분할(진행률·출력 안전). *개선: 원래 chunkLines(줄 수 기준) → chunkText(글자수 기준)*
- [x] **runWithRetry 재시도 성공**: 청크가 2회 실패 후 성공하면 결과에 포함되고 failedChunks=0. (AC4)
- [x] **runWithRetry 재시도 소진**: 청크가 3회 모두 실패하면 failedChunks로 집계하고 나머지 청크는 정상 처리, onProgress가 호출된다. (AC4)
- [x] **jobs 라운드트립**: createJob → getJob이 total/processed/status를 반환하고, setProgress가 processed를 갱신한다. (AC1)
- [x] **ParseReviewTable 표시**: 파싱된 행을 漢字/후리가나/뜻으로 화면에 보여준다. (AC2)

## 관련 파일 (Green에서 생성)

- `lib/parse.ts` — `ParsedWord`, `parseWordsJson`, `chunkLines`
- `lib/jobRunner.ts` — `runWithRetry`(제네릭 청크 재시도 러너)
- `lib/jobs.ts` — `createJob`, `getJob`, `setProgress`, `completeJob`
- `app/review/_components/ParseReviewTable.tsx` — 파싱 결과 표
- Prisma `Job` 모델 + 마이그레이션
- (글루) `lib/gemini.ts` — Gemini JSON 호출 래퍼
- (글루) `app/api/parse/route.ts`(잡 시작), `app/api/jobs/[id]/route.ts`(폴링), `app/review/[jobId]/page.tsx`

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본 표. 실패 상태는 이후 #4에서 강조.
