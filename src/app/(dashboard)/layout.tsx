import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WalletAlertBanner } from '@/components/WalletAlertBanner';
import { useAuthStore } from '@/stores/authStore';
import { authLogger } from '@/lib/auth-logger';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, admin, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait for rehydration to complete before checking auth
    if (isLoading) return;

    authLogger.info('DashboardLayout', 'Auth state after rehydration', {
      isAuthenticated,
      hasAdmin: !!admin,
      adminEmail: admin?.email,
    });

    if (!isAuthenticated || !admin) {
      authLogger.warning('DashboardLayout', 'Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    } else {
      authLogger.success('DashboardLayout', 'User authenticated', {
        email: admin.email,
        role: admin.role,
      });
    }
  }, [isLoading, isAuthenticated, admin, navigate]);

  // Show loading while rehydrating from localStorage
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Dang kiem tra xac thuc...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Dang chuyen huong...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <WalletAlertBanner />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
