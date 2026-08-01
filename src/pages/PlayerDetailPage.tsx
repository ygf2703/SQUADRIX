import { useEffect, useState } from 'react';
import { ArrowRight, Edit3, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { KpiCard, LoadingSkeleton, PageHeader, PlayerAvatar, PrimaryButton, SecondaryButton, StatusBadge } from '../components/ui';
import { Tabs } from '../components/Tabs';
import { PermissionGuard } from '../components/PermissionGuard';
import { playersService } from '../services/playersService';
import type { Player } from '../types/domain';

const tabs = [{ id: 'overview', label: 'סקירה' }, { id: 'matches', label: 'משחקים' }, { id: 'statistics', label: 'סטטיסטיקות' }, { id: 'notes', label: 'הערות' }, { id: 'history', label: 'היסטוריה' }];
export function PlayerDetailPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [player, setPlayer] = useState<Player | null | undefined>(undefined); const [active, setActive] = useState('overview'); const [confirm, setConfirm] = useState(false); const [deleting, setDeleting] = useState(false);
  useEffect(() => { void playersService.list().then((items) => setPlayer(items.find((item) => item.id === id) ?? null)).catch(() => setPlayer(null)); }, [id]);
  if (player === undefined) return <LoadingSkeleton lines={5} />;
  if (!player) return <section className="empty-state"><h2>השחקן לא נמצא</h2><Link to="/players">חזרה לסגל</Link></section>;
  const season = player.player_seasons[0];
  const remove = async () => { if (!id) return; setDeleting(true); try { await playersService.remove(id); navigate('/players'); } finally { setDeleting(false); } };
  return <><Link className="back-link" to="/players"><ArrowRight size={16}/>חזרה לסגל</Link><PageHeader title={player.full_name} description={season ? `${season.primary_position} · ${season.shirt_number ? `#${season.shirt_number}` : 'ללא מספר חולצה'}` : 'טרם שובץ לעונה'} action={<PermissionGuard roles={['admin','professional_staff']}><span className="inline-actions"><PrimaryButton onClick={() => navigate(`/players/${id}/edit`)}><Edit3 size={17}/>ערוך שחקן</PrimaryButton><SecondaryButton onClick={() => setConfirm(true)}><Trash2 size={17}/>מחיקה</SecondaryButton></span></PermissionGuard>} /><section className="player-summary"><PlayerAvatar name={player.full_name} src={player.photo_url}/><div><strong>{player.full_name}</strong>{season && <StatusBadge status={season.squad_status}/>}</div></section><div className="kpis player-kpis"><KpiCard label="הופעות" value="—"/><KpiCard label="הרכבים" value="—"/><KpiCard label="דקות" value="—"/><KpiCard label="שערים" value="—"/><KpiCard label="בישולים" value="—"/></div><Tabs items={tabs} active={active} onChange={setActive}/><section className="data-card detail-content">{active === 'overview' && <><h2>סקירה מקצועית</h2><dl className="details-list"><div><dt>תפקיד ראשי</dt><dd>{season?.primary_position ?? 'טרם הוזן'}</dd></div><div><dt>תפקיד משני</dt><dd>{season?.secondary_position ?? '—'}</dd></div><div><dt>מספר חולצה</dt><dd>{season?.shirt_number ?? 'טרם הוזן'}</dd></div><div><dt>סטטוס</dt><dd>{season && <StatusBadge status={season.squad_status}/>}</dd></div>{season?.expected_absence_until && <div><dt>צפי היעדרות עד</dt><dd>{season.expected_absence_until}</dd></div>}</dl></>}{active !== 'overview' && <p className="muted">נתונים אלה יוצגו לאחר הזנת נתוני משחק והערות מקצועיות.</p>}</section>{confirm && <ConfirmDialog title={`למחוק את ${player.full_name}?`} description="פעולה זו תמחק את השחקן ואת שיוכיו לעונות. אין אפשרות לבטל את הפעולה." onCancel={() => setConfirm(false)} onConfirm={() => void remove()} busy={deleting}/>}</>;
}
