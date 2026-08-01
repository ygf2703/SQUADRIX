import { Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/LoginPage';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PlayersPage } from '../pages/PlayersPage';
import { PlayerDetailPage } from '../pages/PlayerDetailPage';
import { MatchesPage } from '../pages/MatchesPage';
import { MatchDetailPage } from '../pages/MatchDetailPage';
import { PlayerFormPage, MatchFormPage } from '../pages/EntryForms';
import { CsvImportPage } from '../pages/CsvImportPage';
import { SchedulePage } from '../pages/SchedulePage';
import { NotFoundPage, PlaceholderPage, StatisticsPage } from '../pages/UtilityPages';
import { ClubSettingsPage } from '../pages/ClubSettingsPage';
import { BrandProvider } from '../contexts/BrandContext';
function Guard({ children }: { children: React.ReactNode }) { const { profile, loading } = useAuth(); if (loading) return <div className="center">טוען…</div>; if (!profile?.is_active) return <LoginPage />; return <AppLayout profile={profile}>{children}</AppLayout>; }
export function App() { return <BrandProvider><Routes><Route path="/login" element={<LoginPage />} /><Route element={<Guard><div /></Guard>}><Route path="/" element={<DashboardPage />} /><Route path="/players" element={<PlayersPage />} /><Route path="/players/new" element={<PlayerFormPage />} /><Route path="/players/import" element={<CsvImportPage />} /><Route path="/players/:id/edit" element={<PlayerFormPage />} /><Route path="/players/:id" element={<PlayerDetailPage />} /><Route path="/matches" element={<MatchesPage />} /><Route path="/matches/new" element={<MatchFormPage />} /><Route path="/matches/import" element={<CsvImportPage />} /><Route path="/matches/:id/edit" element={<MatchFormPage />} /><Route path="/matches/:id" element={<MatchDetailPage />} /><Route path="/schedule" element={<SchedulePage />} /><Route path="/statistics" element={<StatisticsPage />} /><Route path="/seasons" element={<PlaceholderPage title="ניהול עונות" />} /><Route path="/users" element={<PlaceholderPage title="ניהול משתמשים" />} /><Route path="/audit" element={<PlaceholderPage title="לוג פעולות" />} /><Route path="/settings" element={<ClubSettingsPage />} /></Route><Route path="*" element={<NotFoundPage />} /></Routes></BrandProvider>; }
