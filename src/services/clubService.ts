import { supabase } from '../lib/supabase';

export interface ClubBrand { id: string; name: string; short_name: string; logo_url: string | null; primary_color: string; secondary_color: string }
export const defaultBrand: ClubBrand = { id: 'default', name: 'מכבי כפר סבא', short_name: 'מכבי כפ״ס', logo_url: '/maccabi-kfar-saba-logo-transparent.png', primary_color: '#101064', secondary_color: '#FFFFFF' };
export const clubService = {
  async getBrand(): Promise<ClubBrand> { if (!supabase) return defaultBrand; const { data, error } = await supabase.from('clubs').select('id,name,short_name,logo_url,primary_color,secondary_color').limit(1).maybeSingle(); if (error || !data) return defaultBrand; return data as ClubBrand; },
  async updateBrand(id: string, input: Pick<ClubBrand, 'name' | 'short_name' | 'logo_url' | 'primary_color' | 'secondary_color'>) { if (!supabase) throw new Error('Supabase is not configured'); const { error } = await supabase.from('clubs').update(input).eq('id', id); if (error) throw error; },
  async uploadLogo(clubId: string, file: File) { if (!supabase) throw new Error('Supabase is not configured'); const extension = file.name.split('.').pop()?.toLowerCase() || 'png'; const path = `${clubId}/logo-${Date.now()}.${extension}`; const { error } = await supabase.storage.from('club-logos').upload(path, file, { upsert: false, contentType: file.type }); if (error) throw error; return supabase.storage.from('club-logos').getPublicUrl(path).data.publicUrl; }
};
