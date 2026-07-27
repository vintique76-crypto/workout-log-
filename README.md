# 내 운동 기록

세트/횟수/무게를 기록하고, 루틴을 관리하고, 진행 그래프로 변화를 확인하는 Next.js 운동 기록 앱.
로그인하면 Supabase에 기록이 저장되어 휴대폰/PC 어디서든 같은 기록을 볼 수 있습니다.

## 로컬에서 실행하기

1. 의존성 설치
   ```bash
   npm install
   ```
2. `.env.local.example`을 복사해 `.env.local`을 만들고, Supabase 값을 채웁니다.
   ```
   NEXT_PUBLIC_SUPABASE_URL=여기에_붙여넣기
   NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_붙여넣기
   ```
3. Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql` 내용을 실행해 테이블을 만듭니다.
4. 개발 서버 실행 후 http://localhost:3000 접속
   ```bash
   npm run dev
   ```

## 배포 (Vercel)

1. 이 폴더를 GitHub 레포지토리에 올립니다.
2. https://vercel.com 에서 GitHub 레포를 Import 합니다.
3. 프로젝트 설정 → Environment Variables 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 추가합니다.
4. Deploy 하면 `*.vercel.app` 주소가 생성됩니다.

## 데이터 구조

- `routines` / `routine_exercises` — 루틴과 루틴에 속한 운동 종목
- `workouts` — 하루 운동 기록 1건 (루틴 연결 또는 자유 기록)
- `workout_sets` — 세트별 횟수/무게

모든 테이블은 Row Level Security로 보호되어 있어 각 사용자는 본인 기록만 보고 수정할 수 있습니다.
