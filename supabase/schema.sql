-- Supabase SQL Editor에 이 파일 전체를 붙여넣고 Run 하세요.

create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  name text not null,
  order_index int not null default 0
);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid references routines(id) on delete set null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_name text not null,
  set_index int not null,
  reps int not null,
  weight numeric not null,
  created_at timestamptz not null default now()
);

alter table routines enable row level security;
alter table routine_exercises enable row level security;
alter table workouts enable row level security;
alter table workout_sets enable row level security;

create policy "routines_owner" on routines
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "routine_exercises_owner" on routine_exercises
  for all
  using (exists (select 1 from routines r where r.id = routine_exercises.routine_id and r.user_id = auth.uid()))
  with check (exists (select 1 from routines r where r.id = routine_exercises.routine_id and r.user_id = auth.uid()));

create policy "workouts_owner" on workouts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workout_sets_owner" on workout_sets
  for all
  using (exists (select 1 from workouts w where w.id = workout_sets.workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from workouts w where w.id = workout_sets.workout_id and w.user_id = auth.uid()));
