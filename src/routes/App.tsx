import { Route, Routes } from 'react-router-dom';
import { AuthProvider, useCurrentAuth } from '../contexts/AuthContext';
import { BrandProvider } from '../contexts/BrandContext';
import { AppLayout } from '../layouts/AppLayout';
import { ClubSettingsPage } from '../pages/ClubSettingsPage';
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

function Guard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useCurrentAuth();
  if (loading) return <div className="center">טוען…</div>;
  if (!profile?.is_active) return <LoginPage />;
  return <AppLayout profile={profile}>{children}</AppLayout>;
}

export function App() {
  return <AuthProvider><BrandProvider><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<Guard><div /></Guard>}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/next-match" element={<NextMatchPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/players/new" element={<PlayerFormPage />} />
      <Route path="/players/import" element={<CsvImportPage />} />
      <Route path="/players/:id/edit" element={<PlayerFormPage />} />
      <Route path="/players/:id" element={<PlayerDetailPage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/matches/new" element={<MatchFormPage />} />
      <Route path="/matches/import" element={<CsvImportPage />} />
      <Route path="/matches/:id/edit" element={<MatchFormPage />} />
      <Route path="/matches/:id" element={<MatchDetailPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/statistics" element={<StatisticsDashboardPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/settings" element={<ClubSettingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></BrandProvider></AuthProvider>;
}
