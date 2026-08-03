import { supabase } from '../lib/supabase';

export interface LineupAssignment { player_season_id: string; formation_slot: string; formation: string }

export const lineupsService = {
  async list(matchId: string): Promise<LineupAssignment[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('match_lineups').select('player_season_id,formation_slot,formation').eq('match_id', matchId);
    if (error) throw error;
    return data as LineupAssignment[];
  },
  async save(matchId: string, assignments: LineupAssignment[]) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error: removeError } = await supabase.from('match_lineups').delete().eq('match_id', matchId);
    if (removeError) throw removeError;
    if (!assignments.length) return;
    const { error } = await supabase.from('match_lineups').insert(assignments.map((assignment) => ({ ...assignment, match_id: matchId })));
    if (error) throw error;
  },
};
