create or replace function public.import_players_csv(rows jsonb) returns integer language plpgsql security definer set search_path = public as $$
declare team_record record; item jsonb; player_uuid uuid; imported_count integer := 0; status_value public.player_status;
begin
  if not public.can_edit() then raise exception 'אין הרשאה לייבא נתונים'; end if;
  select id,current_season_id into team_record from public.teams where current_season_id is not null limit 1;
  if team_record.id is null then raise exception 'לא נמצאה קבוצה ועונה פעילות'; end if;
  for item in select value from jsonb_array_elements(rows) loop
    if coalesce(trim(item->>'full_name'),'') = '' or coalesce(trim(item->>'primary_position'),'') = '' then raise exception 'לכל שחקן נדרשים שם מלא ותפקיד ראשי'; end if;
    status_value := coalesce(nullif(item->>'squad_status','')::public.player_status, 'active'::public.player_status);
    insert into public.players(full_name,birth_date,dominant_foot,source) values (trim(item->>'full_name'), nullif(item->>'birth_date','')::date, nullif(item->>'dominant_foot',''), 'csv_import') returning id into player_uuid;
    insert into public.player_seasons(player_id,team_id,season_id,shirt_number,primary_position,secondary_position,squad_status,expected_absence_until)
    values(player_uuid,team_record.id,team_record.current_season_id,nullif(item->>'shirt_number','')::smallint,trim(item->>'primary_position'),nullif(item->>'secondary_position',''),status_value,nullif(item->>'expected_absence_until','')::date);
    imported_count := imported_count + 1;
  end loop;
  return imported_count;
end $$;

create or replace function public.import_matches_csv(rows jsonb) returns integer language plpgsql security definer set search_path = public as $$
declare team_record record; item jsonb; imported_count integer := 0;
begin
  if not public.can_edit() then raise exception 'אין הרשאה לייבא נתונים'; end if;
  select id,current_season_id into team_record from public.teams where current_season_id is not null limit 1;
  if team_record.id is null then raise exception 'לא נמצאה קבוצה ועונה פעילות'; end if;
  for item in select value from jsonb_array_elements(rows) loop
    if coalesce(trim(item->>'opponent_name'),'') = '' or coalesce(trim(item->>'competition_name'),'') = '' then raise exception 'לכל משחק נדרשים יריבה ומסגרת'; end if;
    if coalesce(item->>'home_or_away','') not in ('home','away') then raise exception 'בית או חוץ חייבים להיות home או away'; end if;
    insert into public.matches(team_id,season_id,competition_name,opponent_name,match_date,kickoff_time,home_or_away,venue,team_score,opponent_score,match_status,source)
    values(team_record.id,team_record.current_season_id,trim(item->>'competition_name'),trim(item->>'opponent_name'),nullif(item->>'match_date','')::date,nullif(item->>'kickoff_time','')::time,item->>'home_or_away',nullif(item->>'venue',''),nullif(item->>'team_score','')::smallint,nullif(item->>'opponent_score','')::smallint,coalesce(nullif(item->>'match_status','')::public.match_status,'scheduled'::public.match_status),'csv_import');
    imported_count := imported_count + 1;
  end loop;
  return imported_count;
end $$;
