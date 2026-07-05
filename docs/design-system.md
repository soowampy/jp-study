# jp-study 디자인 시스템 (v1 — issue #10)

> 전 화면 공통 토큰. Tailwind 유틸리티 기준으로 정의한다.
> 기조: 여백을 살린 카드 레이아웃, 라운드·그림자 절제, 포인트 컬러 1개.

## 색

| 역할 | 토큰 | 용도 |
|---|---|---|
| 포인트(primary) | `blue-600` (hover `blue-700`) | 주요 버튼, 진행바, 활성 필터 |
| 페이지 배경 | `gray-50` | body 배경 |
| 서피스 | `white` | 카드·헤더 배경 |
| 보더 | `gray-200` | 카드·구분선 |
| 잉크 | `gray-900` / `gray-600` / `gray-400` | 본문 / 보조 / 희미한 텍스트 |
| 정답(status) | `green-600` (배경 `green-50`, 보더 `green-500`) | 퀴즈 정답 피드백 전용 |
| 오답/실패(status) | `red-600` (배경 `red-50`, 보더 `red-500`) | 퀴즈 오답·생성 실패 전용 |

상태 색(green/red)은 정·오답과 실패 표시 **전용**이다. 일반 UI 요소에 재사용하지 않는다.

## 타이포

- 페이지 제목: `text-2xl font-bold`
- 섹션/카드 제목: `text-sm font-semibold`
- 본문: `text-sm`, 보조: `text-xs text-gray-500`
- 히어로 숫자(진도율·퀴즈 문제): `text-3xl font-bold`
- 텍스트는 잉크 색만 사용한다. 시리즈/포인트 색을 텍스트에 입히지 않는다(뱃지·마크가 색을 담당).

## 컴포넌트

- **카드**: `rounded-xl border border-gray-200 bg-white p-4~6 shadow-sm`
- **버튼(primary)**: `rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700`
- **버튼(secondary)**: `rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50`
- **버튼(disabled)**: `opacity-40 cursor-not-allowed`
- **선택지(퀴즈 보기)**: secondary 스타일 + 피드백 단계에서 정답 `border-green-500 bg-green-50`, 선택한 오답 `border-red-500 bg-red-50`
- **뱃지**: `rounded bg-gray-100 px-2 py-1 text-xs text-gray-600` (레벨 뱃지 등)
- **입력/셀렉트**: `rounded-lg border border-gray-300 px-3 py-2 text-sm`

## 레이아웃

- **글로벌 헤더**: 모든 페이지 상단 고정. `border-b border-gray-200 bg-white`, 내부 `mx-auto max-w-3xl px-6 h-14 flex items-center justify-between`. 좌: 홈 링크(서비스명 "JP 단어장", `font-bold`), 우: "새 단어장" primary 버튼(`/upload`).
- **본문 컨테이너**: `mx-auto max-w-3xl p-6` (홈은 `max-w-2xl` 유지 가능)
- 페이지 배경 `bg-gray-50` 위에 white 카드가 얹히는 구조.

## 로딩

- **Spinner**: `role="status"` + sr-only 라벨 "로딩 중". 원형 보더 스핀(`animate-spin`, `border-2 border-gray-300 border-t-blue-600`).
- 페이지 전환: 각 라우트 `loading.tsx`에서 Spinner를 중앙 배치.
- 잡 진행률(파싱/생성)은 기존 폴링 진행바 유지 — Spinner로 대체하지 않는다.
