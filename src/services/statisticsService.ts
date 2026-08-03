import { supabase } from '../lib/supabase';
import type { PlayerTotals, PlayerSeasonStatistics } from '../types/domain';

export interface PlayerPerformance { playerSeasonId: string; fullName: string; squadStatus: string; expectedAbsenceUntil: string | null; appearances: number; starts: number; substituteAppearances: number; substituted: number; unusedSubstitutes: number; minutes: number; goals: number; assists: number; yellowCards: number; redCards: number }
type StatsRow = { minutes_played: number; goals: number; assists: number; yellow_cards: number; red_cards: number; started: boolean; entered_minute: number | null; exited_minute: number | null; squad_status: 'not_in_squad' | 'unused_substitute' | 'starter' | 'substitute' };
type SeasonRow = { id: string; squad_status: string; expected_absence_until: string | null; players: { full_name: string } | null; match_player_stats: StatsRow[] | null; player_season_statistics: PlayerSeasonStatistics | null };

export const statisticsService = {
  async playerTotals(): Promise<PlayerTotals[]> { const players = await statisticsService.playerPerformance(); return players.map((player) => ({ player_season_id: player.playerSeasonId, full_name: player.fullName, appearances: player.appearances, starts: player.starts, minutes: player.minutes, goals: player.goals, assists: player.assists })).sort((a, b) => b.minutes - a.minutes); },
  async playerPerformance(): Promise<PlayerPerformance[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('player_seasons').select('id,squad_status,expected_absence_until,players(full_name),match_player_stats(minutes_played,goals,assists,yellow_cards,red_cards,started,entered_minute,exited_minute,squad_status),player_season_statistics(appearances,starts,substitute_appearances,substituted,minutes_played,goals,assists,yellow_cards,red_cards)').order('id');
    if (error) throw error;
    return (data as unknown as SeasonRow[]).map((season) => {
      const stats = season.match_player_stats ?? []; const imported = season.player_season_statistics;
      if (!stats.length && imported) return { playerSeasonId: season.id, fullName: season.players?.full_name ?? 'שחקן ללא שם', squadStatus: season.squad_status, expectedAbsenceUntil: season.expected_absence_until, appearances: imported.appearances, starts: imported.starts, substituteAppearances: imported.substitute_appearances, substituted: imported.substituted, unusedSubstitutes: Math.max(0, imported.appearances - imported.starts - imported.substitute_appearances), minutes: imported.minutes_played, goals: imported.goals, assists: imported.assists, yellowCards: imported.yellow_cards, redCards: imported.red_cards };
      const appearances = stats.filter((item) => item.started || item.minutes_played > 0).length;
      return { playerSeasonId: season.id, fullName: season.players?.full_name ?? 'שחקן ללא שם', squadStatus: season.squad_status, expectedAbsenceUntil: season.expected_absence_until, appearances, starts: stats.filter((item) => item.started).length, substituteAppearances: stats.filter((item) => item.squad_status === 'substitute' && item.minutes_played > 0).length, substituted: stats.filter((item) => item.exited_minute !== null).length, unusedSubstitutes: stats.filter((item) => item.squad_status === 'unused_substitute').length, minutes: stats.reduce((sum, item) => sum + item.minutes_played, 0), goals: stats.reduce((sum, item) => sum + item.goals, 0), assists: stats.reduce((sum, item) => sum + item.assists, 0), yellowCards: stats.reduce((sum, item) => sum + item.yellow_cards, 0), redCards: stats.reduce((sum, item) => sum + item.red_cards, 0) };
    }).sort((a, b) => a.fullName.localeCompare(b.fullName, 'he'));
  },
};
