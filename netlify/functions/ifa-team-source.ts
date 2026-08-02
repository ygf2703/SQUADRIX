import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

interface SourceBody { url?: string }
function json(statusCode: number, body: unknown) { return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }; }

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const token = event.headers.authorization?.replace('Bearer ', ''); const supabaseUrl = process.env.VITE_SUPABASE_URL; const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !anonKey) return json(401, { error: 'Unauthorized' });
  const client = createClient(supabaseUrl, anonKey); const { data: { user } } = await client.auth.getUser(token); if (!user) return json(401, { error: 'Unauthorized' });
  const body = JSON.parse(event.body ?? '{}') as SourceBody;
  try {
    const source = new URL(body.url ?? '');
    if (source.protocol !== 'https:' || source.hostname !== 'www.football.org.il' || source.pathname !== '/team-details/') return json(400, { error: 'יש להזין קישור תקין לעמוד קבוצה באתר ההתאחדות.' });
    const teamId = Number(source.searchParams.get('team_id')); const seasonId = Number(source.searchParams.get('season_id'));
    if (!Number.isInteger(teamId) || !Number.isInteger(seasonId)) return json(400, { error: 'הקישור חייב לכלול team_id ו-season_id.' });
    const response = await fetch(source.toString(), { headers: { 'user-agent': 'SQUADRIX Football Team Operations', accept: 'text/html,application/xhtml+xml' }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) return json(424, { status: 'blocked', teamId, seasonId, error: `אתר ההתאחדות החזיר ${response.status}. המקור נשמר, אך נדרש אישור או API רשמי לסנכרון אוטומטי.` });
    const html = await response.text(); const title = html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
    return json(200, { status: 'available', teamId, seasonId, title, foundPlayers: /סגל שחקנים/.test(html), foundMatches: /משחקים של העונה|המשחקים האחרונים/.test(html) });
  } catch { return json(400, { error: 'לא ניתן לקרוא את הקישור. בדקו שהודבק עמוד קבוצה תקין.' }); }
};
