-- Admin-only workspace reset for preparing a clean demo environment.
create or replace function public.reset_demo_workspace()
returns void language plpgsql security definer set search_path = public as $$
declare target_club_id uuid; new_season_id uuid;
begin
  if not public.is_admin() then raise exception 'Only a system administrator can reset the workspace'; end if;
  delete from public.audit_logs;
  delete from public.goals;
  delete from public.match_player_stats;
  delete from public.matches;
  delete from public.team_schedule_events;
  delete from public.player_seasons;
  delete from public.players;
  delete from public.teams;
  delete from public.seasons;
  select id into target_club_id from public.clubs order by created_at limit 1;
  if target_club_id is null then
    insert into public.clubs (name, short_name, primary_color, secondary_color) values ('מועדון חדש', 'מועדון', '#0A2341', '#FFFFFF') returning id into target_club_id;
  else
    update public.clubs set name = 'מועדון חדש', short_name = 'מועדון', logo_url = null, primary_color = '#0A2341', secondary_color = '#FFFFFF', official_team_page_url = null, official_team_id = null, official_season_id = null, official_source_checked_at = null, official_source_status = null where id = target_club_id;
  end if;
  insert into public.seasons (name, status) values ('עונה חדשה', 'preparation') returning id into new_season_id;
  insert into public.teams (club_id, name, age_group, league_name, district, current_season_id) values (target_club_id, 'קבוצה חדשה', 'טרם הוגדר', 'טרם הוגדר', 'טרם הוגדר', new_season_id);
end;
$$;
revoke all on function public.reset_demo_workspace() from public;
grant execute on function public.reset_demo_workspace() to authenticated;
