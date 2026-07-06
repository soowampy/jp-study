# issue-13 — 단어장 관리 (이름 수정 + 삭제)

> GitHub: soowampy/jp-study#14 (문서 번호는 #13, GitHub 이슈 번호 gap으로 실제 번호는 #14)
> 2026-07-06 3차 사용성 피드백 반영. spec-fixed R4 3차 개정 기준.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/vocabSet — renameVocabSet / deleteVocabSet

- [x] **빈 이름 거부**: 공백만 있는 이름으로 renameVocabSet 호출 시 에러를 던지고 이름이 바뀌지 않는다. (AC)
- [x] **이름 갱신**: 유효한 이름으로 renameVocabSet 호출 시 VocabSet.name이 갱신된다. (AC)
- [x] **cascade 삭제**: deleteVocabSet 호출 시 VocabSet과 소속 Word/WordSrs가 삭제된다. (AC)

### EditableTitle (컴포넌트)

- [x] **편집 모드 전환**: 제목 텍스트를 클릭하면 입력창으로 바뀐다. (AC)
- [x] **저장**: 입력창에서 유효한 이름 입력 후 Enter 시 onSave(name)이 호출되고 보기 모드로 돌아간다. (AC)
- [x] **빈 값 저장 거부**: 입력창이 빈 문자열이면 Enter를 눌러도 onSave가 호출되지 않는다. (AC)

### DeleteVocabSetButton (컴포넌트)

- [x] **삭제 확인**: 클릭 후 confirm에서 확인하면 onDelete가 호출된다. (AC)
- [x] **삭제 취소**: 클릭 후 confirm에서 취소하면 onDelete가 호출되지 않는다. (AC)

## 관련 파일 (Green에서 생성/수정)

- `lib/vocabSet.ts` — `renameVocabSet(id, name)`, `deleteVocabSet(id)` 추가
- `app/vocab-sets/[id]/_components/EditableTitle.tsx` (신규) — props: `name`, `onSave`
- `app/vocab-sets/[id]/_components/DeleteVocabSetButton.tsx` (신규) — props: `onDelete`
- (글루) `app/api/vocab-sets/[id]/route.ts` (신규) — PATCH(이름 수정)/DELETE
- (글루) `app/vocab-sets/[id]/page.tsx` — EditableTitle + DeleteVocabSetButton 장착, fetch 연결

## 디자인 참고

`docs/design-system.md` 토큰. 삭제 버튼은 파괴적 동작이므로 눈에 띄되 상태색(red)은 실패/오답 전용이라 재사용하지 않는다 — secondary 버튼 스타일 유지, 문구로 구분("단어장 삭제").
