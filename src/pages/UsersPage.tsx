import { useEffect, useState } from 'react';
import { ShieldCheck, Users } from 'lucide-react';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '../components/ui';
import { useCurrentAuth } from '../contexts/AuthContext';
import { usersService } from '../services/usersService';
import type { Profile, Role } from '../types/domain';

const roleLabels: Record<Role, string> = { admin: 'מנהל מערכת', professional_staff: 'צוות מקצועי', viewer: 'צפייה בלבד' };

export function UsersPage() {
  const { profile: currentProfile } = useCurrentAuth();
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [error, setError] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const load = () => { setError(false); void usersService.list().then(setUsers).catch(() => { setUsers([]); setError(true); }); };
  useEffect(load, []);
  const changeRole = async (user: Profile, role: 'professional_staff' | 'viewer') => {
    setSavingId(user.id);
    try { await usersService.updateRole(user.id, role); setUsers((items) => items?.map((item) => item.id === user.id ? { ...item, role } : item) ?? []); }
    finally { setSavingId(null); }
  };
  if (currentProfile?.role !== 'admin') return <EmptyState title="גישה למנהלים בלבד" text="ניהול משתמשים והרשאות זמין למנהל המערכת." />;
  if (users === null) return <LoadingSkeleton lines={5} />;
  return <><PageHeader title="ניהול גישה לצוות" description="כאן קובעים מי יכול רק לצפות במידע ומי רשאי גם לעדכן אותו."/><section className="access-guide"><div><Users size={21}/><div><h2>כך זה עובד</h2><p>משתמש נרשם תחילה דרך מסך ההרשמה. לאחר מכן הוא מופיע כאן, והמנהל מגדיר את רמת הגישה שלו.</p></div></div><ul><li><b>מנהל מערכת</b><span>ניהול מלא, הגדרות והרשאות.</span></li><li><b>צוות מקצועי</b><span>צפייה והזנה/עריכה של נתוני הקבוצה.</span></li><li><b>צפייה בלבד</b><span>גישה למידע ללא אפשרות לשנות אותו.</span></li></ul></section><section className="data-card users-card"><div className="users-table-heading"><div><h2>משתמשים רשומים</h2><p>בחרו רמת גישה לכל משתמש. השינוי נשמר מיד.</p></div><span className="users-summary"><Users size={20}/>{users.length} משתמשים</span></div>{error ? <ErrorState retry={load} /> : !users.length ? <EmptyState title="אין משתמשים" text="משתמשים שיירשמו יופיעו כאן ותוכלו להגדיר להם הרשאה." /> : <div className="table-wrap"><table><thead><tr><th>משתמש</th><th>סטטוס</th><th>גישה במערכת</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><b>{user.full_name || user.email}</b>{user.full_name && <small dir="ltr">{user.email}</small>}</td><td>{user.is_active ? 'פעיל' : 'לא פעיל'}</td><td>{user.role === 'admin' ? <span className="role-display"><ShieldCheck size={16}/>{roleLabels.admin}</span> : <select value={user.role} disabled={savingId === user.id} onChange={(event) => void changeRole(user, event.target.value as 'professional_staff' | 'viewer')} aria-label={`הרשאה עבור ${user.email}`}><option value="professional_staff">צוות מקצועי — עריכה</option><option value="viewer">צפייה בלבד</option></select>}</td></tr>)}</tbody></table></div>}</section></>;
}
