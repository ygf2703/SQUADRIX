import { useEffect, useMemo, useState } from 'react';
import { Plus, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, LoadingSkeleton, PageHeader, PrimaryButton, SecondaryButton } from '../components/ui';
import { useTeam } from '../contexts/TeamContext';
import { clubManagementService, type ClubAccessMember, type ClubRole, type TeamRole } from '../services/clubManagementService';

const clubRoleLabels: Record<ClubRole, string> = { owner: 'בעלים', ceo: 'מנכ״ל', professional_director: 'מנהל מקצועי', club_admin: 'מנהל מועדון' };
const teamRoleLabels: Record<TeamRole, string> = { head_coach: 'מאמן ראשי', assistant_coach: 'עוזר מאמן', analyst: 'אנליסט', physio: 'פיזיותרפיסט', viewer: 'צפייה בלבד' };

export function ClubManagementPage() {
  const { activeTeam, teams, canManageClub } = useTeam();
  const clubId = activeTeam?.club_id ?? '';
  const [members, setMembers] = useState<ClubAccessMember[] | null>(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState<'club' | 'team'>('team');
  const [selectedTeamId, setSelectedTeamId] = useState(activeTeam?.id ?? '');
  const [clubRole, setClubRole] = useState<ClubRole>('club_admin');
  const [teamRole, setTeamRole] = useState<TeamRole>('head_coach');
  const [saving, setSaving] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', age_group: '', league_name: '', district: '' });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{ profileId: string; teamId?: string; name: string } | null>(null);

  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) ?? activeTeam, [teams, selectedTeamId, activeTeam]);
  const load = () => {
    if (!clubId) { setMembers([]); return; }
    setError('');
    void clubManagementService.listAccess(clubId).then(setMembers).catch((reason: unknown) => {
      setMembers([]); setError(reason instanceof Error ? reason.message : 'לא ניתן לטעון את הרשאות המועדון.');
    });
  };
  useEffect(load, [clubId]);
  useEffect(() => { if (activeTeam) setSelectedTeamId(activeTeam.id); }, [activeTeam]);

  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      if (scope === 'club') await clubManagementService.addClubMember(clubId, email, clubRole);
      else if (selectedTeam) await clubManagementService.addTeamMember(selectedTeam.id, email, teamRole);
      else throw new Error('בחרו קבוצה.');
      setEmail(''); load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'לא ניתן לשמור את ההרשאה.'); }
    finally { setSaving(false); }
  };
  const createTeam = async (event: React.FormEvent) => {
    event.preventDefault(); setCreatingTeam(true); setError('');
    try {
      await clubManagementService.createTeam(clubId, { ...teamForm, season_id: activeTeam?.current_season_id ?? null });
      setTeamForm({ name: '', age_group: '', league_name: '', district: '' });
      window.location.reload();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'לא ניתן ליצור קבוצה.'); }
    finally { setCreatingTeam(false); }
  };
  const removeMember = async () => {
    if (!pendingRemove) return;
    setSaving(true); setError('');
    try {
      if (pendingRemove.teamId) await clubManagementService.removeTeamMember(pendingRemove.teamId, pendingRemove.profileId);
      else await clubManagementService.removeClubMember(clubId, pendingRemove.profileId);
      setPendingRemove(null); load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'לא ניתן להסיר את ההרשאה.'); }
    finally { setSaving(false); }
  };

  if (!canManageClub) return <EmptyState title="גישה למנהלי מועדון בלבד" text="המסך זמין לבעלים, מנכ״ל, מנהל מקצועי או מנהל מועדון." />;
  if (!activeTeam) return <EmptyState title="אין קבוצה פעילה" text="הקימו או בחרו קבוצה לפני ניהול הרשאות." />;
  if (members === null) return <LoadingSkeleton lines={7} />;
  return <>
    <PageHeader title="ניהול מועדון וקבוצות" description="הנהלת המועדון רואה את כל הקבוצות; אנשי צוות רואים ועורכים רק את הקבוצות שאליהן שובצו." />
    <section className="access-guide"><div><ShieldCheck size={21}/><div><h2>מודל הרשאות</h2><p>שיוך ברמת מועדון מתאים לבעלים, מנכ״ל ומנהל מקצועי. שיוך ברמת קבוצה מתאים למאמן ולצוות המקצועי.</p></div></div></section>
    <div className="club-management-grid">
      <section className="data-card"><h2>הוספת משתמש והרשאה</h2><p className="section-note">המשתמש צריך להירשם לאפליקציה קודם באמצעות כתובת הדוא״ל הזו.</p><form className="page-form compact-form" onSubmit={addMember}>
        <label className="form-field">כתובת דוא״ל<input dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="coach@club.co.il" /></label>
        <label className="form-field">היקף גישה<select value={scope} onChange={(event) => setScope(event.target.value as 'club' | 'team')}><option value="team">קבוצה ספציפית</option><option value="club">כל קבוצות המועדון</option></select></label>
        {scope === 'club' ? <label className="form-field">תפקיד במועדון<select value={clubRole} onChange={(event) => setClubRole(event.target.value as ClubRole)}>{Object.entries(clubRoleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : <><label className="form-field">קבוצה<select value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name} · {team.age_group}</option>)}</select></label><label className="form-field">תפקיד בקבוצה<select value={teamRole} onChange={(event) => setTeamRole(event.target.value as TeamRole)}>{Object.entries(teamRoleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></>}
        <PrimaryButton type="submit" disabled={saving}><UsersRound size={17}/>{saving ? 'שומר…' : 'הוספת הרשאה'}</PrimaryButton>
      </form></section>
      <section className="data-card"><h2>יצירת קבוצה במועדון</h2><p className="section-note">הקבוצה החדשה תקבל עונה פעילה, ותופיע מיד בבורר הקבוצות.</p><form className="page-form compact-form" onSubmit={createTeam}>
        <label className="form-field">שם קבוצה<input value={teamForm.name} onChange={(event) => setTeamForm({ ...teamForm, name: event.target.value })} required placeholder="נערים א׳" /></label>
        <label className="form-field">שנתון / גיל<input value={teamForm.age_group} onChange={(event) => setTeamForm({ ...teamForm, age_group: event.target.value })} required placeholder="2010" /></label>
        <label className="form-field">ליגה<input value={teamForm.league_name} onChange={(event) => setTeamForm({ ...teamForm, league_name: event.target.value })} required placeholder="ליגת נערים" /></label>
        <label className="form-field">מחוז<input value={teamForm.district} onChange={(event) => setTeamForm({ ...teamForm, district: event.target.value })} required placeholder="שרון" /></label>
        <PrimaryButton type="submit" disabled={creatingTeam}><Plus size={17}/>{creatingTeam ? 'יוצר…' : 'יצירת קבוצה'}</PrimaryButton>
      </form></section>
    </div>
    {error && <p className="form-error">{error}</p>}
    <section className="data-card club-members-card"><div className="users-table-heading"><div><h2>הרשאות פעילות</h2><p>{members.length} אנשי צוות עם גישה למועדון או לאחת הקבוצות.</p></div></div>
      {!members.length ? <EmptyState title="אין הרשאות פעילות" text="הוסיפו איש צוות לאחר שנרשם לאפליקציה." /> : <div className="table-wrap"><table><thead><tr><th>משתמש</th><th>גישה למועדון</th><th>גישה לקבוצות</th><th></th></tr></thead><tbody>{members.map((member) => <tr key={member.profile_id}><td><b>{member.full_name || member.email}</b>{member.full_name && <small dir="ltr">{member.email}</small>}</td><td>{member.club_role ? <span className="role-display"><ShieldCheck size={16}/>{clubRoleLabels[member.club_role]}</span> : '—'}</td><td>{member.team_memberships.length ? member.team_memberships.map((membership) => <span className="membership-chip" key={membership.team_id}>{membership.team_name}: {teamRoleLabels[membership.role]} <button aria-label={`הסרת ${member.email} מ-${membership.team_name}`} onClick={() => setPendingRemove({ profileId: member.profile_id, teamId: membership.team_id, name: member.full_name || member.email })}><Trash2 size={14}/></button></span>) : '—'}</td><td>{member.club_role && <SecondaryButton className="table-delete" onClick={() => setPendingRemove({ profileId: member.profile_id, name: member.full_name || member.email })}><Trash2 size={15}/>הסרה</SecondaryButton>}</td></tr>)}</tbody></table></div>}
    </section>
    {pendingRemove && <ConfirmDialog title="להסיר הרשאה?" description={`הגישה של ${pendingRemove.name} תוסר ${pendingRemove.teamId ? 'מהקבוצה בלבד' : 'מכל קבוצות המועדון'}.`} onCancel={() => setPendingRemove(null)} onConfirm={() => void removeMember()} busy={saving} confirmLabel="הסרת הרשאה" busyLabel="מסיר…" />}
  </>;
}
