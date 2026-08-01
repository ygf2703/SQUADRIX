import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
const adminEmail = 'noamfrostig@gmail.com';
interface InviteBody { email?: string; role?: 'professional_staff' | 'viewer' }
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const url = process.env.VITE_SUPABASE_URL; const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; const siteUrl = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  if (!url || !serviceKey || !siteUrl) return { statusCode: 500, body: 'Missing server configuration' };
  const token = event.headers.authorization?.replace('Bearer ', ''); if (!token) return { statusCode: 401, body: 'Unauthorized' };
  const client = createClient(url, serviceKey); const { data: { user }, error: authError } = await client.auth.getUser(token);
  if (authError || user?.email?.toLowerCase() !== adminEmail) return { statusCode: 403, body: 'Forbidden' };
  const body = JSON.parse(event.body ?? '{}') as InviteBody;
  if (!body.email || !['professional_staff', 'viewer'].includes(body.role ?? '')) return { statusCode: 400, body: 'Invalid invitation' };
  const { data, error } = await client.auth.admin.inviteUserByEmail(body.email.toLowerCase(), { redirectTo: siteUrl });
  if (error) return { statusCode: 400, body: error.message };
  if (data.user) { const { error: roleError } = await client.from('profiles').update({ role: body.role }).eq('id', data.user.id); if (roleError) return { statusCode: 500, body: roleError.message }; }
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
