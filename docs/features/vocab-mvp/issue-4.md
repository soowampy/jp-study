# issue-4 — 검수 화면 편집 + 확정

> GitHub: soowampy/jp-study#4
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

- [x] **validateConfirm 빈 목록**: 행이 0개면 "최소 1개 단어가 필요합니다."를 반환한다. (AC4)
- [x] **validateConfirm 빈 reading**: reading이 빈 행이 있으면 후리가나 입력 안내를 반환한다(kanji=null은 허용). (AC5)
- [x] **validateConfirm 정상**: 모든 행이 유효하면 null을 반환한다.
- [x] **ReviewEditor 삭제**: 행 삭제를 누르면 표에서 행이 줄어든다. (AC1)
- [x] **ReviewEditor 추가**: 행 추가를 누르면 빈 행이 늘어난다. (AC1)
- [x] **ReviewEditor 수정**: 입력값을 바꾸면 그 값이 반영된다. (AC1)
- [x] **ReviewEditor 강조**: reading/뜻이 빈 미완성 행은 "확인 필요"로 강조된다. (AC2)
- [x] **ReviewEditor 확정 차단**: 빈 reading 상태에서 확정하면 onConfirm이 호출되지 않고 안내가 뜬다. (AC4/AC5)
- [x] **ReviewEditor 확정 성공**: 유효한 상태에서 확정하면 onConfirm이 단어 목록으로 호출된다. (AC3)
- [x] **confirmVocabSet 저장**: 이름과 단어로 VocabSet+Word를 저장하고 setId를 반환한다. (AC3)

## 관련 파일 (Green에서 생성)

- `lib/confirm.ts` — `EditableWord`, `validateConfirm`, `isRowIncomplete`
- `lib/vocabSet.ts` — `confirmVocabSet`(prisma)
- `app/review/_components/ReviewEditor.tsx` — 편집 가능 검수 표(수정/삭제/추가/강조/확정)
- (글루) `app/api/confirm/route.ts`, `app/review/[jobId]/page.tsx`에 편집기 연결

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본. 미완성 행은 "확인 필요" 뱃지 + 배경 강조.
확정 후 이동 대상(단어장 상세)은 #6에서 완성 → 이번엔 홈으로 이동(저장 결과 목록 확인).
