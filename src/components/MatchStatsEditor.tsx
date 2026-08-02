import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { LoadingSkeleton, PrimaryButton } from './ui';
import { useCurrentAuth } from '../contexts/AuthContext';
import { playersService } from '../services/playersService';
import { matchStatsService, type MatchPlayerStatInput, type MatchSquadStatus } from '../services/matchStatsService';

const statusLabels: Record<MatchSquadStatus, string> = { not_in_squad: 'לא בסגל', unused_substitute: 'ספסל', starter: 'הרכב', substitute: 'מחליף' };
const emptyStat = (playerSeasonId: string): MatchPlayerStatInput => ({ player_season_id: playerSeasonId, squad_status: 'not_in_squad', started: false, minutes_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 });

export function MatchStatsEditor({ matchId }: { matchId: string }) {
  const { profile } = useCurrentAuth();
  const [rows, setRows] = useState<MatchPlayerStatInput[] | null>(null);
  const [players, setPlayers] = useState<{ name: string; seasonId: string; number: number | null; position: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const editable = profile?.role === 'admin' || profile?.role === 'professional_staff';

  useEffect(() => { void Promise.all([playersService.list(), matchStatsService.list(matchId)]).then(([items, stats]) => { const squad = items.flatMap((player) => player.player_seasons.map((season) => ({ name: player.full_name, seasonId: season.id, number: season.shirt_number, position: season.primary_position }))); setPlayers(squad); const bySeason = new Map(stats.map((stat) => [stat.player_season_id, stat])); setRows(squad.map((player) => bySeason.get(player.seasonId) ?? emptyStat(player.seasonId))); }).catch(() => setRows([])); }, [matchId]);
  const values = useMemo(() => new Map((rows ?? []).map((row) => [row.player_season_id, row])), [rows]);
  const update = (id: string, patch: Partial<MatchPlayerStatInput>) => setRows((items) => (items ?? []).map((item) => item.player_season_id === id ? { ...item, ...patch } : item));
  const changeStatus = (id: string, squad_status: MatchSquadStatus) => update(id, { squad_status, started: squad_status === 'starter' });
  const numberChange = (id: string, key: keyof Pick<MatchPlayerStatInput, 'minutes_played' | 'goals' | 'assists' | 'yellow_cards' | 'red_cards'>, value: string) => update(id, { [key]: Math.max(0, Number(value) || 0) });
  const save = async () => { if (!rows) return; setSaving(true); setMessage(''); try { await matchStatsService.save(matchId, rows); setMessage('נתוני המשחק נשמרו והסטטיסטיקות עודכנו.'); } catch { setMessage('לא ניתן לשמור את נתוני המשחק.'); } finally { setSaving(false); } };
  if (rows === null) return <LoadingSkeleton lines={8}/>;
  return <section className="match-stats-editor"><div className="match-stats-heading"><div><h2>סגל וסטטיסטיקות משחק</h2><p>בחרו לכל שחקן סטטוס, דקות ואירועי משחק. הנתונים יופיעו בדשבורד הסטטיסטיקות.</p></div>{editable && <PrimaryButton onClick={() => void save()} disabled={saving}><Save size={17}/>{saving ? 'שומר…' : 'שמירת נתוני משחק'}</PrimaryButton>}</div><div className="table-wrap"><table><thead><tr><th>שחקן</th><th>סטטוס</th><th>דקות</th><th>שערים</th><th>בישולים</th><th>צהובים</th><th>אדומים</th></tr></thead><tbody>{players.map((player) => { const row = values.get(player.seasonId) ?? emptyStat(player.seasonId); return <tr key={player.seasonId}><td><b>{player.number ? `${player.number}. ` : ''}{player.name}</b><small>{player.position}</small></td><td><select value={row.squad_status} disabled={!editable} onChange={(event) => changeStatus(player.seasonId, event.target.value as MatchSquadStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>{(['minutes_played', 'goals', 'assists', 'yellow_cards', 'red_cards'] as const).map((key) => <td key={key}><input aria-label={`${key} עבור ${player.name}`} type="number" min="0" max={key === 'yellow_cards' ? 2 : key === 'red_cards' ? 1 : 180} value={row[key]} disabled={!editable || row.squad_status === 'not_in_squad'} onChange={(event) => numberChange(player.seasonId, key, event.target.value)} /></td>)}</tr>; })}</tbody></table></div>{message && <p className={message.includes('נשמרו') ? 'success-message' : 'form-error'}>{message}</p>}</section>;
}
