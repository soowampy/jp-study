# issue-2 — PDF 업로드 + 텍스트 추출

> GitHub: soowampy/jp-study#2
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

- [x] **validatePdfFile 통과**: PDF 타입 + 10MB 이하이면 null(에러 없음)을 반환한다. (AC2)
- [x] **validatePdfFile PDF 아님**: PDF가 아니면 거부 사유 문자열을 반환한다. (AC2)
- [x] **validatePdfFile 크기 초과**: 10MB 초과면 거부 사유 문자열을 반환한다. (AC2)
- [x] **extractPdfText 텍스트 있음**: unpdf가 텍스트를 반환하면 `{ ok, text, lineCount }`로 줄 수를 센다. (AC1)
- [x] **extractPdfText 빈 결과**: 추출 텍스트가 비면 `{ ok:false, reason:"텍스트를 추출할 수 없습니다." }`를 반환한다. (AC3)
- [x] **UploadResult 성공 표시**: 성공 결과면 줄 수와 텍스트 미리보기를 화면에 보여준다. (AC1)
- [x] **UploadResult 실패 표시**: 실패 결과면 거부/안내 사유를 화면에 보여준다. (AC2/AC3)

## 관련 파일 (Green에서 생성)

- `lib/pdf.ts` — `validatePdfFile`, `extractPdfText`, `ExtractResult` 타입, `MAX_SIZE`
- `app/upload/_components/UploadResult.tsx` — 결과 표시 컴포넌트
- (글루) `app/api/upload/route.ts` — POST: formData → 검증 → 추출 → JSON
- (글루) `app/upload/page.tsx` — 드롭존 업로드 화면

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본. 실패 사유는 `role="alert"`로 접근성 유지.
