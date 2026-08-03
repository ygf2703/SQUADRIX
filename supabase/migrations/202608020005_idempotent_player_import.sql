-- One-time cleanup: retain the oldest player record for each duplicated full name in the active team and season.
with ranked as (
  select p.id as player_id, row_number() over (partition by lower(p.full_name), ps.team_id, ps.season_id order by p.created_at, p.id) as row_number
  from public.players p
  join public.player_seasons ps on ps.player_id = p.id
)
delete from public.players p using ranked r where p.id = r.player_id and r.row_number > 1;

create or replace function public.import_players_csv(rows jsonb) returns integer language plpgsql security definer set search_path = public as $$
declare team_record record; item jsonb; player_uuid uuid; season_uuid uuid; imported_count integer := 0; status_value public.player_status;
begin
  if not public.can_edit() then raise exception 'No permission to import data'; end if;
  select id,current_season_id into team_record from public.teams where current_season_id is not null limit 1;
  if team_record.id is null then raise exception 'No active team and season found'; end if;
  for item in select value from jsonb_array_elements(rows) loop
    if coalesce(trim(item->>'full_name'),'') = '' or coalesce(trim(item->>'primary_position'),'') = '' then raise exception 'Each player requires full_name and primary_position'; end if;
    status_value := coalesce(nullif(item->>'squad_status','')::public.player_status, 'active'::public.player_status);
    select ps.id, p.id into season_uuid, player_uuid
    from public.player_seasons ps join public.players p on p.id = ps.player_id
    where ps.team_id = team_record.id and ps.season_id = team_record.current_season_id and lower(p.full_name) = lower(trim(item->>'full_name'))
    limit 1;
    if season_uuid is null then
      insert into public.players(full_name,birth_date,dominant_foot,source) values (trim(item->>'full_name'), nullif(item->>'birth_date','')::date, nullif(item->>'dominant_foot',''), 'csv_import') returning id into player_uuid;
      insert into public.player_seasons(player_id,team_id,season_id,shirt_number,primary_position,secondary_position,squad_status,expected_absence_until)
      values(player_uuid,team_record.id,team_record.current_season_id,nullif(item->>'shirt_number','')::smallint,trim(item->>'primary_position'),nullif(item->>'secondary_position',''),status_value,nullif(item->>'expected_absence_until','')::date) returning id into season_uuid;
    else
      update public.players set birth_date = nullif(item->>'birth_date','')::date, dominant_foot = nullif(item->>'dominant_foot','') where id = player_uuid;
      update public.player_seasons set shirt_number = nullif(item->>'shirt_number','')::smallint, primary_position = trim(item->>'primary_position'), secondary_position = nullif(item->>'secondary_position',''), squad_status = status_value, expected_absence_until = nullif(item->>'expected_absence_until','')::date where id = season_uuid;
    end if;
    insert into public.player_season_statistics(player_season_id,appearances,starts,substitute_appearances,substituted,minutes_played,goals,assists,yellow_cards,red_cards)
    values(season_uuid,coalesce(nullif(item->>'appearances','')::smallint,0),coalesce(nullif(item->>'starts','')::smallint,0),coalesce(nullif(item->>'substitute_appearances','')::smallint,0),coalesce(nullif(item->>'substituted_off','')::smallint,0),coalesce(nullif(item->>'minutes_played','')::smallint,0),coalesce(nullif(item->>'goals','')::smallint,0),coalesce(nullif(item->>'assists','')::smallint,0),coalesce(nullif(item->>'yellow_cards','')::smallint,0),coalesce(nullif(item->>'red_cards','')::smallint,0))
    on conflict (player_season_id) do update set appearances = excluded.appearances, starts = excluded.starts, substitute_appearances = excluded.substitute_appearances, substituted = excluded.substituted, minutes_played = excluded.minutes_played, goals = excluded.goals, assists = excluded.assists, yellow_cards = excluded.yellow_cards, red_cards = excluded.red_cards, updated_at = now();
    imported_count := imported_count + 1;
  end loop;
  return imported_count;
end $$;
