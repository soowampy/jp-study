# issue-6 — 단어장 뷰 (카드 리스트 + 검색/필터)

> GitHub: soowampy/jp-study#6
> 단어장 상세에서 漢字/후리가나/뜻/유의어/예문 카드 + SRS 레벨 뱃지 + 검색/필터.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/wordCards — toWordCard (순수 변환)

- [x] **JSON 파싱**: synonyms/examples JSON 문자열을 배열로 파싱한다. (AC1)
- [x] **null 방어**: synonyms/examples가 null이면 빈 배열이 된다.
- [x] **깨진 JSON 방어**: 파싱 실패 시 빈 배열로 처리한다.
- [x] **SRS 없음**: level 0, 미학습(unlearned=true), 복습필요 아님. (AC2)
- [x] **SRS 있음**: 그 레벨을 쓰고 미학습이 아니다. (AC2)
- [x] **복습필요 판정**: next_review_date <= today면 needsReview=true (경계 포함). (AC4)

### lib/wordCards — filterWordCards (검색/필터)

- [x] **검색 일치**: 검색어가 漢字·후리가나·뜻 어디든 일치하면 남긴다. (AC3)
- [x] **빈 검색어**: 비어 있으면 전체 반환.
- [x] **무일치**: 일치 없으면 빈 배열.
- [x] **레벨 필터**: 해당 레벨만 남긴다. (AC2)
- [x] **복습필요 필터**: needsReview 단어만 남긴다. (AC4)
- [x] **미학습 필터**: unlearned 단어만 남긴다.
- [x] **조합**: 검색어와 상태 필터를 조합할 수 있다.

### WordCardList (컴포넌트)

- [x] **카드 렌더**: 漢字/후리가나/뜻/유의어/예문 표시. (AC1)
- [x] **레벨 뱃지**: 각 카드에 `Lv.0`~`Lv.5` 뱃지 표시. (AC2)
- [x] **생성 실패 표시**: enrichFailed면 "생성 실패, 재시도" 표시. (#5 연계)
- [x] **검색 동작**: 검색어 입력 시 일치 카드만 남는다. (AC3)
- [x] **복습필요 필터 동작**: 버튼 클릭 시 needsReview 카드만. (AC4)
- [x] **미학습 필터 동작**: 버튼 클릭 시 미학습 카드만.
- [x] **레벨 필터 동작**: "레벨 필터" select로 그 레벨 카드만.
- [x] **빈 상태**: 필터 결과 0개면 "일치하는 단어가 없습니다" 안내.

## 관련 파일 (Green에서 생성)

- `lib/wordCards.ts` — `WordCard`, `toWordCard`, `filterWordCards`
- `app/vocab-sets/[id]/_components/WordCardList.tsx` — 카드 리스트 + 검색/필터 UI
- (글루) `app/vocab-sets/[id]/page.tsx` — Word+WordSrs 조회 → WordCardList 렌더

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본, 기존 컴포넌트(ReviewEditor 등) 톤 유지.
레벨 뱃지는 `Lv.N` 텍스트 뱃지, 실패 라벨은 `enrichmentLabel()`(#5) 재사용.
