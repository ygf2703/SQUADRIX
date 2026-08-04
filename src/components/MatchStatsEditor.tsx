import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { EmptyState, LoadingSkeleton, PrimaryButton } from './ui';
import { Link } from 'react-router-dom';
import { playersService } from '../services/playersService';
import { matchStatsService, type MatchPlayerStatInput, type MatchSquadStatus } from '../services/matchStatsService';
import { useTeam } from '../contexts/TeamContext';

const statusLabels: Record<MatchSquadStatus, string> = { not_in_squad: 'לא בסגל', unused_substitute: 'ספסל', starter: 'הרכב', substitute: 'מחליף' };
const emptyStat = (playerSeasonId: string): MatchPlayerStatInput => ({ player_season_id: playerSeasonId, squad_status: 'not_in_squad', started: false, minutes_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 });

export function MatchStatsEditor({ matchId, teamScore, opponentScore, matchStatus, onSaved }: { matchId: string; teamScore: number | null; opponentScore: number | null; matchStatus: string; onSaved: () => void }) {
  const { canEditActiveTeam } = useTeam();
  const [rows, setRows] = useState<MatchPlayerStatInput[] | null>(null);
  const [players, setPlayers] = useState<{ name: string; seasonId: string; number: number | null; position: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState({ team: teamScore?.toString() ?? '', opponent: opponentScore?.toString() ?? '', status: matchStatus === 'completed' ? 'completed' as const : 'missing_data' as const });
  const editable = canEditActiveTeam;

  useEffect(() => { setResult({ team: teamScore?.toString() ?? '', opponent: opponentScore?.toString() ?? '', status: matchStatus === 'completed' ? 'completed' : 'missing_data' }); }, [teamScore, opponentScore, matchStatus]);
  useEffect(() => { void Promise.all([playersService.list(), matchStatsService.list(matchId)]).then(([items, stats]) => { const squad = items.flatMap((player) => player.player_seasons.map((season) => ({ name: player.full_name, seasonId: season.id, number: season.shirt_number, position: season.primary_position }))); setPlayers(squad); const bySeason = new Map(stats.map((stat) => [stat.player_season_id, stat])); setRows(squad.map((player) => bySeason.get(player.seasonId) ?? emptyStat(player.seasonId))); }).catch(() => setRows([])); }, [matchId]);
  const values = useMemo(() => new Map((rows ?? []).map((row) => [row.player_season_id, row])), [rows]);
  const update = (id: string, patch: Partial<MatchPlayerStatInput>) => setRows((items) => (items ?? []).map((item) => item.player_season_id === id ? { ...item, ...patch } : item));
  const changeStatus = (id: string, squad_status: MatchSquadStatus) => update(id, { squad_status, started: squad_status === 'starter' });
  const numberChange = (id: string, key: keyof Pick<MatchPlayerStatInput, 'minutes_played' | 'goals' | 'assists' | 'yellow_cards' | 'red_cards'>, value: string) => update(id, { [key]: Math.max(0, Number(value) || 0) });
  const save = async () => {
    if (!rows) return;
    const team = result.team === '' ? null : Math.max(0, Number(result.team));
    const opponent = result.opponent === '' ? null : Math.max(0, Number(result.opponent));
    if (result.status === 'completed' && (team === null || opponent === null || !Number.isInteger(team) || !Number.isInteger(opponent))) { setMessage('יש להזין תוצאה חוקית לפני סימון משחק כהושלם.'); return; }
    setSaving(true); setMessage('');
    try { await matchStatsService.saveReport(matchId, team, opponent, result.status, rows); setMessage('דוח המשחק נשמר. התוצאה ונתוני השחקנים עודכנו בכל המערכת.'); onSaved(); }
    catch { setMessage('לא ניתן לשמור את דוח המשחק.'); }
    finally { setSaving(false); }
  };
  if (rows === null) return <LoadingSkeleton lines={8}/>;
  return <section className="match-stats-editor"><div className="match-stats-heading"><div><h2>דוח משחק: תוצאה, סגל וסטטיסטיקות</h2><p>הזינו תוצאה, דקות, כובשים ובישולים. השמירה מעדכנת אוטומטית את כרטיסי השחקנים ואת דשבורד הסטטיסטיקה.</p></div>{editable && <PrimaryButton onClick={() => void save()} disabled={saving}><Save size={17}/>{saving ? 'שומר…' : 'שמירת דוח משחק'}</PrimaryButton>}</div><div className="match-result-form"><label>שערי הקבוצה<input type="number" min="0" value={result.team} disabled={!editable} onChange={(event) => setResult({ ...result, team: event.target.value })}/></label><span>:</span><label>שערי היריבה<input type="number" min="0" value={result.opponent} disabled={!editable} onChange={(event) => setResult({ ...result, opponent: event.target.value })}/></label><label>סטטוס דוח<select value={result.status} disabled={!editable} onChange={(event) => setResult({ ...result, status: event.target.value as 'completed' | 'missing_data' })}><option value="completed">הושלם</option><option value="missing_data">ממתין להשלמת נתונים</option></select></label></div>{players.length ? <div className="table-wrap"><table><thead><tr><th>שחקן</th><th>סטטוס</th><th>דקות</th><th>שערים</th><th>בישולים</th><th>צהובים</th><th>אדומים</th></tr></thead><tbody>{players.map((player) => { const row = values.get(player.seasonId) ?? emptyStat(player.seasonId); return <tr key={player.seasonId}><td><b>{player.number ? `${player.number}. ` : ''}{player.name}</b><small>{player.position}</small></td><td><select value={row.squad_status} disabled={!editable} onChange={(event) => changeStatus(player.seasonId, event.target.value as MatchSquadStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>{(['minutes_played', 'goals', 'assists', 'yellow_cards', 'red_cards'] as const).map((key) => <td key={key}><input aria-label={`${key} עבור ${player.name}`} type="number" min="0" max={key === 'yellow_cards' ? 2 : key === 'red_cards' ? 1 : 180} value={row[key]} disabled={!editable || row.squad_status === 'not_in_squad'} onChange={(event) => numberChange(player.seasonId, key, event.target.value)} /></td>)}</tr>; })}</tbody></table></div> : <EmptyState title="אין שחקנים בסגל הקבוצה הפעילה" text="הוסיפו או ייבאו סגל לקבוצה זו לפני הזנת דקות, כובשים ובישולים." action={editable ? <Link className="button secondary" to="/players">מעבר לסגל</Link> : undefined}/>} {message && <p className={message.includes('נשמר') ? 'success-message' : 'form-error'}>{message}</p>}</section>;
}
