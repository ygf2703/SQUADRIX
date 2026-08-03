import { supabase } from '../lib/supabase';

export type ClubRole = 'owner' | 'ceo' | 'professional_director' | 'club_admin';
export type TeamRole = 'head_coach' | 'assistant_coach' | 'analyst' | 'physio' | 'viewer';
export interface ClubAccessMember {
  profile_id: string;
  email: string;
  full_name: string | null;
  club_role: ClubRole | null;
  team_memberships: Array<{ team_id: string; team_name: string; role: TeamRole }>;
}
export interface NewTeamInput { name: string; age_group: string; league_name: string; district: string; season_id: string | null }

function requireClient() { if (!supabase) throw new Error('Supabase אינו מוגדר.'); return supabase; }

export const clubManagementService = {
  async listAccess(clubId: string): Promise<ClubAccessMember[]> {
    const { data, error } = await requireClient().rpc('list_club_access', { target_club_id: clubId });
    if (error) throw error;
    return (data ?? []) as ClubAccessMember[];
  },
  async addClubMember(clubId: string, email: string, role: ClubRole) {
    const { error } = await requireClient().rpc('set_club_member_by_email', { target_club_id: clubId, target_email: email.trim().toLowerCase(), target_role: role });
    if (error) throw error;
  },
  async addTeamMember(teamId: string, email: string, role: TeamRole) {
    const { error } = await requireClient().rpc('set_team_member_by_email', { target_team_id: teamId, target_email: email.trim().toLowerCase(), target_role: role });
    if (error) throw error;
  },
  async removeClubMember(clubId: string, profileId: string) {
    const { error } = await requireClient().rpc('remove_club_member', { target_club_id: clubId, target_profile_id: profileId });
    if (error) throw error;
  },
  async removeTeamMember(teamId: string, profileId: string) {
    const { error } = await requireClient().rpc('remove_team_member', { target_team_id: teamId, target_profile_id: profileId });
    if (error) throw error;
  },
  async createTeam(clubId: string, input: NewTeamInput) {
    const { error } = await requireClient().rpc('create_club_team', { target_club_id: clubId, team_name: input.name, team_age_group: input.age_group, team_league_name: input.league_name, team_district: input.district, team_season_id: input.season_id });
    if (error) throw error;
  },
};
