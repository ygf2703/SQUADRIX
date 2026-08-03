import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PermissionGuard } from '../components/PermissionGuard';
import { EmptyState, LoadingSkeleton, PageHeader, PrimaryButton, SecondaryButton, StatusBadge } from '../components/ui';
import { matchesService } from '../services/matchesService';
import type { Match } from '../types/domain';

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { void matchesService.list().then(setMatches).catch(() => setMatches([])); }, []);
  const addAction = <PermissionGuard roles={['admin', 'professional_staff']}><span className="inline-actions"><Link to="/matches/import"><button className="button secondary"><FileUp size={18}/>ייבוא CSV</button></Link><Link to="/matches/new"><PrimaryButton><Plus size={18}/>הוסף משחק</PrimaryButton></Link></span></PermissionGuard>;
  const remove = async () => { if (!matchToDelete) return; setDeleting(true); setError(''); try { await matchesService.remove(matchToDelete.id); setMatches((items) => (items ?? []).filter((match) => match.id !== matchToDelete.id)); setMatchToDelete(null); } catch { setError('לא ניתן למחוק את המשחק. נסו שוב.'); } finally { setDeleting(false); } };
  return <><PageHeader title="משחקים" description="לוח משחקים, הרכבים ונתוני משחק" action={addAction}/>{error && <p className="form-error">{error}</p>}{matches === null ? <LoadingSkeleton lines={6}/> : matches.length === 0 ? <EmptyState title="טרם הוזנו משחקים" text="הוסיפו משחק ראשון כדי לנהל סגל, דקות וסטטיסטיקות." action={addAction}/> : <div className="data-card table-wrap"><table><thead><tr><th>יריבה</th><th>תאריך</th><th>בית או חוץ</th><th>תוצאה</th><th>סטטוס</th><th aria-label="פעולות"/></tr></thead><tbody>{matches.map((match) => <tr key={match.id}><td><Link className="player-link" to={`/matches/${match.id}`}><b>{match.opponent_name}</b></Link></td><td>{match.match_date ?? 'טרם נקבע'}</td><td>{match.home_or_away === 'home' ? 'בית' : 'חוץ'}</td><td>{match.team_score === null ? '—' : `${match.team_score}:${match.opponent_score}`}</td><td><StatusBadge status={match.match_status}/></td><td><PermissionGuard roles={['admin', 'professional_staff']}><SecondaryButton className="table-delete" onClick={() => setMatchToDelete(match)} aria-label={`מחיקת משחק מול ${match.opponent_name}`}><Trash2 size={16}/>מחיקה</SecondaryButton></PermissionGuard></td></tr>)}</tbody></table></div>}{matchToDelete && <ConfirmDialog title={`למחוק את המשחק מול ${matchToDelete.opponent_name}?`} description="פעולה זו תמחק גם את ההרכב המתוכנן ואת נתוני הסגל והסטטיסטיקות ששויכו למשחק. אין אפשרות לבטל אותה." onCancel={() => setMatchToDelete(null)} onConfirm={() => void remove()} busy={deleting}/>}</>;
}
