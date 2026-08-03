import { supabase } from '../lib/supabase';
import type { Player, PlayerStatus } from '../types/domain';

export interface CreatePlayerInput { full_name: string; shirt_number?: number; primary_position: string; secondary_position?: string; squad_status: PlayerStatus; expected_absence_until?: string; birth_date?: string; dominant_foot?: 'right' | 'left' | 'both'; previous_club?: string; professional_notes?: string }

export const playersService = {
  async list(): Promise<Player[]> { if (!supabase) return []; const { data, error } = await supabase.from('players').select('*,player_seasons(*,player_season_statistics(*))').order('full_name'); if (error) throw error; return data as Player[]; },
  async create(input: CreatePlayerInput) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { data: team, error: teamError } = await supabase.from('teams').select('id,current_season_id').not('current_season_id', 'is', null).limit(1).single();
    if (teamError || !team.current_season_id) throw new Error('No active team and season were found.');
    const { data: player, error: playerError } = await supabase.from('players').insert({ full_name: input.full_name, birth_date: input.birth_date || null, dominant_foot: input.dominant_foot || null }).select('id').single();
    if (playerError) throw playerError;
    const { error: seasonError } = await supabase.from('player_seasons').insert({ player_id: player.id, team_id: team.id, season_id: team.current_season_id, shirt_number: input.shirt_number ?? null, primary_position: input.primary_position, secondary_position: input.secondary_position || null, squad_status: input.squad_status, expected_absence_until: input.expected_absence_until || null, previous_club: input.previous_club || null, professional_notes: input.professional_notes || null });
    if (seasonError) throw seasonError;
  },
  async update(player: Player, input: CreatePlayerInput) {
    if (!supabase) throw new Error('Supabase is not configured');
    const season = player.player_seasons[0];
    if (!season) throw new Error('The player is not assigned to the active season.');
    const { error: playerError } = await supabase.from('players').update({ full_name: input.full_name, birth_date: input.birth_date || null, dominant_foot: input.dominant_foot || null }).eq('id', player.id);
    if (playerError) throw playerError;
    const { error: seasonError } = await supabase.from('player_seasons').update({ shirt_number: input.shirt_number ?? null, primary_position: input.primary_position, secondary_position: input.secondary_position || null, squad_status: input.squad_status, expected_absence_until: input.expected_absence_until || null, previous_club: input.previous_club || null, professional_notes: input.professional_notes || null }).eq('id', season.id);
    if (seasonError) throw seasonError;
  },
  async importCsv(rows: Record<string,string>[]) { if (!supabase) throw new Error('Supabase is not configured'); const { data, error } = await supabase.rpc('import_players_csv', { rows }); if (error) throw error; return data as number; },
  async remove(id: string) { if (!supabase) throw new Error('Supabase is not configured'); const { error } = await supabase.from('players').delete().eq('id', id); if (error) throw error; }
};
