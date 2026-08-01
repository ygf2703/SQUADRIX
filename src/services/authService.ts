import type { Profile } from '../types/domain'; import { supabase } from '../lib/supabase';
export const authService = {
  async sendMagicLink(email: string, allowSignup = false) { if (!supabase) throw new Error('Supabase אינו מוגדר'); const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin, shouldCreateUser: allowSignup } }); if (error) throw error; },
  async signOut() { if (supabase) await supabase.auth.signOut(); },
  async profile(userId: string): Promise<Profile | null> { if (!supabase) return null; const { data, error } = await supabase.from('profiles').select('id,email,full_name,role,is_active').eq('id', userId).maybeSingle(); if (error) throw error; return data; }
};
