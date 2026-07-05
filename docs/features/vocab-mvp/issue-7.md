# issue-7 — 4지선다 퀴즈 (양방향) + 세션 결과

> GitHub: soowampy/jp-study#7
> 정방향(漢字+후리가나→뜻)·역방향(뜻→단어) 4지선다. 오답 보기 3개는 같은 단어장 랜덤.
> 세션 최대 20문제, QuizAttempt 기록, 종료 시 정답률·소요시간·틀린 단어 요약.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/quiz — buildQuizSession (순수 출제 로직)

- [x] **정방향 문제 구성**: 문제=漢字+후리가나(promptReading), 보기 4개 중 `choices[answerIndex]`가 정답 뜻이다. (AC1)
- [x] **정방향 오답 보기**: 오답 3개는 같은 단어장의 다른 단어 뜻이고 보기에 중복이 없다. (AC1)
- [x] **kana 단어 문제**: kanji가 null이면 문제=reading, promptReading은 null이다.
- [x] **역방향 문제 구성**: 문제=한국어 뜻, 보기=단어 표기(漢字 또는 reading) 4개, `choices[answerIndex]`가 정답 단어다. (AC2)
- [x] **4개 미만 차단**: 단어가 4개 미만이면 "단어가 4개 이상이어야 합니다" 에러를 던진다. (AC3)
- [x] **세션 20문제 제한**: 단어 25개면 20문제만 출제되고 문제 단어가 중복되지 않는다.
- [x] **단어 수만큼 출제**: 단어가 20개 미만(예: 5개)이면 있는 만큼만 출제된다.

### lib/quiz — summarizeSession (세션 요약)

- [x] **정답률**: 4문제 중 2개 정답이면 accuracy=50. (AC4)
- [x] **소요시간**: startedAt/endedAt 차이를 초 단위(durationSec)로 계산한다. (AC4)
- [x] **틀린 단어 목록**: 오답 처리된 wordId 목록을 반환한다. (AC4)

### lib/quizAttempts — recordAttempt (DB)

- [x] **시도 기록**: recordAttempt가 QuizAttempt(wordId, direction, isCorrect)를 저장한다. (AC4 기록)

### QuizPlayer (컴포넌트)

- [x] **문제 렌더**: 문제(漢字+후리가나)와 보기 버튼 4개가 보인다. (AC1)
- [x] **정답 클릭**: 정답 보기를 클릭하면 `onAnswer(wordId, true)`가 호출되고 다음 문제로 넘어간다.
- [x] **오답 클릭**: 오답 보기를 클릭하면 `onAnswer(wordId, false)`가 호출된다.
- [x] **세션 결과**: 마지막 문제 후 정답률·소요시간·틀린 단어 목록이 요약된다. (AC4)

## 관련 파일 (Green에서 생성)

- `lib/quiz.ts` — `QuizQuestion`, `buildQuizSession`, `summarizeSession`
- `lib/quizAttempts.ts` — `recordAttempt`
- `app/vocab-sets/[id]/quiz/_components/QuizPlayer.tsx` — 문제 진행 + 결과 UI
- (글루) `app/vocab-sets/[id]/quiz/page.tsx` — 방향 선택 → 단어 조회 → QuizPlayer 렌더, 4개 미만 안내
- (글루) `app/api/quiz-attempts/route.ts` — POST: onAnswer → recordAttempt

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본, 기존 컴포넌트(WordCardList 등) 톤 유지.
보기 버튼은 카드형 버튼 4개 세로 배치, 결과 화면은 정답률 크게 + 틀린 단어 리스트.
