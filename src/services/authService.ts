import type { Profile } from '../types/domain';
import { supabase } from '../lib/supabase';
export const authService = {
  async signIn(email: string, password: string) { if (!supabase) throw new Error('Supabase is not configured'); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; },
  async signUp(email: string, password: string) { if (!supabase) throw new Error('Supabase is not configured'); const { data, error } = await supabase.auth.signUp({ email, password }); if (error) throw error; return data; },
  async requestPasswordReset(email: string) { if (!supabase) throw new Error('Supabase is not configured'); const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login?reset_password=1` }); if (error) throw error; },
  async updatePassword(password: string) { if (!supabase) throw new Error('Supabase is not configured'); const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; },
  async signOut() { if (supabase) await supabase.auth.signOut(); },
  async profile(userId: string): Promise<Profile | null> { if (!supabase) return null; const { data, error } = await supabase.from('profiles').select('id,email,full_name,role,is_active').eq('id', userId).maybeSingle(); if (error) throw error; return data; }
};
