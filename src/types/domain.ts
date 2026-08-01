export type Role = 'admin' | 'professional_staff' | 'viewer';
export type PlayerStatus = 'active' | 'injured' | 'overload' | 'suspended' | 'inactive';
export type MatchStatus = 'draft' | 'scheduled' | 'postponed' | 'cancelled' | 'completed' | 'missing_data';
export interface Profile { id: string; email: string; full_name: string | null; role: Role; is_active: boolean }
export interface Player { id: string; full_name: string; birth_date: string | null; photo_url: string | null; player_seasons: PlayerSeason[] }
export interface PlayerSeason { id: string; shirt_number: number | null; primary_position: string; secondary_position: string | null; squad_status: PlayerStatus; expected_absence_until?: string | null; is_active: boolean }
export interface Match { id: string; opponent_name: string; competition_name: string; match_date: string | null; home_or_away: 'home' | 'away'; team_score: number | null; opponent_score: number | null; match_status: MatchStatus }
export interface PlayerTotals { player_season_id: string; full_name: string; appearances: number; starts: number; minutes: number; goals: number; assists: number }
export type ScheduleEventType = 'training' | 'training_camp' | 'friendly_match';
export type ScheduleEventStatus = 'planned' | 'confirmed' | 'cancelled';
export interface ScheduleEvent { id: string; event_type: ScheduleEventType; title: string; starts_at: string; ends_at: string | null; venue: string | null; description: string | null; status: ScheduleEventStatus }
