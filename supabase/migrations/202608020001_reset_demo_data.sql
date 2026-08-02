-- Reset a demo workspace to a neutral, empty SQUADRIX club.
-- Run once in the Supabase SQL Editor. This intentionally removes operational data,
-- but preserves registered users and their roles.
begin;

delete from public.audit_logs;
delete from public.goals;
delete from public.match_player_stats;
delete from public.matches;
delete from public.team_schedule_events;
delete from public.player_seasons;
delete from public.players;
delete from public.teams;
delete from public.seasons;
-- Storage objects are intentionally not deleted here: Supabase prevents direct
-- deletion from storage.objects. Clearing logo_url detaches existing assets;
-- they can be removed later from Storage → club-logos if required.

update public.clubs
set name = 'מועדון חדש',
    short_name = 'מועדון',
    logo_url = null,
    primary_color = '#0A2341',
    secondary_color = '#FFFFFF',
    official_team_page_url = null,
    official_team_id = null,
    official_season_id = null,
    official_source_checked_at = null,
    official_source_status = null
where id = (select id from public.clubs order by created_at limit 1);

insert into public.seasons (name, status)
values ('עונה חדשה', 'preparation');

insert into public.teams (club_id, name, age_group, league_name, district, current_season_id)
select c.id, 'קבוצה חדשה', 'טרם הוגדר', 'טרם הוגדר', 'טרם הוגדר', s.id
from public.clubs c
cross join public.seasons s
where c.id = (select id from public.clubs order by created_at limit 1)
  and s.name = 'עונה חדשה';

commit;
