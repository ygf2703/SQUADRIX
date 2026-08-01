import { supabase } from '../lib/supabase'; import type { ScheduleEvent, ScheduleEventType } from '../types/domain';
export interface ScheduleEventInput { event_type: ScheduleEventType; title: string; starts_at: string; ends_at?: string; venue?: string; description?: string }
export const scheduleService = {
  async list(): Promise<ScheduleEvent[]> { if (!supabase) return []; const { data, error } = await supabase.from('team_schedule_events').select('id,event_type,title,starts_at,ends_at,venue,description,status').order('starts_at'); if (error) throw error; return data as ScheduleEvent[]; },
  async create(input: ScheduleEventInput) { if (!supabase) throw new Error('Supabase אינו מוגדר'); const { data: team, error: teamError } = await supabase.from('teams').select('id,current_season_id').not('current_season_id', 'is', null).limit(1).single(); if (teamError || !team.current_season_id) throw new Error('לא נמצאה קבוצה ועונה פעילות.'); const { error } = await supabase.from('team_schedule_events').insert({ ...input, team_id: team.id, season_id: team.current_season_id, ends_at: input.ends_at || null }); if (error) throw error; },
  async remove(id: string) { if (!supabase) throw new Error('Supabase אינו מוגדר'); const { error } = await supabase.from('team_schedule_events').delete().eq('id', id); if (error) throw error; }
};
