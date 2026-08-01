create or replace function public.log_audit_change() returns trigger language plpgsql security definer set search_path = public as $$
declare
  action_name text;
  entity uuid;
begin
  action_name := case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' when 'DELETE' then 'deleted' end;
  entity := case when tg_op = 'DELETE' then old.id else new.id end;
  insert into public.audit_logs(user_id, action, entity_type, entity_id, previous_data, new_data)
  values (auth.uid(), action_name, tg_table_name, entity,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end);
  return case when tg_op = 'DELETE' then old else new end;
end $$;

create trigger audit_players after insert or update or delete on public.players for each row execute function public.log_audit_change();
create trigger audit_player_seasons after insert or update or delete on public.player_seasons for each row execute function public.log_audit_change();
create trigger audit_matches after insert or update or delete on public.matches for each row execute function public.log_audit_change();
create trigger audit_match_player_stats after insert or update or delete on public.match_player_stats for each row execute function public.log_audit_change();
create trigger audit_team_schedule_events after insert or update or delete on public.team_schedule_events for each row execute function public.log_audit_change();
create trigger audit_profiles after update on public.profiles for each row execute function public.log_audit_change();
