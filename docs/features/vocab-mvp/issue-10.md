# issue-10 — UI/UX 개선 (글로벌 네비·퀴즈 인터랙션·로딩·모던 디자인)

> GitHub: soowampy/jp-study#11 (문서 번호는 #10, GitHub 이슈 번호 gap으로 실제 번호는 #11로 생성됨)
> 2026-07-06 사용성 피드백 반영. spec-fixed R5 개정·R10 기준.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### GlobalHeader (컴포넌트)

- [x] **헤더 구성**: 홈 링크(`/`)와 "새 단어장" 버튼(`/upload`)이 보인다. (AC1)

### VocabSetList (수정)

- [x] **상세 링크**: 목록 항목이 단어장 상세(`/vocab-sets/:id`)로 링크된다. (AC2)

### Spinner (로딩)

- [x] **스피너**: `role="status"`와 "로딩 중" 라벨을 가진다. (AC3 — 라우트 적용은 글루)

### lib/quiz — 세션 크기·힌트

- [x] **size 옵션**: 단어 25개 + `size: 10`이면 10문제만 출제된다. (AC4)
- [x] **힌트 생성**: 예문이 있으면 예문 jp, 없으면 유의어 첫 개, 둘 다 없으면 null. (AC6)

### lib/srs — selectSessionWords size

- [x] **size 옵션**: 출제 대상 25개 + `size: 10`이면 10개만 선택된다. (AC4)

### QuizStartForm (컴포넌트)

- [x] **옵션 반영**: 방향·문제 수(10/20/전체) 선택이 시작 링크 href의 `direction`/`count`에 반영된다. (AC4)

### QuizPlayer (재작성 — 피드백 단계)

- [x] **문제 렌더**: 문제(漢字+후리가나), 보기 4개, "힌트 보기"·"정답 보기" 버튼이 보인다. (AC1 유지)
- [x] **답 선택 → 피드백**: 정답 선택 시 즉시 다음 문제로 넘어가지 않고 "정답!"과 "다음" 버튼이 보이며 onAnswer가 호출된다. (AC5)
- [x] **오답 피드백**: 오답 선택 시 "오답"과 함께 정답("정답: X")이 노출된다. (AC5)
- [x] **다음 진행**: "다음" 클릭 시 다음 문제로 진행하고, 마지막 문제 후에는 결과 요약이 보인다. (AC5)
- [x] **힌트 보기**: 클릭 시 힌트 텍스트가 표시되고, 힌트가 없으면 버튼이 비활성이다. (AC6)
- [x] **정답 보기**: 클릭 시 `onAnswer(wordId, false)`로 오답 기록되고 피드백 단계로 전환된다. (AC7)
- [x] **오클릭 가드**: 화면 전환(제출/다음) 직후 250ms 이내의 클릭은 무시된다 — 더블클릭·고스트 클릭이 '다음'/보기를 연쇄로 누르는 버그 방지. (버그 수정 2026-07-06)
- [x] **세션 고정**: 진행 중 questions prop이 바뀌어도(서버 재렌더) 마운트 시점의 세션을 유지한다 — dev에서 답 저장 시 dev.db 변경 → Fast Refresh → 문제가 새로 섞이던 버그의 방어. (버그 수정 2026-07-06)
- [x] **역방향 choiceMeanings**: 보기 순서대로 각 단어의 뜻이 담긴다(정방향은 null). (추가 요청)
- [x] **역방향 피드백 뜻 표시**: 피드백 단계에서 각 보기 단어의 뜻이 함께 보인다. (추가 요청)

## 관련 파일 (Green에서 생성/수정)

- `app/_components/GlobalHeader.tsx` — 홈 링크 + 새 단어장 버튼
- `app/_components/Spinner.tsx` — 로딩 스피너
- `app/_components/VocabSetList.tsx` — 항목을 상세 링크로
- `lib/quiz.ts` — `QuizQuestion.hint`, `buildQuizSession` size 옵션, QuizWord에 synonyms/examples 옵션
- `lib/srs.ts` — `selectSessionWords` size 파라미터
- `app/vocab-sets/[id]/quiz/_components/QuizStartForm.tsx` — 방향·문제 수 선택
- `app/vocab-sets/[id]/quiz/_components/QuizPlayer.tsx` — 피드백 단계·힌트·정답 보기
- (글루) `app/layout.tsx` — GlobalHeader 장착 + 페이지 배경
- (글루) 각 라우트 `loading.tsx` — Spinner
- (글루) `app/vocab-sets/[id]/quiz/page.tsx` — count 파라미터·힌트 데이터·QuizStartForm

## 디자인 참고

`docs/design-system.md` v1을 따른다(AC8). 카드 `rounded-xl shadow-sm`, primary/secondary 버튼 위계,
정답 green·오답 red는 피드백 전용, 글로벌 헤더 스펙·Spinner 스펙 포함. 기존 화면도 토큰에 맞게 정리한다.
