-- 이전 마이그레이션을 이미 실행하셨다면, 이 파일만 SQL Editor에 추가로 붙여넣고 Run 하세요.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_owner" on push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
