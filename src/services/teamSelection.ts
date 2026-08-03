import { supabase } from '../lib/supabase';

let activeTeamId: string | null = null;

export interface ActiveTeam { id: string; club_id: string; name: string; age_group: string; league_name: string; current_season_id: string | null }

export const teamSelection = {
  getId: () => activeTeamId,
  setId: (id: string | null) => { activeTeamId = id; },
  async getCurrent(): Promise<ActiveTeam> {
    if (!supabase) throw new Error('Supabase is not configured');
    let query = supabase.from('teams').select('id,club_id,name,age_group,league_name,current_season_id');
    if (activeTeamId) query = query.eq('id', activeTeamId);
    const { data, error } = await query.limit(1).single();
    if (error || !data) throw new Error('לא נמצאה קבוצה פעילה.');
    return data as ActiveTeam;
  },
};
