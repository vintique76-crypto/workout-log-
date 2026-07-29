-- 이전 마이그레이션을 이미 실행하셨다면, 이 파일만 SQL Editor에 추가로 붙여넣고 Run 하세요.

alter table body_weights add column if not exists skeletal_muscle_mass numeric;
alter table body_weights add column if not exists body_fat_percent numeric;

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  target_weight numeric,
  target_skeletal_muscle numeric,
  target_body_fat numeric,
  updated_at timestamptz not null default now()
);

alter table goals enable row level security;

create policy "goals_owner" on goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
