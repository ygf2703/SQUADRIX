import { supabase } from '../lib/supabase';

export type MatchSquadStatus = 'not_in_squad' | 'unused_substitute' | 'starter' | 'substitute';
export interface MatchPlayerStatInput { player_season_id: string; squad_status: MatchSquadStatus; started: boolean; minutes_played: number; goals: number; assists: number; yellow_cards: number; red_cards: number; }

export const matchStatsService = {
  async list(matchId: string): Promise<MatchPlayerStatInput[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('match_player_stats').select('player_season_id,squad_status,started,minutes_played,goals,assists,yellow_cards,red_cards').eq('match_id', matchId);
    if (error) throw error;
    return data as MatchPlayerStatInput[];
  },
  async save(matchId: string, rows: MatchPlayerStatInput[]) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('match_player_stats').upsert(rows.map((row) => ({ ...row, match_id: matchId })), { onConflict: 'match_id,player_season_id' });
    if (error) throw error;
  },
};
