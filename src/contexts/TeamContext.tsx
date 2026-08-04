import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { teamSelection, type ActiveTeam } from '../services/teamSelection';
import { useCurrentAuth } from './AuthContext';

type ClubMembership = { club_id: string };
type TeamMembership = { team_id: string; role: 'head_coach' | 'assistant_coach' | 'analyst' | 'physio' | 'viewer' };
type TeamContextValue = { teams: ActiveTeam[]; activeTeam: ActiveTeam | null; selectTeam: (id: string) => void; loading: boolean; canManageClub: boolean; canEditActiveTeam: boolean };
const TeamContext = createContext<TeamContextValue>({ teams: [], activeTeam: null, selectTeam: () => undefined, loading: true, canManageClub: false, canEditActiveTeam: false });

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useCurrentAuth();
  const [teams, setTeams] = useState<ActiveTeam[]>([]);
  const [activeTeam, setActiveTeam] = useState<ActiveTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [canManageClub, setCanManageClub] = useState(false);
  const [canEditActiveTeam, setCanEditActiveTeam] = useState(false);

  useEffect(() => {
    if (!supabase || !profile) { setTeams([]); setActiveTeam(null); setCanManageClub(false); setCanEditActiveTeam(false); setLoading(false); return; }
    setLoading(true);
    void Promise.all([
      supabase.from('teams').select('id,club_id,name,age_group,league_name,current_season_id').order('name'),
      supabase.from('club_memberships').select('club_id').eq('profile_id', profile.id),
      supabase.from('team_memberships').select('team_id,role').eq('profile_id', profile.id),
    ]).then(([teamsResult, clubMembershipsResult, teamMembershipsResult]) => {
      const { data, error } = teamsResult;
      if (error) { setLoading(false); return; }
      const available = (data ?? []) as ActiveTeam[];
      const storedId = window.localStorage.getItem('squadrix.active-team-id');
      const initial = available.find((team) => team.id === storedId) ?? available[0] ?? null;
      setTeams(available); setActiveTeam(initial); teamSelection.setId(initial?.id ?? null);
      const clubMemberships = (clubMembershipsResult.data ?? []) as ClubMembership[];
      const teamMemberships = (teamMembershipsResult.data ?? []) as TeamMembership[];
      const isClubManager = (team: ActiveTeam | null) => profile.role === 'admin' || Boolean(team && clubMemberships.some((membership) => membership.club_id === team.club_id));
      const canEdit = (team: ActiveTeam | null) => profile.role === 'admin' || isClubManager(team) || Boolean(teamMemberships.find((membership) => membership.team_id === team?.id && membership.role !== 'viewer'));
      setCanManageClub(isClubManager(initial));
      setCanEditActiveTeam(canEdit(initial));
      setLoading(false);
    });
  }, [profile]);

  const selectTeam = (id: string) => {
    const next = teams.find((team) => team.id === id) ?? null;
    if (!next) return;
    setActiveTeam(next); teamSelection.setId(next.id); window.localStorage.setItem('squadrix.active-team-id', next.id);
    if (!supabase || !profile) return;
    void Promise.all([
      supabase.from('club_memberships').select('club_id').eq('profile_id', profile.id).eq('club_id', next.club_id).limit(1),
      supabase.from('team_memberships').select('role').eq('profile_id', profile.id).eq('team_id', next.id).limit(1),
    ]).then(([clubResult, teamResult]) => {
      const managesClub = profile.role === 'admin' || Boolean(clubResult.data?.length);
      const teamRole = (teamResult.data?.[0] as Pick<TeamMembership, 'role'> | undefined)?.role;
      setCanManageClub(managesClub);
      setCanEditActiveTeam(profile.role === 'admin' || managesClub || (teamRole !== undefined && teamRole !== 'viewer'));
    });
  };

  return <TeamContext.Provider value={{ teams, activeTeam, selectTeam, loading, canManageClub, canEditActiveTeam }}>{children}</TeamContext.Provider>;
}

export const useTeam = () => useContext(TeamContext);
