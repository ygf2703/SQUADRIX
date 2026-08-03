import type { ReactNode } from 'react';
import { BarChart3, BookOpen, CalendarDays, ClipboardList, CreditCard, LayoutDashboard, LogOut, Settings, Shirt, Users, UsersRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import type { Profile } from '../types/domain';
import { authService } from '../services/authService';
import { useBrand } from '../contexts/BrandContext';
import { useTeam } from '../contexts/TeamContext';

const links = [
  { to: '/', label: 'דשבורד', icon: LayoutDashboard },
  { to: '/next-match', label: 'המשחק הבא', icon: Shirt },
  { to: '/players', label: 'סגל', icon: UsersRound },
  { to: '/matches', label: 'משחקים', icon: ClipboardList },
  { to: '/schedule', label: 'לוח זמנים', icon: CalendarDays },
  { to: '/statistics', label: 'סטטיסטיקות', icon: BarChart3 },
  { to: '/guide', label: 'מדריך שימוש', icon: BookOpen },
  { to: '/club-management', label: 'ניהול מועדון', icon: Users, clubManager: true },
  { to: '/subscription', label: 'מנוי מועדון', icon: CreditCard, clubManager: true },
  { to: '/users', label: 'משתמשים', icon: Users, admin: true },
  { to: '/settings', label: 'הגדרות', icon: Settings, clubManager: true },
];

export function AppLayout({ profile }: { profile: Profile; children?: ReactNode }) {
  const { brand } = useBrand();
  const { teams, activeTeam, selectTeam, canManageClub } = useTeam();
  const work = links.filter((link) => !link.admin && !link.clubManager);
  const admin = links.filter((link) => (link.admin && profile.role === 'admin') || (link.clubManager && canManageClub));
  const renderLinks = (items: typeof links) => items.map((link) => { const Icon = link.icon; return <NavLink key={link.to} to={link.to} end={link.to === '/'}><Icon size={18} aria-hidden="true"/><span>{link.label}</span></NavLink>; });
  const role = profile.role === 'admin' ? 'מנהל מערכת' : profile.role === 'professional_staff' ? 'צוות מקצועי' : 'צפייה בלבד';
  return <div className="shell"><aside><div className="brand app-brand"><img src="/squadrix-logo.png" alt="SQUADRIX"/><div><b>SQUADRIX</b><span>Football Team Operations</span></div></div><nav><p>{brand.name}</p>{teams.length > 1 && <label className="team-switcher"><span>קבוצה פעילה</span><select value={activeTeam?.id ?? ''} onChange={(event) => selectTeam(event.target.value)}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name} · {team.age_group}</option>)}</select></label>}{activeTeam && <small className="active-team-meta">{activeTeam.age_group} · {activeTeam.league_name}</small>}{renderLinks(work)}{admin.length > 0 && <><p className="nav-divider">ניהול מערכת</p>{renderLinks(admin)}</>}</nav><div className="sidebar-footer"><span>{profile.full_name || profile.email}</span><small>{role}</small></div></aside><main>{brand.logo_url && <img className="app-watermark club-watermark" src={brand.logo_url} alt="" aria-hidden="true"/>}<header><div className="mobile-team"><img src="/squadrix-logo.png" alt="" aria-hidden="true"/><span>{activeTeam?.name ?? 'SQUADRIX'}</span></div><div className="header-user"><b>{profile.full_name || profile.email}</b><span className="role">{brand.name} · {activeTeam?.name ?? role}</span></div><button className="button ghost" onClick={() => void authService.signOut()}><LogOut size={16}/>יציאה</button></header><Outlet /></main></div>;
}
