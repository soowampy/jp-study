# issue-8 — 경량 SRS (Leitner) — 레벨·복습일 갱신 + 출제 우선순위

> GitHub: soowampy/jp-study#8
> 정답: `level=min(level+1,5)`, `next_review_date=today+interval[level]`. 오답: `level=0`, `next_review_date=today`.
> `last_reviewed_at`, `correct/wrong_count` 기록. 출제 우선순위 = 복습 대상 → 미학습.
> 간격 테이블: 레벨 0~5 = [0, 1, 3, 7, 14, 30]일.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/srs — applyAnswer (순수 갱신 규칙)

- [x] **정답 레벨 상승**: 레벨 2 정답 → 레벨 3, nextReviewDate=today+7일. (AC1)
- [x] **레벨 상한**: 레벨 5 정답 → 레벨 5 유지, nextReviewDate=today+30일.
- [x] **오답 리셋**: 임의 레벨 오답 → 레벨 0, nextReviewDate=today. (AC2)
- [x] **정답 기록**: correctCount+1, lastReviewedAt=today. (AC3)
- [x] **오답 기록**: wrongCount+1, lastReviewedAt=today. (AC3)
- [x] **신규 단어(SRS 없음)**: null 상태에서 정답 → 레벨 1, correctCount=1.

### lib/srs — selectSessionWords (출제 우선순위)

- [x] **복습 대상 우선**: 복습 대상(`nextReviewDate<=today`)이 미학습보다 앞에 온다. (AC4)
- [x] **복습 불필요 제외**: 학습됐지만 아직 복습일이 안 된 단어는 출제 대상에서 빠진다.
- [x] **20개 제한**: 출제 대상 25개면 20개만 선택된다.
- [x] **있는 만큼만**: 출제 대상이 5개면 5개만 구성된다. (AC5)

### lib/wordSrs — answerWord (DB upsert)

- [x] **신규 생성**: SRS 없는 단어 정답 → WordSrs 생성(레벨 1, correctCount 1).
- [x] **기존 갱신**: 기존 SRS 오답 → 레벨 0, wrongCount 증가, lastReviewedAt 갱신. (AC2·AC3)

### lib/quiz — buildQuizSession pool 옵션

- [x] **pool 옵션**: 세션 단어 순서를 유지하고 오답 보기는 pool(단어장 전체)에서 뽑는다. pool이 4개 이상이면 세션이 4개 미만이어도 된다.

## 관련 파일 (Green에서 생성/수정)

- `lib/srs.ts` — `SRS_INTERVALS`, `applyAnswer`, `selectSessionWords`
- `lib/wordSrs.ts` — `answerWord` (applyAnswer 결과를 WordSrs에 upsert)
- `lib/quiz.ts` — `buildQuizSession`에 `{ pool }` 옵션 추가 (기존 동작 유지)
- (글루) `app/api/quiz-attempts/route.ts` — 답안 기록 시 `answerWord`도 호출
- (글루) `app/vocab-sets/[id]/quiz/page.tsx` — `selectSessionWords`로 세션 구성 + pool 전달

## 디자인 참고

UI 변경 없음(로직 이슈). 레벨 뱃지(#6)가 갱신된 SRS를 자동 반영한다.
