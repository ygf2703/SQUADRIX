-- A match report is saved atomically: final score and all player-match rows.
-- This keeps the player card, the statistics dashboard and the match view on
-- the same source of truth: public.match_player_stats.

create or replace function public.save_match_report(
  target_match_id uuid,
  target_team_score smallint,
  target_opponent_score smallint,
  target_status public.match_status,
  stat_rows jsonb
)
returns void language plpgsql security definer set search_path = public as $$
declare target_team_id uuid;
declare item jsonb;
declare season_id uuid;
begin
  select team_id into target_team_id from public.matches where id = target_match_id;
  if target_team_id is null then raise exception 'Match not found'; end if;
  if not public.can_edit_team(target_team_id) then raise exception 'Not authorized'; end if;
  if target_status = 'completed' and (target_team_score is null or target_opponent_score is null) then
    raise exception 'Completed matches require a final score';
  end if;

  for item in select value from jsonb_array_elements(stat_rows) loop
    season_id := (item->>'player_season_id')::uuid;
    if not exists (select 1 from public.player_seasons where id = season_id and team_id = target_team_id) then
      raise exception 'A player stat does not belong to the match team';
    end if;

    insert into public.match_player_stats (
      match_id, player_season_id, squad_status, started, minutes_played,
      goals, assists, yellow_cards, red_cards
    ) values (
      target_match_id, season_id, (item->>'squad_status')::public.squad_status,
      coalesce((item->>'started')::boolean, false), coalesce((item->>'minutes_played')::smallint, 0),
      coalesce((item->>'goals')::smallint, 0), coalesce((item->>'assists')::smallint, 0),
      coalesce((item->>'yellow_cards')::smallint, 0), coalesce((item->>'red_cards')::smallint, 0)
    ) on conflict (match_id, player_season_id) do update set
      squad_status = excluded.squad_status,
      started = excluded.started,
      minutes_played = excluded.minutes_played,
      goals = excluded.goals,
      assists = excluded.assists,
      yellow_cards = excluded.yellow_cards,
      red_cards = excluded.red_cards,
      updated_at = now();
  end loop;

  update public.matches set
    team_score = target_team_score,
    opponent_score = target_opponent_score,
    match_status = target_status,
    updated_at = now()
  where id = target_match_id;
end;
$$;
