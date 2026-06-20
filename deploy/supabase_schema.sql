-- HeroQuest MMO v1.1 does not require Supabase for gameplay.
-- This optional schema is a future expansion point for accounts, seasons, and persistent characters.

create table if not exists public.hero_profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  level integer not null default 1,
  xp integer not null default 0,
  coins integer not null default 50,
  equipped_weapon text not null default 'wooden_sword',
  equipped_armor text not null default 'traveler_tunic',
  inventory jsonb not null default '[]'::jsonb,
  quest_progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_profiles enable row level security;
