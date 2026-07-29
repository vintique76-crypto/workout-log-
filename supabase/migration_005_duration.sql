-- 이전 마이그레이션을 이미 실행하셨다면, 이 파일만 SQL Editor에 추가로 붙여넣고 Run 하세요.

alter table workouts add column if not exists duration_seconds int;
