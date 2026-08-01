import { supabase } from '../lib/supabase'; import type { PlayerTotals } from '../types/domain';
export const statisticsService = { async playerTotals(): Promise<PlayerTotals[]> { if (!supabase) return []; const { data, error } = await supabase.from('player_statistics').select('*').order('minutes', { ascending: false }); if (error) throw error; return data as PlayerTotals[]; } };
