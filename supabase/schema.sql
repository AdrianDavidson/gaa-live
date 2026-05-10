-- clubs
create table public.clubs (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  county           text not null default 'Cork',
  primary_colour   text not null default '#006633',
  secondary_colour text not null default '#FFFFFF',
  crest_url        text,
  created_at       timestamptz default now(),
  unique(name, county)
);

-- competitions
create table public.competitions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  short_name text not null,
  county     text not null default 'Cork',
  grade      text not null default 'minor',
  code       text not null default 'hurling',
  season     int  not null default 2026,
  format     text not null default 'league',
  created_at timestamptz default now()
);

-- pros (before games because games references it)
create table public.pros (
  id         uuid primary key default gen_random_uuid(),
  clerk_id   text unique not null,
  name       text not null,
  email      text not null,
  club_id    uuid references public.clubs(id) on delete set null,
  created_at timestamptz default now()
);

-- games
create table public.games (
  id              uuid primary key default gen_random_uuid(),
  competition_id  uuid references public.competitions(id) on delete cascade not null,
  home_club_id    uuid references public.clubs(id) on delete cascade not null,
  away_club_id    uuid references public.clubs(id) on delete cascade not null,
  venue           text,
  start_time      timestamptz not null,
  assigned_pro_id uuid references public.pros(id) on delete set null,
  created_at      timestamptz default now()
);

-- score updates
create table public.score_updates (
  id           uuid primary key default gen_random_uuid(),
  game_id      uuid references public.games(id) on delete cascade not null,
  home_score   text not null,
  away_score   text not null,
  period       text not null check (period in ('Q1','HT','Q2','FT')),
  submitted_by uuid references public.pros(id) on delete set null,
  created_at   timestamptz default now()
);

-- user profiles
create table public.user_profiles (
  id           uuid primary key default gen_random_uuid(),
  clerk_id     text unique not null,
  email        text not null,
  home_club_id uuid references public.clubs(id) on delete set null,
  created_at   timestamptz default now()
);

-- indexes
create index on public.games (start_time);
create index on public.games (competition_id);
create index on public.score_updates (game_id, created_at desc);
create index on public.clubs (county);

-- row level security
alter table public.clubs          enable row level security;
alter table public.competitions   enable row level security;
alter table public.games          enable row level security;
alter table public.pros           enable row level security;
alter table public.score_updates  enable row level security;
alter table public.user_profiles  enable row level security;

-- public read policies
create policy "Public read clubs"        on public.clubs        for select using (true);
create policy "Public read competitions" on public.competitions  for select using (true);
create policy "Public read games"        on public.games        for select using (true);
create policy "Public read scores"       on public.score_updates for select using (true);
