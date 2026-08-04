import { supabase } from '../lib/supabase';

export type MatchSquadStatus = 'not_in_squad' | 'unused_substitute' | 'starter' | 'substitute';
export interface MatchPlayerStatInput { player_season_id: string; squad_status: MatchSquadStatus; started: boolean; minutes_played: number; goals: number; assists: number; yellow_cards: number; red_cards: number; }
export interface MatchPlayerStatDetail extends MatchPlayerStatInput { player_name: string; }

export const matchStatsService = {
  async list(matchId: string): Promise<MatchPlayerStatInput[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('match_player_stats').select('player_season_id,squad_status,started,minutes_played,goals,assists,yellow_cards,red_cards').eq('match_id', matchId);
    if (error) throw error;
    return data as MatchPlayerStatInput[];
  },
  async saveReport(matchId: string, teamScore: number | null, opponentScore: number | null, status: 'completed' | 'missing_data', rows: MatchPlayerStatInput[]) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.rpc('save_match_report', {
      target_match_id: matchId,
      target_team_score: teamScore,
      target_opponent_score: opponentScore,
      target_status: status,
      stat_rows: rows,
    });
    if (error) throw error;
  },
  async listDetails(matchId: string): Promise<MatchPlayerStatDetail[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('match_player_stats').select('player_season_id,squad_status,started,minutes_played,goals,assists,yellow_cards,red_cards,player_seasons(players(full_name))').eq('match_id', matchId);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const typed = row as unknown as MatchPlayerStatInput & { player_seasons: { players: { full_name: string } | { full_name: string }[] | null } | { players: { full_name: string } | { full_name: string }[] | null }[] | null };
      const season = Array.isArray(typed.player_seasons) ? typed.player_seasons[0] : typed.player_seasons;
      const player = Array.isArray(season?.players) ? season?.players[0] : season?.players;
      return { ...typed, player_name: player?.full_name ?? 'שחקן ללא שם' };
    });
  },
};
