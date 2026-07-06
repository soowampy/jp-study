# issue-11 — 퀴즈 학습 옵션 확장 (유형 3종·출제 방식 4종·단어 저장)

> GitHub: soowampy/jp-study#12 (문서 번호는 #11, GitHub 이슈 번호 gap으로 실제 번호는 #12로 생성됨)
> 2026-07-06 2차 사용성 피드백 반영. spec-fixed R4·R5 개정 기준.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/quiz — 퀴즈 유형 3종

- [x] **한자→뜻**: 문제=漢字, promptReading=reading, 보기=정답 뜻+오답 뜻 3개. (AC1)
- [x] **한자→뜻 제외**: kanji=null 단어는 문제로 나오지 않는다(오답 보기로는 등장 가능). (AC1)
- [x] **한자→뜻 불가**: 한자 단어가 0개면 "한자 단어가 없어 이 유형을 낼 수 없습니다" 에러를 던진다. (경계조건)
- [x] **후리가나→뜻**: 문제=후리가나(kanji 유무 무관 전 단어 대상), promptReading=null, 보기=뜻 4개. (AC2)
- [x] **뜻→단어**: 문제=뜻, 보기=漢字+후리가나 결합 표기("水 (みず)"), kana 단어는 후리가나만. (AC3)
- [x] **뜻→단어 choiceMeanings**: 기존 로직 유지(보기 순서대로 뜻 배열). (AC3, 회귀)

### lib/srs — 출제 방식(mode) 4종

- [x] **all**: 전체 단어에서 무작위로 size만큼 선택된다. (AC 유형: 전체 랜덤)
- [x] **unmastered**: `correctCount=0`(또는 SRS 없음)인 단어만 선택 대상이 된다. (AC4)
- [x] **review(기본값)**: mode 생략 시 기존 복습 우선→미학습 순 동작이 유지된다. (AC5, 회귀)
- [x] **bookmarked**: `bookmarked=true`인 단어만 선택 대상이 된다. (AC7)

### lib/wordCards — bookmarked 필드

- [x] **toWordCard**: `bookmarked` 값을 그대로 카드에 매핑한다.
- [x] **filterWordCards**: `status: "bookmarked"`이면 bookmarked 카드만 남긴다. (AC6)

### lib/words — 단어 저장 토글 (신규)

- [x] **setBookmarked(true)**: Word.bookmarked가 true로 저장된다. (AC6)
- [x] **setBookmarked(false)**: Word.bookmarked를 false로 되돌릴 수 있다. (AC6)

### WordCardList (컴포넌트 — 저장 토글 + 필터)

- [x] **저장 토글 버튼**: 각 카드에 "저장" 토글 버튼이 있고, 클릭 시 `onToggleBookmark(id)`가 호출된다. (AC6)
- [x] **저장 상태 표시**: bookmarked 카드는 토글 버튼이 `aria-pressed="true"`다. (AC6)
- [x] **'저장됨' 필터**: 클릭하면 bookmarked 카드만 남는다. (AC6)

### QuizStartForm (유형 3종 + 출제 방식 4종)

- [x] **옵션 반영**: 유형·문제 수·출제 방식 선택이 시작 링크 href의 `direction`/`count`/`mode`에 반영된다. 기본값은 `kanji_to_meaning`/`20`/`review`다. (AC8)

## 관련 파일 (Green에서 생성/수정)

- `lib/quiz.ts` — `QuizDirection` 3종(`kanji_to_meaning`/`reading_to_meaning`/`meaning_to_word`)로 교체, prompt/choice 로직 분기, 한자 없음 에러
- `lib/srs.ts` — `QuizMode` 4종, `selectSessionWords`에 mode 파라미터 추가
- `lib/wordCards.ts` — `WordCard.bookmarked`, `WordFilter.status`에 `"bookmarked"` 추가
- `lib/words.ts` (신규) — `setBookmarked(wordId, bookmarked)`
- `prisma/schema.prisma` — `Word.bookmarked Boolean @default(false)` + 마이그레이션
- `app/vocab-sets/[id]/_components/WordCardList.tsx` — 저장 토글 버튼 + '저장됨' 필터
- `app/vocab-sets/[id]/quiz/_components/QuizStartForm.tsx` — 유형 3종 라디오 + 출제 방식 4종 라디오
- (글루) `app/vocab-sets/[id]/_components/WordCardListSection.tsx` (신규) — 토글 클릭 시 `PATCH /api/words/:id/bookmark` 호출 + 낙관적 갱신
- (글루) `app/api/words/[id]/bookmark/route.ts` (신규)
- (글루) `app/vocab-sets/[id]/page.tsx` — `WordCardListSection` 장착
- (글루) `app/vocab-sets/[id]/quiz/page.tsx` — `mode` 쿼리 파라미터, 3종 direction 검증, 저장 단어 0개/한자 단어 0개 안내
- (글루) `app/api/quiz-attempts/route.ts` — direction 검증 3종으로 교체
- (회귀 반영) `lib/quizAttempts.test.ts` — direction 리터럴을 신규 값으로 교체
