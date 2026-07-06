# issue-14 — 마지막 학습 날짜 표시

> GitHub: soowampy/jp-study#15 (문서 번호는 #14, GitHub 이슈 번호 gap으로 실제 번호는 #15)
> 2026-07-06 3차 사용성 피드백 반영. spec-fixed R4 3차 개정 기준.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/vocabSet — getLastStudiedAt (DB)

- [x] **학습 기록 없음**: QuizAttempt가 없는 단어장은 null을 반환한다. (AC)
- [x] **최신값 반환**: 단어장 소속 단어에 QuizAttempt가 여럿이면 가장 최신 answeredAt을 반환한다. (AC)

### lib/vocabSet — formatLastStudied (순수 함수)

- [x] **null**: "학습 기록 없음"을 반환한다. (AC)
- [x] **오늘**: 오늘 날짜면 "오늘"을 반환한다. (AC)
- [x] **n일 전**: 3일 전 날짜면 "3일 전"을 반환한다. (AC)

## 관련 파일 (Green에서 생성/수정)

- `lib/vocabSet.ts` — `getLastStudiedAt(setId)`, `formatLastStudied(date, today)` 추가
- (글루) `app/vocab-sets/[id]/page.tsx` — "마지막 학습: ..." 표시
- (글루) `app/_components/VocabSetList.tsx` / `app/page.tsx` — 홈 목록에 표시
