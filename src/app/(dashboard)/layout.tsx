import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { authLogger } from '@/lib/auth-logger';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, admin, isLoading, setLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    authLogger.info('DashboardLayout', 'Checking auth state', {
      isAuthenticated,
      hasAdmin: !!admin,
      isLoading,
    });

    // Give zustand time to rehydrate from localStorage
    const checkAuth = () => {
      const state = useAuthStore.getState();

      authLogger.info('DashboardLayout', 'Auth state after rehydration', {
        isAuthenticated: state.isAuthenticated,
        hasAdmin: !!state.admin,
        adminEmail: state.admin?.email,
      });

      if (!state.isAuthenticated || !state.admin) {
        authLogger.warning('DashboardLayout', 'Not authenticated, redirecting to login');
        navigate('/login', { replace: true });
      } else {
        authLogger.success('DashboardLayout', 'User authenticated', {
          email: state.admin.email,
          role: state.admin.role,
        });
        setLoading(false);
      }

      setIsChecking(false);
    };

    // Small delay to allow zustand to rehydrate
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading while checking auth
  if (isChecking || isLoading) {
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
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
