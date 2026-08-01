import { supabase } from '../lib/supabase';
export const auditService = { async list() { if (!supabase) return []; const { data, error } = await supabase.from('audit_logs').select('id,action,entity_type,created_at,profiles(email)').order('created_at', { ascending: false }).limit(100); if (error) throw error; return data; } };
