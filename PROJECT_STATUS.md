# 운동 기록 앱 — 프로젝트 현황 (2026-07-30 기준)

세트/횟수/무게를 기록하고 루틴·통계·근력지표까지 관리하는 개인용 Next.js 운동 기록 웹앱(PWA).
다음 세션에서 바로 이어서 작업할 수 있도록 현재 상태를 정리한 문서입니다.

## 배포 정보

- **로컬 경로**: `C:\Users\kc2473\Desktop\workout-log`
- **GitHub**: https://github.com/vintique76-crypto/workout-log- (private, `main` 브랜치, push하면 Vercel 자동 재배포)
- **배포 URL**: https://workout-log-navy-iota.vercel.app
- **Supabase 프로젝트**: `cqbrfmxlxltzeugqgjwo` (https://cqbrfmxlxltzeugqgjwo.supabase.co)
  - SQL Editor: https://supabase.com/dashboard/project/cqbrfmxlxltzeugqgjwo/sql/new
  - 인증: 이메일/비밀번호, "Confirm email" 옵션 꺼둔 상태(가입 즉시 로그인 가능)

## 스택

Next.js 15(App Router) + React 19 · Supabase(Auth+Postgres) · framer-motion · recharts · Pretendard 웹폰트(CDN) · PWA(manifest.json + sw.js) · tesseract.js(무료 클라이언트 OCR, 서버/API 키 없이 브라우저에서 이미지 텍스트 인식)

## 디자인 시스템

다크 테마(완전 검정 아님) — 배경 `#1c1917`(따뜻한 차콜), 포인트 컬러 `#e8825a`(테라코타). CSS 변수는 `app/globals.css`에 정의(`--bg`, `--bg-elevated`, `--bg-elevated-2`, `--text`, `--text-muted`, `--accent` 등). 공통 스타일 상수는 `lib/ui.js`(`inputStyle`, `primaryBtn`, `smallBtn`, `card`). 하단 고정 탭바(홈/히스토리/기록/통계/더보기) 구조.

## DB 스키마 (Supabase Postgres, 전부 RLS 적용 · user_id = auth.uid())

- `routines` (id, user_id, name, created_at)
- `routine_exercises` (id, routine_id, name, order_index, muscle_group)
- `workouts` (id, user_id, routine_id, date, **duration_seconds**, created_at)
- `workout_sets` (id, workout_id, exercise_name, set_index, reps, weight, muscle_group, **rpe**, **tag**, created_at)
- `body_weights` (id, user_id, date, weight, **skeletal_muscle_mass**, **body_fat_percent**, created_at) — unique(user_id, date)
- `goals` (id, user_id unique, target_weight, target_skeletal_muscle, target_body_fat, updated_at)

`supabase/schema.sql`이 마스터(새로 시작할 때 전체 실행). `migration_002~005_*.sql`은 이미 전부 실행 완료된 증분 마이그레이션 — 새 컬럼/테이블 추가할 땐 `migration_006_*.sql` 형식으로 이어서 만들 것.

## 페이지 구조 (`app/`)

| 경로 | 내용 |
|---|---|
| `/login` | 이메일/비밀번호 로그인·회원가입 |
| `/` | 캐릭터 진화(최근 90일 활동일 기준), 이번 주 통계, 오늘의 추천 루틴(가장 안 쓴 루틴 자동 추천), 코칭 인사이트 1개, 최근 기록 |
| `/workout/new` | 운동 기록 입력 — 고스트 데이터, 다음 목표 제안(점진적 과부하), 스테퍼 버튼, RPE/태그, 자동 휴식 타이머, 저장 시 소요시간 자동 기록, 저장 후 오운완 공유 모달. `?routine=<id>` 쿼리로 루틴 미리 선택 가능 |
| `/workout/[id]/edit` | 기존 기록 수정 (동일 UI, rpe/tag 포함 로드) |
| `/history` | 기록 목록 — 펼치기/수정/삭제/공유, 소요시간 표시 |
| `/routines` | 루틴 CRUD, 루틴 템플릿 가져오기, 종목 선택 피커, 구성 부위 색상 칩 |
| `/stats` | 부위별 볼륨 통계(최근 7일/30일/전체) + 세트 수 기준 밸런스 레이더 차트 |
| `/progress` | 종목별 무게·볼륨 그래프 + 예상 1RM |
| `/strength` | 3대 측정(스쿼트+벤치+데드) 합계·마일스톤, 성별 기준 근력 등급, 예상 1RM 랭킹 |
| `/weight` | 체중·체성분(골격근량/체지방률) 기록 + 목표 설정/진행 표시 |
| `/coach` | 코칭 인사이트 전체 목록(규칙 기반, 무료) |
| `/export` | 운동/체중 기록을 CSV로 다운로드 |
| `/more` | 더보기 메뉴 진입점 + 로그아웃 |

## 주요 컴포넌트 (`components/`)

`BottomTabBar` · `RestTimer`(외부 `autoStartSignal` prop으로 자동시작, 하단 플로팅 +30초/+1분 연장) · `MoveIconBadge`(동작유형 아이콘, 클릭시 피커 열기) · `ExercisePicker`(67개 종목 바텀시트) · `RoutineTemplatePicker` · `SetTagPicker`(RPE+태그) · `ShareWorkoutModal`(오운완 텍스트/이미지 공유) · `WeeklyReportModal`(주간 리포트 텍스트/이미지 공유) · `WorkoutCharacter`(5단계 진화 SVG) · `GoalProgress`(홈 화면 목표 대비 체중/골격근량/체지방률 진행률 카드) · `WeeklyActivityBars`(홈 화면 최근 7일 세트 수 미니 바 그래프 + 평균 소요시간 + 리포트 공유 버튼) · `InsightIcon`(코칭 인사이트 타입별 아이콘) · `EmptyState`(공용 빈 상태 일러스트+문구) · `PageTransition` · `RegisterSW` · `icons.jsx`/`movementIcons.jsx`(아이콘 세트)

## 주요 유틸 (`lib/`)

`useSession` · `useExerciseStats`(PR맵+자동완성 목록) · `useLastSessionSets`(고스트 데이터용) · `exerciseLibrary.js`(67개 종목, 부위+아이콘 매핑) · `exerciseIcon.js`(키워드 기반 아이콘 자동매칭) · `routineTemplates.js`(5분할/Starting Strength/StrongLifts 5x5/PHUL/PPL/Wendler 5·3·1/아놀드 스플릿) · `insights.js`(무료 규칙기반 코칭 5종) · `oneRepMax.js`(Epley 1RM, 3대 마일스톤) · `strengthStandards.js`(성별×종목 근력등급 근사표) · `bodyCompStandards.js`(성별 기준 골격근량/체지방률 근사 등급·백분위) · `inbodyOcr.js`(tesseract.js로 인바디 사진에서 체중/골격근량/체지방률 숫자 추출, 무료) · `exportCsv.js`(CSV 다운로드) · `overloadSuggestion.js`(지난 세션 기반 다음 목표 제안 — 무게+2.5kg 또는 횟수+1) · `weeklyReport.js`(주간 리포트 텍스트 생성) · `shareWorkout.js`/`shareImage.js`(공유 텍스트/캔버스 이미지, `generateWeeklyReportImage` 포함) · `josa.js`(한국어 조사 자동처리)

## 완성된 기능 (시간순 요약)

1. MVP — 인증, 루틴 CRUD, 운동 기록, 히스토리, 진행 그래프
2. 휴식 타이머(수동), PR 표시, 종목 자동완성, 루틴 수정
3. 부위별 통계, 체중 기록, PWA 설치 지원
4. 기록 수정 기능
5. 다크 테마 전면 리디자인 + 하단 탭바 (요청: "양산형 느낌" 개선)
6. Pretendard 폰트, framer-motion 애니메이션, 동작유형 아이콘
7. 운동 종목 선택 피커(바텀시트) + 머신 아이콘 (요청: 레그프레스 아이콘 부정확 지적 반영)
8. 무료 규칙기반 코칭 인사이트 `/coach` (LLM 없이 볼륨추세/정체/불균형/과훈련 감지)
9. 검증된 루틴 템플릿 7종 + 종목 라이브러리 67개 확장 (요청: "짐워크/플릭/인아웃"과 경쟁력 있게)
10. 스마트 기록 UX — 고스트 데이터, 원터치 완료, 자동 타이머+연장버튼, RPE/태그
11. 오운완 공유 — 카톡용 텍스트 복사 + 캔버스 요약 이미지
12. 3대 측정 + 예상 1RM 랭킹, 대시보드 캘린더 히트맵 제거(캐릭터와 중복이라 삭제 요청)
13. 체중대비 근력등급(성별 토글) + 인바디 체성분 수동기록 + 목표 설정/진행률
14. 운동/체중 기록 CSV 내보내기(`/export`)
15. 인바디 사진 자동인식(무료 클라이언트 OCR로 체중/골격근량/체지방률 자동 입력, 갤러리 선택 가능) + 체성분 근사 등급·백분위 표시 + 홈 화면 목표 달성률 카드(`GoalProgress`)
16. 홈 화면 캐릭터 리디자인 — 뼈만 있는 마른 몸(루키)에서 근육이 붙는 5단계 사람 실루엣(다지는 중/성장 중/탄탄/챔피언)으로 전면 교체 (요청: "운동과 관련된 캐릭터가 더 좋을듯")
17. `/stats`에 부위 밸런스 레이더 차트(세트 수 기준) 추가 — 볼륨(kg) 막대그래프와 별개로, 부위별 절대 세트 수를 6각형 레이더로 보여줘서 특정 부위 소홀 여부를 한눈에 파악
18. 전반적 시각 요소 보강(요청: "적재적소에 시각적인 요소") — 코칭 인사이트 타입별 아이콘(`InsightIcon`, `lib/insights.js`에 `type` 필드 추가), 홈 화면 최근 7일 세트 수 미니 바 그래프(`WeeklyActivityBars`), 여러 페이지에 흩어져 있던 "기록 없음" 회색 텍스트를 공용 `EmptyState` 컴포넌트로 통일, 루틴 카드에 구성 부위 색상 칩(`lib/muscleGroupColors.js`) 추가
19. 운동 소요시간 자동 기록(`workouts.duration_seconds`, migration_005) + 히스토리/홈 화면 평균 소요시간 표시, 점진적 과부하 다음 목표 제안(`lib/overloadSuggestion.js`), `/stats` 레이더에 권장 최소 세트 수 점선 오버레이, 홈 화면 "이번 주 활동" 카드에 주간 리포트 텍스트/이미지 공유 버튼(`WeeklyReportModal`) 추가

## 알려진 이슈 · 작업 시 유의사항

- **Windows dev 서버 캐시 버그**: 파일을 여러 번 빠르게 수정하면 `.next/static/chunks/.../page.js`에서 `UNKNOWN: unknown error` 발생. `preview_stop` → `rm -rf .next` → `preview_start` 순서로 재시작하면 해결됨. 브라우저 콘솔에 뜨는 옛날 에러 로그가 실제로는 stale인 경우가 많으니, **서버 로그(`preview_logs`)를 우선 신뢰**할 것.
- **자동화 브라우저 세션에서는 CSS/framer-motion/recharts 애니메이션이 절대 진행되지 않음** — Claude Code의 Browser 미리보기 패널이 화면에 표시(compositing)되지 않는 상태로 자동화 테스트를 하면, `requestAnimationFrame` 기반 애니메이션(순수 CSS transition 포함)이 전부 `initial` 상태에 멈춰있는 것처럼 보인다(2026-07-29 확인: 레이더 차트가 중심에 뭉쳐 보여서 처음엔 recharts+React19 버그로 오판하고 `isAnimationActive={false}`로 우회했는데, 이후 순수 `<div>` CSS transition으로 재현해보니 그것도 안 움직여서 **테스트 환경 자체의 한계**임을 확인함. 실제 사용자 브라우저에서는 정상 작동할 가능성이 높음). 따라서 애니메이션이 "안 보인다"고 라이브러리 버그로 단정하지 말 것 — `getComputedStyle`로 최종 목표값이 아니라 DOM에 전달된 `animate`/목표 props가 논리적으로 맞는지, 그리고 텍스트로 표현되는 계산 결과가 맞는지로 검증하고, 실제 시각적 애니메이션 확인은 사용자에게 부탁할 것. `/stats`의 Radar는 `isAnimationActive={false}`로 남겨뒀지만(정적이어도 기능상 문제 없음), 이게 "버그 우회"가 아니라 "애니메이션 없이도 무방한 선택"이었다는 점을 기억할 것.
- **다른 세션과 폴더를 공유할 때 `.next` 절대 건드리지 말 것**: 이 프로젝트 폴더는 종종 여러 Claude 대화창이 동시에 열려 있고, 각자 자기 세션에서 `npm run dev`를 이미 띄워둔 상태일 수 있다. 이때 다른 세션이 `npm run build`(프로덕션 빌드)나 `rm -rf .next`를 실행하면, 실행 중이던 dev 서버의 `.next` 캐시가 깨져서 500 Internal Server Error가 난다(2026-07-29에 실제로 두 번 발생, 사용자가 다른 세션에서 서버를 수동 재시작해서 복구). 코드 검증이 필요하면 `npm run build` 대신 이미 떠 있는 dev 서버로 접속해 `preview_logs`/콘솔 에러로 확인할 것. 포트 충돌이 나면 다른 세션을 종료해달라고 요청한 뒤 이 세션이 직접 서버를 띄우는 방법도 있음(다른 세션의 프로세스를 강제 종료하는 것은 안전장치로 막혀 있어 불가).
- **좁은 뷰포트에서 `computer{left_click, ref}`가 안 먹힐 때가 있음**: 뷰포트가 좁을 때(모바일 사이즈 등) `/workout/new`의 "기록 저장" 버튼처럼 ref 기반 좌표 클릭이 계속 실패하면서 아무 반응도 없는(에러도 안 뜨고 폼도 그대로인) 경우가 있었다(2026-07-30). 이건 앱 버그가 아니라 브라우저 자동화 도구의 클릭 좌표 계산 문제였음 — `javascript_tool`로 `document.querySelector`해서 `.click()`을 직접 호출하면 정상 동작함. 클릭이 반응 없어 보이면 앱을 의심하기 전에 이 방법으로 먼저 확인할 것.
- **모달 안 닫히던 버그**: `AnimatePresence` + Fragment/배열로 감싼 children 조합에서 실제로 닫히지 않는 버그가 있었음. 지금은 모든 바텀시트 모달을 `if (!open) return null;` 단순 조건부 렌더링으로 통일(exit 애니메이션 없이 즉시 언마운트). 새 모달 만들 때 이 패턴 따를 것.
- **React StrictMode 이중 effect 버그**: `RestTimer`의 자동시작 로직에서 boolean ref("최초 1회만 skip")가 dev 모드 이중 실행으로 오작동했음. 값 비교 방식(이전 signal 값을 ref에 저장하고 비교)으로 수정 완료.
- **stale closure 버그**: 같은 렌더 안에서 `setState` 기반 업데이트 함수를 연속 호출하면 나중 호출이 이전 호출을 덮어쓰는 문제가 있었음 → 모든 exercises/sets 업데이트 함수를 functional setState(`setX(prev => ...)`)로 통일해서 해결.
- **사용자는 코딩 초보** — SQL 실행, 환경변수 설정 등은 정확한 단계와 클릭 위치까지 안내해야 함. 매 기능 완성 후 로컬 → 배포 순으로 실제 브라우저 테스트하고 결과를 보고하는 흐름을 계속 유지할 것.
- 테스트 후에는 항상 Supabase REST API로 테스트 데이터를 정리(DELETE)하고 커밋함.

## 남은 작업 / 다음 후보

1. **AI 기능 (보류 중 — 비용 발생)**: 사용자가 "지금은 무료 범위에서" 진행하기로 결정, 나중에 Anthropic API 크레딧 충전하면:
   - 자연어로 운동 기록 입력("벤치 60키로 10개 3세트" → 자동 파싱) — Claude tool-use로 구조화 추출, 서버사이드 API route 필요(`app/api/parse-workout/route.js` 예정, 클라이언트에 키 노출 금지)
   - `/coach` 페이지를 진짜 LLM 자연어 코칭으로 업그레이드
   - 인바디 사진의 "숫자 추출"은 무료 클라이언트 OCR(tesseract.js)로 이미 구현됨(`/weight`, `lib/inbodyOcr.js`) — 여기서 더 나아가 사진을 실제로 "해석/맥락 분석"해서 자유 형식 조언을 주는 수준은 비전 지원 LLM이 필요해 여전히 보류 중
   - 이 프로젝트 전용 `ANTHROPIC_API_KEY` 필요(.env.local + Vercel 환경변수), vintage-match와는 별도 설정 필요
2. **실제 폰 사용 테스트** — 지금까지 전부 자동화 브라우저 테스트만 진행됨. 엄지 조작감, 실제 PWA 설치 경험, 헬스장 조명에서의 가독성 등은 아직 검증 안 됨. 특히 인바디 사진 OCR은 실제 인쇄물 사진으로 아직 테스트 안 됨(캔버스로 그린 테스트 텍스트로만 검증, 실물 인쇄 사진에서의 인식률은 미지수). 계속 최우선 권장 중.
3. **네이티브 앱 전환(Capacitor)** — 사용자가 장기적으로 앱스토어/플레이스토어 출시를 원함. 지금 코드가 순수 웹 기반이라 전환은 수월한 구조. 애플 개발자($99/년)·구글 플레이($25/1회) 계정은 사용자 본인이 결제해야 함.
4. **보류된 아이디어**: 알림/리마인더(PWA 푸시 인프라 필요해 보류).
