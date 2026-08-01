import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Plus } from 'lucide-react';
import { PermissionGuard } from '../components/PermissionGuard';
import { EmptyState, LoadingSkeleton, PageHeader, PrimaryButton, StatusBadge } from '../components/ui';
import { matchesService } from '../services/matchesService';
import type { Match } from '../types/domain';

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  useEffect(() => { void matchesService.list().then(setMatches).catch(() => setMatches([])); }, []);
  const addAction = <PermissionGuard roles={['admin', 'professional_staff']}><span className="inline-actions"><Link to="/matches/import"><button className="button secondary"><FileUp size={18}/>ייבוא CSV</button></Link><Link to="/matches/new"><PrimaryButton><Plus size={18}/>הוסף משחק</PrimaryButton></Link></span></PermissionGuard>;
  return <><PageHeader title="משחקים" description="לוח משחקים, הרכבים ונתוני משחק" action={addAction}/>{matches === null ? <LoadingSkeleton lines={6}/> : matches.length === 0 ? <EmptyState title="טרם הוזנו משחקים" text="הוסיפו משחק ראשון כדי לנהל סגל, דקות וסטטיסטיקות." action={addAction}/> : <div className="data-card table-wrap"><table><thead><tr><th>יריבה</th><th>תאריך</th><th>בית או חוץ</th><th>תוצאה</th><th>סטטוס</th></tr></thead><tbody>{matches.map((match) => <tr key={match.id}><td><Link className="player-link" to={`/matches/${match.id}`}><b>{match.opponent_name}</b></Link></td><td>{match.match_date ?? 'טרם נקבע'}</td><td>{match.home_or_away === 'home' ? 'בית' : 'חוץ'}</td><td>{match.team_score === null ? '—' : `${match.team_score}:${match.opponent_score}`}</td><td><StatusBadge status={match.match_status}/></td></tr>)}</tbody></table></div>}</>;
}
