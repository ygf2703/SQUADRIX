create type public.schedule_event_type as enum ('training','training_camp','friendly_match');
create type public.schedule_event_status as enum ('planned','confirmed','cancelled');

create table public.team_schedule_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete restrict,
  event_type public.schedule_event_type not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  description text,
  status public.schedule_event_status not null default 'planned',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_event_end_after_start check (ends_at is null or ends_at >= starts_at)
);

create index team_schedule_events_team_season_start_idx on public.team_schedule_events(team_id, season_id, starts_at);
create trigger team_schedule_events_updated before update on public.team_schedule_events for each row execute function public.set_updated_at();
alter table public.team_schedule_events enable row level security;
create policy "authenticated schedule read" on public.team_schedule_events for select to authenticated using (true);
create policy "staff schedule write" on public.team_schedule_events for all to authenticated using (public.can_edit()) with check (public.can_edit());
