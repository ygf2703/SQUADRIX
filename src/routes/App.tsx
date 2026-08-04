import { Route, Routes } from 'react-router-dom';
import { AuthProvider, useCurrentAuth } from '../contexts/AuthContext';
import { BrandProvider } from '../contexts/BrandContext';
import { TeamProvider, useTeam } from '../contexts/TeamContext';
import { AppLayout } from '../layouts/AppLayout';
import { ClubSettingsPage } from '../pages/ClubSettingsPage';
import { ClubManagementPage } from '../pages/ClubManagementPage';
import { SubscriptionPage } from '../pages/SubscriptionPage';
import { CsvImportPage } from '../pages/CsvImportPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PlayerFormPage, MatchFormPage } from '../pages/EntryForms';
import { GuidePage } from '../pages/GuidePage';
import { LoginPage } from '../pages/LoginPage';
import { MatchDetailPage } from '../pages/MatchDetailPage';
import { MatchesPage } from '../pages/MatchesPage';
import { NextMatchPage } from '../pages/NextMatchPage';
import { PlayerDetailPage } from '../pages/PlayerDetailPage';
import { PlayersPage } from '../pages/PlayersPage';
import { SchedulePage } from '../pages/SchedulePage';
import { StatisticsDashboardPage } from '../pages/StatisticsDashboardPage';
import { UsersPage } from '../pages/UsersPage';
import { NotFoundPage } from '../pages/UtilityPages';
import { EmptyState, LoadingSkeleton } from '../components/ui';

function Guard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useCurrentAuth();
  if (loading) return <div className="center">טוען…</div>;
  if (!profile?.is_active) return <LoginPage />;
  return <AppLayout profile={profile}>{children}</AppLayout>;
}

function TeamEditGuard({ children }: { children: React.ReactNode }) {
  const { loading, canEditActiveTeam } = useTeam();
  if (loading) return <LoadingSkeleton lines={4} />;
  if (!canEditActiveTeam) return <EmptyState title="אין הרשאת עריכה לקבוצה" text="חשבון צפייה יכול לראות נתונים בלבד. מנהל המועדון יכול להעניק לצוות המקצועי הרשאה לקבוצה דרך ניהול מועדון." />;
  return <>{children}</>;
}

export function App() {
  return <AuthProvider><BrandProvider><TeamProvider><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<Guard><div /></Guard>}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/next-match" element={<NextMatchPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/players/new" element={<TeamEditGuard><PlayerFormPage /></TeamEditGuard>} />
      <Route path="/players/import" element={<TeamEditGuard><CsvImportPage /></TeamEditGuard>} />
      <Route path="/players/:id/edit" element={<TeamEditGuard><PlayerFormPage /></TeamEditGuard>} />
      <Route path="/players/:id" element={<PlayerDetailPage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/matches/new" element={<TeamEditGuard><MatchFormPage /></TeamEditGuard>} />
      <Route path="/matches/import" element={<TeamEditGuard><CsvImportPage /></TeamEditGuard>} />
      <Route path="/matches/:id/edit" element={<TeamEditGuard><MatchFormPage /></TeamEditGuard>} />
      <Route path="/matches/:id" element={<MatchDetailPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/statistics" element={<StatisticsDashboardPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/club-management" element={<ClubManagementPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/settings" element={<ClubSettingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></TeamProvider></BrandProvider></AuthProvider>;
}
