# issue-12 — 하단 고정 내비게이션 (홈·뒤로가기·앞으로가기)

> GitHub: soowampy/jp-study#13 (문서 번호는 #12, GitHub 이슈 번호 gap으로 실제 번호는 #13)
> 2026-07-06 3차 사용성 피드백 반영. spec-fixed R10 3차 개정 기준.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/navHistory — 순수 히스토리 리듀서

- [x] **canGoBack**: position=0이면 false, position>0이면 true. (AC)
- [x] **canGoForward**: position이 length-1(마지막)이면 false, 아니면 true. (AC)
- [x] **onNavigate**: 새 페이지 이동 시 position+1, length=position+1(이후 forward 기록 잘림). (AC)
- [x] **onBack**: position-1, 0 미만으로 내려가지 않음. (AC)
- [x] **onForward**: position+1, length-1을 넘지 않음. (AC)

### BottomNav (컴포넌트)

- [x] **버튼 구성**: 홈·뒤로가기·앞으로가기 3개 버튼이 보인다. (AC1)
- [x] **뒤로가기 비활성**: canGoBack=false면 뒤로가기 버튼이 disabled다. (AC)
- [x] **앞으로가기 비활성**: canGoForward=false면 앞으로가기 버튼이 disabled다. (AC)
- [x] **홈 링크**: 홈 버튼은 `/`로 이동하는 링크다. (AC9)

## 관련 파일 (Green에서 생성/수정)

- `lib/navHistory.ts` (신규) — `NavState`, `initialNavState`, `onNavigate`/`onBack`/`onForward`, `canGoBack`/`canGoForward`
- `app/_components/BottomNav.tsx` (신규) — 순수 표시 컴포넌트. props: `canGoBack`, `canGoForward`, `onBack`, `onForward`
- (글루) `app/_components/BottomNavSection.tsx` (신규) — `usePathname()`으로 이동 감지 + `window.history.back()/forward()` 실제 호출 + navHistory 상태 관리
- (글루) `app/layout.tsx` — `BottomNavSection` 장착

## 디자인 참고

`docs/design-system.md` 토큰을 따른다. 바 자체는 `border-t border-gray-200 bg-white` 고정, 버튼은 secondary 스타일(`rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50`), 비활성은 `opacity-40 cursor-not-allowed`.
