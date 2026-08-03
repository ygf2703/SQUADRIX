-- Multi-team access model: club managers can access all teams in their club;
-- team staff can access only teams to which they are assigned.

create type public.club_management_role as enum ('owner', 'ceo', 'professional_director', 'club_admin');
create type public.team_membership_role as enum ('head_coach', 'assistant_coach', 'analyst', 'physio', 'viewer');

create table public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.club_management_role not null,
  created_at timestamptz not null default now(),
  unique (club_id, profile_id)
);

create table public.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.team_membership_role not null,
  created_at timestamptz not null default now(),
  unique (team_id, profile_id)
);

alter table public.club_memberships enable row level security;
alter table public.team_memberships enable row level security;

create or replace function public.is_club_manager(target_club_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.club_memberships membership
    where membership.club_id = target_club_id and membership.profile_id = auth.uid()
  );
$$;

create or replace function public.can_view_team(target_team_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.teams team
    where team.id = target_team_id and (
      public.is_club_manager(team.club_id)
      or exists (select 1 from public.team_memberships membership where membership.team_id = team.id and membership.profile_id = auth.uid())
    )
  );
$$;

create or replace function public.can_edit_team(target_team_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.teams team
    where team.id = target_team_id and (
      public.is_club_manager(team.club_id)
      or exists (
        select 1 from public.team_memberships membership
        where membership.team_id = team.id
          and membership.profile_id = auth.uid()
          and membership.role <> 'viewer'::public.team_membership_role
      )
    )
  );
$$;

create or replace function public.can_view_player(target_player_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.player_seasons season where season.player_id = target_player_id and public.can_view_team(season.team_id));
$$;

create or replace function public.can_edit_player(target_player_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.player_seasons season where season.player_id = target_player_id and public.can_edit_team(season.team_id));
$$;

create or replace function public.can_edit_any_team()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.club_memberships membership where membership.profile_id = auth.uid())
      or exists (select 1 from public.team_memberships membership where membership.profile_id = auth.uid() and membership.role <> 'viewer'::public.team_membership_role);
$$;

-- Keep the existing single-team installation usable: current admins become owners;
-- existing professional users become staff on the existing teams. Future access is explicit.
insert into public.club_memberships (club_id, profile_id, role)
select club.id, profile.id, 'owner'::public.club_management_role
from public.clubs club cross join public.profiles profile
where profile.role = 'admin' and profile.is_active
on conflict (club_id, profile_id) do nothing;

insert into public.team_memberships (team_id, profile_id, role)
select team.id, profile.id, 'head_coach'::public.team_membership_role
from public.teams team cross join public.profiles profile
where profile.role = 'professional_staff' and profile.is_active
on conflict (team_id, profile_id) do nothing;

create policy "club managers read club memberships" on public.club_memberships for select to authenticated using (profile_id = auth.uid() or public.is_club_manager(club_id));
create policy "club managers manage club memberships" on public.club_memberships for all to authenticated using (public.is_club_manager(club_id)) with check (public.is_club_manager(club_id));
create policy "team access read memberships" on public.team_memberships for select to authenticated using (profile_id = auth.uid() or public.can_view_team(team_id));
create policy "club managers manage team memberships" on public.team_memberships for all to authenticated using ((select public.is_club_manager(team.club_id) from public.teams team where team.id = team_id)) with check ((select public.is_club_manager(team.club_id) from public.teams team where team.id = team_id));

drop policy if exists "authenticated read" on public.teams;
drop policy if exists "staff writes team" on public.teams;
create policy "team members read teams" on public.teams for select to authenticated using (public.can_view_team(id));
create policy "club managers create teams" on public.teams for insert to authenticated with check (public.is_club_manager(club_id));
create policy "club managers update teams" on public.teams for update to authenticated using (public.is_club_manager(club_id)) with check (public.is_club_manager(club_id));
create policy "club managers delete teams" on public.teams for delete to authenticated using (public.is_club_manager(club_id));

drop policy if exists "staff writes club" on public.clubs;
create policy "club managers update club" on public.clubs for update to authenticated using (public.is_club_manager(id)) with check (public.is_club_manager(id));

drop policy if exists "authenticated read" on public.matches;
drop policy if exists "staff writes matches" on public.matches;
create policy "team members read matches" on public.matches for select to authenticated using (public.can_view_team(team_id));
create policy "team members write matches" on public.matches for all to authenticated using (public.can_edit_team(team_id)) with check (public.can_edit_team(team_id));

drop policy if exists "authenticated schedule read" on public.team_schedule_events;
drop policy if exists "staff schedule write" on public.team_schedule_events;
create policy "team members read schedule" on public.team_schedule_events for select to authenticated using (public.can_view_team(team_id));
create policy "team members write schedule" on public.team_schedule_events for all to authenticated using (public.can_edit_team(team_id)) with check (public.can_edit_team(team_id));

drop policy if exists "authenticated read" on public.player_seasons;
drop policy if exists "staff writes player seasons" on public.player_seasons;
create policy "team members read player seasons" on public.player_seasons for select to authenticated using (public.can_view_team(team_id));
create policy "team members write player seasons" on public.player_seasons for all to authenticated using (public.can_edit_team(team_id)) with check (public.can_edit_team(team_id));

drop policy if exists "authenticated read" on public.players;
drop policy if exists "staff writes players" on public.players;
create policy "team members read players" on public.players for select to authenticated using (public.can_view_player(id));
create policy "team members insert players" on public.players for insert to authenticated with check (public.can_edit_any_team());
create policy "team members update players" on public.players for update to authenticated using (public.can_edit_player(id)) with check (public.can_edit_player(id));
create policy "team members delete players" on public.players for delete to authenticated using (public.can_edit_player(id));

drop policy if exists "authenticated read" on public.match_player_stats;
drop policy if exists "staff writes stats" on public.match_player_stats;
create policy "team members read match stats" on public.match_player_stats for select to authenticated using ((select public.can_view_team(match.team_id) from public.matches match where match.id = match_id));
create policy "team members write match stats" on public.match_player_stats for all to authenticated using ((select public.can_edit_team(match.team_id) from public.matches match where match.id = match_id)) with check ((select public.can_edit_team(match.team_id) from public.matches match where match.id = match_id));

drop policy if exists "authenticated read" on public.goals;
drop policy if exists "staff writes goals" on public.goals;
create policy "team members read goals" on public.goals for select to authenticated using ((select public.can_view_team(match.team_id) from public.matches match where match.id = match_id));
create policy "team members write goals" on public.goals for all to authenticated using ((select public.can_edit_team(match.team_id) from public.matches match where match.id = match_id)) with check ((select public.can_edit_team(match.team_id) from public.matches match where match.id = match_id));

-- Safe management RPCs. They deliberately resolve users by email only after a
-- club manager supplies an address, so club staff cannot browse other clubs' users.
create or replace function public.list_club_access(target_club_id uuid)
returns table (profile_id uuid, email text, full_name text, club_role public.club_management_role, team_memberships jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_club_manager(target_club_id) then raise exception 'Not authorized'; end if;
  return query
  with people as (
    select membership.profile_id from public.club_memberships membership where membership.club_id = target_club_id
    union
    select membership.profile_id from public.team_memberships membership join public.teams team on team.id = membership.team_id where team.club_id = target_club_id
  )
  select profile.id, profile.email, profile.full_name, club_membership.role,
    coalesce(jsonb_agg(jsonb_build_object('team_id', team_membership.team_id, 'team_name', team.name, 'role', team_membership.role) order by team.name)
      filter (where team_membership.id is not null), '[]'::jsonb)
  from people person
  join public.profiles profile on profile.id = person.profile_id
  left join public.club_memberships club_membership on club_membership.club_id = target_club_id and club_membership.profile_id = profile.id
  left join public.team_memberships team_membership on team_membership.profile_id = profile.id and team_membership.team_id in (select id from public.teams where club_id = target_club_id)
  left join public.teams team on team.id = team_membership.team_id and team.club_id = target_club_id
  group by profile.id, profile.email, profile.full_name, club_membership.role
  order by profile.full_name nulls last, profile.email;
end;
$$;

create or replace function public.set_club_member_by_email(target_club_id uuid, target_email text, target_role public.club_management_role)
returns void language plpgsql security definer set search_path = public as $$
declare target_profile_id uuid;
begin
  if not public.is_club_manager(target_club_id) then raise exception 'Not authorized'; end if;
  select id into target_profile_id from public.profiles where lower(email) = lower(target_email) and is_active limit 1;
  if target_profile_id is null then raise exception 'No active registered user was found for this email'; end if;
  insert into public.club_memberships (club_id, profile_id, role) values (target_club_id, target_profile_id, target_role)
  on conflict (club_id, profile_id) do update set role = excluded.role;
end;
$$;

create or replace function public.set_team_member_by_email(target_team_id uuid, target_email text, target_role public.team_membership_role)
returns void language plpgsql security definer set search_path = public as $$
declare target_profile_id uuid;
begin
  if not exists (select 1 from public.teams team where team.id = target_team_id and public.is_club_manager(team.club_id)) then raise exception 'Not authorized'; end if;
  select id into target_profile_id from public.profiles where lower(email) = lower(target_email) and is_active limit 1;
  if target_profile_id is null then raise exception 'No active registered user was found for this email'; end if;
  insert into public.team_memberships (team_id, profile_id, role) values (target_team_id, target_profile_id, target_role)
  on conflict (team_id, profile_id) do update set role = excluded.role;
end;
$$;

create or replace function public.remove_club_member(target_club_id uuid, target_profile_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_club_manager(target_club_id) or target_profile_id = auth.uid() then raise exception 'Not authorized'; end if;
  delete from public.club_memberships where club_id = target_club_id and profile_id = target_profile_id;
end;
$$;

create or replace function public.remove_team_member(target_team_id uuid, target_profile_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.teams team where team.id = target_team_id and public.is_club_manager(team.club_id)) then raise exception 'Not authorized'; end if;
  delete from public.team_memberships where team_id = target_team_id and profile_id = target_profile_id;
end;
$$;

create or replace function public.create_club_team(target_club_id uuid, team_name text, team_age_group text, team_league_name text, team_district text, team_season_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_team_id uuid;
begin
  if not public.is_club_manager(target_club_id) then raise exception 'Not authorized'; end if;
  insert into public.teams (club_id, name, age_group, league_name, district, current_season_id)
  values (target_club_id, trim(team_name), trim(team_age_group), trim(team_league_name), trim(team_district), team_season_id)
  returning id into new_team_id;
  return new_team_id;
end;
$$;
