create table public.match_lineups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_season_id uuid not null references public.player_seasons(id) on delete cascade,
  formation text not null check (formation in ('4-3-3', '4-4-2', '3-5-2')),
  formation_slot text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(match_id, formation_slot),
  unique(match_id, player_season_id)
);

create index match_lineups_match_id_idx on public.match_lineups(match_id);
create trigger match_lineups_updated before update on public.match_lineups for each row execute function public.set_updated_at();

alter table public.match_lineups enable row level security;
create policy "authenticated read match lineups" on public.match_lineups for select to authenticated using(true);
create policy "staff writes match lineups" on public.match_lineups for all to authenticated using(public.can_edit()) with check(public.can_edit());
