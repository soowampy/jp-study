# issue-1 — 프로젝트 셋업 + DB 스키마 + 홈(빈 상태)

> GitHub: soowampy/jp-study#1
> tdd-green 추적용 시나리오 문서. 각 체크박스 = 하나의 테스트 케이스.

## 테스트 시나리오 (= 테스트 케이스)

- [x] **db 라운드트립**: `VocabSet → Word → WordSrs`와 `QuizAttempt`를 생성·조회해 4개 테이블/모델과 관계가 동작함을 검증한다. (AC1)
- [x] **VocabSetList 빈 상태**: `sets=[]`이면 "단어장이 없습니다"와 업로드 링크(`/upload`)가 보인다. (AC2)
- [x] **VocabSetList 목록 표시**: `sets`에 단어장이 있으면 각 이름이 보인다. (AC3)

## 관련 파일 (Green에서 생성)

- `lib/db.ts` — PrismaClient 싱글턴
- `app/_components/VocabSetList.tsx` — 단어장 목록 프레젠테이션 컴포넌트
- `app/page.tsx` — 홈(Prisma 조회 → VocabSetList)
- Prisma 마이그레이션 실행 (4개 테이블 생성)

## 디자인 참고

design-system.md / CLAUDE.md 없음 → Tailwind 기본 컨벤션만 따른다. 최소한의 빈 상태 UI.
