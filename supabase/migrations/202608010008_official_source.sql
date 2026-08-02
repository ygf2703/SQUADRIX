alter table public.clubs
  add column if not exists official_team_page_url text,
  add column if not exists official_team_id integer,
  add column if not exists official_season_id integer,
  add column if not exists official_source_checked_at timestamptz,
  add column if not exists official_source_status text check (official_source_status in ('unverified', 'available', 'blocked', 'invalid'));
