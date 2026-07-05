# issue-9 — 진도 대시보드

> GitHub: soowampy/jp-study#9
> 홈에서 진도율=(레벨 4+ 수)/(전체 수)×100, 오늘 복습 수·미학습 수, 레벨별(0~5) 막대그래프, 단어장별 진도.
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

### lib/dashboard — computeDashboard (순수 집계)

- [x] **진도율**: 전체 4개 중 레벨 4+가 2개면 progressRate=50. (AC1)
- [x] **단어 0개 방어**: 단어가 없으면 progressRate=0 (NaN 방지).
- [x] **오늘 복습 수**: `nextReviewDate<=today`(경계 포함) 단어 수. (AC2)
- [x] **미학습 수**: SRS 없는 단어 수. (AC2)
- [x] **레벨 분포**: levelCounts는 길이 6(레벨 0~5), 미학습은 레벨 0으로 집계. (AC3)

### ProgressDashboard (컴포넌트)

- [x] **진도율 표시**: 진도율 퍼센트가 보인다. (AC1)
- [x] **오늘 복습·미학습 표시**: 오늘 복습 수와 미학습 수가 보인다. (AC2)
- [x] **레벨 막대그래프**: Lv.0~Lv.5 라벨과 각 레벨 개수가 막대로 표시된다. (AC3)
- [x] **단어장별 진도**: 각 단어장 이름과 진도율이 표시된다. (AC4)

## 관련 파일 (Green에서 생성/수정)

- `lib/dashboard.ts` — `DashboardStats`, `computeDashboard`, `SetProgress` 타입
- `app/_components/ProgressDashboard.tsx` — 진도율·복습/미학습·레벨 막대·단어장별 진도 UI
- (글루) `app/page.tsx` — Word+WordSrs 조회 → computeDashboard → ProgressDashboard 렌더

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본, 기존 톤(gray 보더 카드, blue-600 포인트) 유지.
막대그래프는 div 기반 가로 막대(라벨 Lv.N + 개수 + 비율 폭). 차트 작성 전 dataviz 스킬 참조.
