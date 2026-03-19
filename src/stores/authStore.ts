import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminRole } from '@/types';
import { authLogger } from '@/lib/auth-logger';

interface AuthAdmin {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  twoFactorEnabled: boolean;
  permissions?: Record<string, boolean>;
}

interface AuthState {
  admin: AuthAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  pendingAdmin: AuthAdmin | null;
  setAuth: (admin: AuthAdmin) => void;
  setPending2FA: (admin: AuthAdmin) => void;
  complete2FA: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: true, // Start true — wait for cookie verification before acting
      requires2FA: false,
      pendingAdmin: null,

      setAuth: (admin) => {
        authLogger.state('AuthStore', 'setAuth called', {
          newAdmin: admin,
          currentState: {
            admin: get().admin,
            isAuthenticated: get().isAuthenticated,
          },
        });

        set({
          admin,
          isAuthenticated: true,
          isLoading: false,
          requires2FA: false,
          pendingAdmin: null,
        });

        authLogger.success('AuthStore', 'State updated (cookie-based auth)', {
          admin,
          isAuthenticated: true,
        });
      },

      setPending2FA: (admin) => {
        authLogger.state('AuthStore', 'setPending2FA called', { admin });
        set({
          pendingAdmin: admin,
          requires2FA: true,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      complete2FA: () => {
        const { pendingAdmin } = get();
        authLogger.state('AuthStore', 'complete2FA called', { pendingAdmin });

        if (pendingAdmin) {
          set({
            admin: pendingAdmin,
            isAuthenticated: true,
            requires2FA: false,
            pendingAdmin: null,
          });
          authLogger.success('AuthStore', '2FA completed');
        }
      },

      logout: () => {
        authLogger.state('AuthStore', 'logout called', {
          currentAdmin: get().admin,
        });

        set({
          admin: null,
          isAuthenticated: false,
          isLoading: false,
          requires2FA: false,
          pendingAdmin: null,
        });

        authLogger.success('AuthStore', 'State cleared after logout (cookies handled by backend)');
      },

      setLoading: (isLoading) => {
        authLogger.state('AuthStore', 'setLoading', { isLoading });
        set({ isLoading });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => {
        authLogger.state('AuthStore', 'Persisting to localStorage', {
          admin: state.admin,
          isAuthenticated: state.isAuthenticated,
        });

        // Only persist admin info for UI purposes
        // Auth is handled by httpOnly cookies from backend
        return {
          admin: state.admin,
          isAuthenticated: state.isAuthenticated,
        };
      },
      onRehydrateStorage: () => {
        authLogger.info('AuthStore', 'Rehydrating from localStorage...');

        return (state, error) => {
          if (error) {
            authLogger.error('AuthStore', 'Rehydration failed', { error });
            // On error, clear auth state
            setTimeout(() => {
              useAuthStore.getState().setLoading(false);
            }, 0);
            return;
          }

          authLogger.success('AuthStore', 'Rehydration complete', {
            admin: state?.admin,
            isAuthenticated: state?.isAuthenticated,
          });

          // Verify cookies are still valid by calling /api/auth/me
          // localStorage may say "authenticated" but cookies could be expired
          if (state?.isAuthenticated && state?.admin) {
            authLogger.info('AuthStore', 'Verifying cookies with /api/auth/me (via api client)...');

            // Use api client (dynamic import to avoid circular dependency)
            // CRITICAL: raw fetch skips the 401→refresh→retry flow in api client.
            // If access token expired but refresh token is valid, raw fetch would
            // get 401 and immediately logout. Api client handles refresh automatically.
            import('@/lib/api')
              .then(({ api }) =>
                api.get('/api/auth/me').then(
                  (result: { success: boolean }) => {
                    if (result.success) {
                      authLogger.success('AuthStore', 'Cookie verification passed');
                      useAuthStore.getState().setLoading(false);
                    } else {
                      authLogger.warning(
                        'AuthStore',
                        'Cookie verification failed — clearing stale session',
                        { result },
                      );
                      useAuthStore.getState().logout();
                    }
                  },
                  (err: Error) => {
                    // 'Unauthorized' = api client already called logout via doLogoutAndRedirect
                    if (err?.message === 'Unauthorized') {
                      authLogger.warning(
                        'AuthStore',
                        'Session expired — api client handled logout',
                      );
                      return;
                    }
                    // Network error — don't logout, just stop loading
                    authLogger.error('AuthStore', 'Cookie verification error', {
                      error: String(err),
                    });
                    useAuthStore.getState().setLoading(false);
                  },
                ),
              )
              .catch((importErr) => {
                authLogger.error('AuthStore', 'Failed to import api module', {
                  error: String(importErr),
                });
                useAuthStore.getState().setLoading(false);
              });
          } else {
            // Not authenticated in localStorage — just mark loading done
            setTimeout(() => {
              useAuthStore.getState().setLoading(false);
            }, 0);
          }
        };
      },
    },
  ),
);

// Log initial state on client side
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const state = useAuthStore.getState();
    authLogger.info('AuthStore', 'Initial state (cookie-based auth)', {
      admin: state.admin,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
    });
  }, 100);
}

// Helper hooks
export const useAdmin = () => useAuthStore((state) => state.admin);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAdminRole = () => useAuthStore((state) => state.admin?.role);
export const useIsSuperAdmin = () => useAuthStore((state) => state.admin?.role === 'super_admin');
