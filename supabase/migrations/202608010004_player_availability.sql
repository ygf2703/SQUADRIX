alter type public.player_status add value if not exists 'overload';
alter table public.player_seasons add column if not exists expected_absence_until date;
alter table public.player_seasons add constraint player_absence_date_only_for_unavailable check (
  expected_absence_until is null or squad_status in ('injured', 'overload')
);
