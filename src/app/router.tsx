import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import DashboardLayout from './(dashboard)/layout';

const HomePage = lazy(() => import('./page'));
const LoginPage = lazy(() => import('./(auth)/login/page'));
const Verify2FAPage = lazy(() => import('./(auth)/verify-2fa/page'));
const DashboardPage = lazy(() => import('./(dashboard)/dashboard/page'));
const DatabasePage = lazy(() => import('./(dashboard)/dashboard/database/page'));
const DatabaseTablePage = lazy(() => import('./(dashboard)/dashboard/database/table/page'));
const UsersPage = lazy(() => import('./(dashboard)/users/page'));
const UserDetailPage = lazy(() => import('./(dashboard)/users/detail/page'));
const StaffPage = lazy(() => import('./(dashboard)/staff/page'));
const ActivityLogsPage = lazy(() => import('./(dashboard)/activity-logs/page'));
const FileManagerPage = lazy(() => import('./(dashboard)/file-manager/page'));
const LegacyRecoveryPage = lazy(() => import('./(dashboard)/legacy-recovery/page'));
const RestoredPage = lazy(() => import('./(dashboard)/legacy-recovery/restored/page'));
const AlertsPage = lazy(() => import('./(dashboard)/monitoring/alerts/page'));
const BackupPage = lazy(() => import('./(dashboard)/monitoring/backup/page'));
const MetricsPage = lazy(() => import('./(dashboard)/monitoring/metrics/page'));
const QueryAnalyticsPage = lazy(() => import('./(dashboard)/monitoring/query-analytics/page'));
const SecurityPage = lazy(() => import('./(dashboard)/monitoring/security/page'));
const NotificationsPage = lazy(() => import('./(dashboard)/notifications/page'));
const SettingsPage = lazy(() => import('./(dashboard)/settings/page'));
const TopHoldersPage = lazy(() => import('./(dashboard)/top-holders/page'));
const EmailChangesPage = lazy(() => import('./(dashboard)/email-changes/page'));
const ConversionDashboardPage = lazy(() => import('./(dashboard)/conversion/page'));
const ConversionListPage = lazy(() => import('./(dashboard)/conversion/list/page'));
const ConversionAlertsPage = lazy(() => import('./(dashboard)/conversion/alerts/page'));
const ConversionFailedPage = lazy(() => import('./(dashboard)/conversion/failed/page'));
const ConversionAdminLogsPage = lazy(() => import('./(dashboard)/conversion/admin-logs/page'));
const NewsListPage = lazy(() => import('./(dashboard)/news/page'));
const NewsCreatePage = lazy(() => import('./(dashboard)/news/create/page'));
const NewsEditPage = lazy(() => import('./(dashboard)/news/edit/page'));
const NewsCategoriesPage = lazy(() => import('./(dashboard)/news/categories/page'));
const DeliveryAdminPage = lazy(() => import('./(dashboard)/delivery/page'));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-2fa" element={<Verify2FAPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/database" element={<DatabasePage />} />
          <Route path="/dashboard/database/table" element={<DatabaseTablePage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/detail" element={<UserDetailPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/activity-logs" element={<ActivityLogsPage />} />
          <Route path="/file-manager" element={<FileManagerPage />} />
          <Route path="/legacy-recovery" element={<LegacyRecoveryPage />} />
          <Route path="/legacy-recovery/restored" element={<RestoredPage />} />
          <Route path="/monitoring/alerts" element={<AlertsPage />} />
          <Route path="/monitoring/backup" element={<BackupPage />} />
          <Route path="/monitoring/metrics" element={<MetricsPage />} />
          <Route path="/monitoring/query-analytics" element={<QueryAnalyticsPage />} />
          <Route path="/monitoring/security" element={<SecurityPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/top-holders" element={<TopHoldersPage />} />
          <Route path="/email-changes" element={<EmailChangesPage />} />
          <Route path="/conversion" element={<ConversionDashboardPage />} />
          <Route path="/conversion/list" element={<ConversionListPage />} />
          <Route path="/conversion/alerts" element={<ConversionAlertsPage />} />
          <Route path="/conversion/failed" element={<ConversionFailedPage />} />
          <Route path="/conversion/admin-logs" element={<ConversionAdminLogsPage />} />
          <Route path="/news" element={<NewsListPage />} />
          <Route path="/news/create" element={<NewsCreatePage />} />
          <Route path="/news/:id/edit" element={<NewsEditPage />} />
          <Route path="/news/categories" element={<NewsCategoriesPage />} />
          <Route path="/delivery" element={<DeliveryAdminPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
