-- 기존 프로젝트에 이미 schema.sql을 실행하셨다면, 이 파일만 SQL Editor에 추가로 붙여넣고 Run 하세요.

alter table routine_exercises add column if not exists muscle_group text;
alter table workout_sets add column if not exists muscle_group text;

create table if not exists body_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  weight numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table body_weights enable row level security;

create policy "body_weights_owner" on body_weights
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
