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
  return <><PageHeader title="משתמשים והרשאות" description="ניהול הגישה של אנשי הצוות למועדון."/><section className="data-card users-card"><div className="users-summary"><Users size={20}/><span>{users.length} משתמשים רשומים</span></div>{error ? <ErrorState retry={load} /> : !users.length ? <EmptyState title="אין משתמשים" text="משתמשים שיוזמנו או יירשמו יופיעו כאן." /> : <div className="table-wrap"><table><thead><tr><th>משתמש</th><th>סטטוס</th><th>רמת הרשאה</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><b>{user.full_name || user.email}</b>{user.full_name && <small dir="ltr">{user.email}</small>}</td><td>{user.is_active ? 'פעיל' : 'לא פעיל'}</td><td>{user.role === 'admin' ? <span className="role-display"><ShieldCheck size={16}/>{roleLabels.admin}</span> : <select value={user.role} disabled={savingId === user.id} onChange={(event) => void changeRole(user, event.target.value as 'professional_staff' | 'viewer')} aria-label={`הרשאה עבור ${user.email}`}><option value="professional_staff">צוות מקצועי</option><option value="viewer">צפייה בלבד</option></select>}</td></tr>)}</tbody></table></div>}</section></>;
}
