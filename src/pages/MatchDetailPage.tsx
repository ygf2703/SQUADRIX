import { useEffect, useState } from 'react';
import { ArrowRight, Edit3, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Completion, KpiCard, LoadingSkeleton, PageHeader, PrimaryButton, SecondaryButton, StatusBadge } from '../components/ui';
import { PermissionGuard } from '../components/PermissionGuard';
import { Tabs } from '../components/Tabs';
import { matchesService } from '../services/matchesService';
import { useBrand } from '../contexts/BrandContext';
import type { Match } from '../types/domain';
const tabs = [{ id: 'overview', label: 'סקירה' }, { id: 'squad', label: 'סגל והרכב' }, { id: 'events', label: 'אירועים' }, { id: 'statistics', label: 'סטטיסטיקות' }, { id: 'notes', label: 'הערות' }];
export function MatchDetailPage() {
  const { id } = useParams(); const navigate = useNavigate(); const { brand } = useBrand(); const [match, setMatch] = useState<Match | null | undefined>(undefined); const [active, setActive] = useState('overview'); const [confirm, setConfirm] = useState(false); const [deleting, setDeleting] = useState(false);
  useEffect(() => { void matchesService.list().then((items) => setMatch(items.find((item) => item.id === id) ?? null)).catch(() => setMatch(null)); }, [id]);
  if (match === undefined) return <LoadingSkeleton lines={5} />;
  if (!match) return <section className="empty-state"><h2>המשחק לא נמצא</h2><Link to="/matches">חזרה למשחקים</Link></section>;
  const completed = match.match_status === 'completed'; const remove = async () => { if (!id) return; setDeleting(true); try { await matchesService.remove(id); navigate('/matches'); } finally { setDeleting(false); } };
  return <><Link className="back-link" to="/matches"><ArrowRight size={16}/>חזרה למשחקים</Link><PageHeader title={`${brand.name} מול ${match.opponent_name}`} description={`${match.home_or_away === 'home' ? 'בית' : 'חוץ'} · ${match.competition_name} · ${match.match_date ?? 'מועד טרם נקבע'}`} action={<PermissionGuard roles={['admin','professional_staff']}><span className="inline-actions"><PrimaryButton onClick={() => navigate(`/matches/${id}/edit`)}><Edit3 size={17}/>ערוך משחק</PrimaryButton><SecondaryButton onClick={() => setConfirm(true)}><Trash2 size={17}/>מחיקה</SecondaryButton></span></PermissionGuard>} /><section className="match-hero"><div><StatusBadge status={match.match_status}/><strong>{completed ? `${match.team_score}:${match.opponent_score}` : 'תוצאה טרם הוזנה'}</strong><span>{completed ? 'תוצאה סופית' : 'ממתין לנתוני משחק'}</span></div><Completion completed={completed}/></section><div className="kpis match-kpis"><KpiCard label="סגל" value="טרם הוזן"/><KpiCard label="הרכב" value="טרם הוזן"/><KpiCard label="דקות" value="טרם הוזן"/><KpiCard label="שערים" value={completed ? (match.team_score ?? 0) : 'טרם הוזן'}/></div><Tabs items={tabs} active={active} onChange={setActive}/><section className="data-card detail-content">{active === 'overview' ? <><h2>פרטי המשחק</h2><dl className="details-list"><div><dt>מסגרת</dt><dd>{match.competition_name}</dd></div><div><dt>בית או חוץ</dt><dd>{match.home_or_away === 'home' ? 'בית' : 'חוץ'}</dd></div><div><dt>תאריך</dt><dd>{match.match_date ?? 'טרם נקבע'}</dd></div><div><dt>שעה</dt><dd>{match.kickoff_time ?? 'טרם נקבעה'}</dd></div><div><dt>מגרש</dt><dd>{match.venue ?? 'טרם הוזן'}</dd></div></dl></> : <p className="muted">מסך זה יושלם לאחר הזנת הסגל, הדקות ואירועי המשחק.</p>}</section>{confirm && <ConfirmDialog title={`למחוק את המשחק מול ${match.opponent_name}?`} description="הפעולה תמחק גם נתוני סגל וסטטיסטיקות המשויכים למשחק. אין אפשרות לבטל אותה." onCancel={() => setConfirm(false)} onConfirm={() => void remove()} busy={deleting}/>}</>;
}
