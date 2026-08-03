create table public.player_season_statistics (
  player_season_id uuid primary key references public.player_seasons(id) on delete cascade,
  appearances smallint not null default 0 check (appearances >= 0),
  starts smallint not null default 0 check (starts >= 0),
  substitute_appearances smallint not null default 0 check (substitute_appearances >= 0),
  substituted smallint not null default 0 check (substituted >= 0),
  minutes_played smallint not null default 0 check (minutes_played >= 0),
  goals smallint not null default 0 check (goals >= 0),
  assists smallint not null default 0 check (assists >= 0),
  yellow_cards smallint not null default 0 check (yellow_cards >= 0),
  red_cards smallint not null default 0 check (red_cards >= 0),
  source text not null default 'csv_import',
  updated_at timestamptz not null default now()
);

create trigger player_season_statistics_updated before update on public.player_season_statistics for each row execute function public.set_updated_at();
alter table public.player_season_statistics enable row level security;
create policy "authenticated read player season statistics" on public.player_season_statistics for select to authenticated using(true);
create policy "staff writes player season statistics" on public.player_season_statistics for all to authenticated using(public.can_edit()) with check(public.can_edit());

create or replace function public.import_players_csv(rows jsonb) returns integer language plpgsql security definer set search_path = public as $$
declare team_record record; item jsonb; player_uuid uuid; season_uuid uuid; imported_count integer := 0; status_value public.player_status;
begin
  if not public.can_edit() then raise exception 'No permission to import data'; end if;
  select id,current_season_id into team_record from public.teams where current_season_id is not null limit 1;
  if team_record.id is null then raise exception 'No active team and season found'; end if;
  for item in select value from jsonb_array_elements(rows) loop
    if coalesce(trim(item->>'full_name'),'') = '' or coalesce(trim(item->>'primary_position'),'') = '' then raise exception 'Each player requires full_name and primary_position'; end if;
    status_value := coalesce(nullif(item->>'squad_status','')::public.player_status, 'active'::public.player_status);
    insert into public.players(full_name,birth_date,dominant_foot,source) values (trim(item->>'full_name'), nullif(item->>'birth_date','')::date, nullif(item->>'dominant_foot',''), 'csv_import') returning id into player_uuid;
    insert into public.player_seasons(player_id,team_id,season_id,shirt_number,primary_position,secondary_position,squad_status,expected_absence_until)
    values(player_uuid,team_record.id,team_record.current_season_id,nullif(item->>'shirt_number','')::smallint,trim(item->>'primary_position'),nullif(item->>'secondary_position',''),status_value,nullif(item->>'expected_absence_until','')::date) returning id into season_uuid;
    insert into public.player_season_statistics(player_season_id,appearances,starts,substitute_appearances,substituted,minutes_played,goals,assists,yellow_cards,red_cards)
    values(season_uuid,coalesce(nullif(item->>'appearances','')::smallint,0),coalesce(nullif(item->>'starts','')::smallint,0),coalesce(nullif(item->>'substitute_appearances','')::smallint,0),coalesce(nullif(item->>'substituted_off','')::smallint,0),coalesce(nullif(item->>'minutes_played','')::smallint,0),coalesce(nullif(item->>'goals','')::smallint,0),coalesce(nullif(item->>'assists','')::smallint,0),coalesce(nullif(item->>'yellow_cards','')::smallint,0),coalesce(nullif(item->>'red_cards','')::smallint,0));
    imported_count := imported_count + 1;
  end loop;
  return imported_count;
end $$;
