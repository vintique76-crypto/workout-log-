-- 이미 이전 마이그레이션을 실행하셨다면, 이 파일만 SQL Editor에 추가로 붙여넣고 Run 하세요.

alter table workout_sets add column if not exists rpe int;
alter table workout_sets add column if not exists tag text;
