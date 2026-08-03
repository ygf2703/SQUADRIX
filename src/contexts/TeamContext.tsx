import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { teamSelection, type ActiveTeam } from '../services/teamSelection';
import { useCurrentAuth } from './AuthContext';

type TeamContextValue = { teams: ActiveTeam[]; activeTeam: ActiveTeam | null; selectTeam: (id: string) => void; loading: boolean; canManageClub: boolean };
const TeamContext = createContext<TeamContextValue>({ teams: [], activeTeam: null, selectTeam: () => undefined, loading: true, canManageClub: false });

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useCurrentAuth();
  const [teams, setTeams] = useState<ActiveTeam[]>([]);
  const [activeTeam, setActiveTeam] = useState<ActiveTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [canManageClub, setCanManageClub] = useState(false);

  useEffect(() => {
    if (!supabase || !profile) { setTeams([]); setActiveTeam(null); setCanManageClub(false); setLoading(false); return; }
    setLoading(true);
    void Promise.all([
      supabase.from('teams').select('id,club_id,name,age_group,league_name,current_season_id').order('name'),
      supabase.from('club_memberships').select('id').eq('profile_id', profile.id).limit(1),
    ]).then(([teamsResult, membershipsResult]) => {
      const { data, error } = teamsResult;
      if (error) { setLoading(false); return; }
      const available = (data ?? []) as ActiveTeam[];
      const storedId = window.localStorage.getItem('squadrix.active-team-id');
      const initial = available.find((team) => team.id === storedId) ?? available[0] ?? null;
      setTeams(available); setActiveTeam(initial); teamSelection.setId(initial?.id ?? null);
      setCanManageClub(profile.role === 'admin' || (!membershipsResult.error && Boolean(membershipsResult.data?.length)));
      setLoading(false);
    });
  }, [profile]);

  const selectTeam = (id: string) => {
    const next = teams.find((team) => team.id === id) ?? null;
    if (!next) return;
    setActiveTeam(next); teamSelection.setId(next.id); window.localStorage.setItem('squadrix.active-team-id', next.id);
  };

  return <TeamContext.Provider value={{ teams, activeTeam, selectTeam, loading, canManageClub }}>{children}</TeamContext.Provider>;
}

export const useTeam = () => useContext(TeamContext);
