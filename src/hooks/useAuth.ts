import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { legacyApi } from '@/lib/api';
import { authLogger } from '@/lib/auth-logger';
import type { AdminRole } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponseAny = any;

export function useAuth() {
  const navigate = useNavigate();
  const {
    admin,
    isAuthenticated,
    isLoading,
    requires2FA,
    setAuth,
    logout: storeLogout,
  } = useAuthStore();

  const loginWithGoogle = useCallback(
    async (googleToken: string) => {
      authLogger.info('useAuth', 'Login flow started (cookie-based auth)', {
        tokenLength: googleToken?.length,
        tokenPrefix: googleToken?.substring(0, 30) + '...',
      });

      try {
        // 1. Call API - backend will set httpOnly cookies
        authLogger.network('useAuth', 'Calling backend /api/auth/google...');
        const startTime = Date.now();

        const response = (await legacyApi.auth.loginWithGoogle(googleToken)) as ApiResponseAny;

        const duration = Date.now() - startTime;
        authLogger.network('useAuth', `API response received (${duration}ms)`);

        // 2. Log full response structure
        authLogger.info('useAuth', 'Full API response', {
          response: JSON.stringify(response, null, 2),
          type: typeof response,
          keys: response ? Object.keys(response) : [],
          hasSuccess: 'success' in (response || {}),
          hasData: 'data' in (response || {}),
          hasUser: 'user' in (response || {}),
          hasError: 'error' in (response || {}),
        });

        // 3. Handle response - support multiple formats:
        // Format A: {success: true, data: {user: {...}}} - wrapped with data
        // Format B: {success: true, user: {...}} - wrapped, user at top level
        // Format C: {user: {...}} - legacy, no success flag
        // NOTE: Tokens are set via httpOnly cookies by backend, NOT in response body

        let user = null;
        let isSuccess = false;
        let needRegister = false;
        let googleUser = null;

        if (response && typeof response === 'object') {
          // Extract needRegister and googleUser at top level first
          // Backend sends these at root level when user doesn't exist yet
          if (response.needRegister) {
            needRegister = true;
            googleUser = response.googleUser || null;
          }
          if (response.data?.needRegister) {
            needRegister = true;
            googleUser = response.data.googleUser || null;
          }

          // Check if response has success flag
          if ('success' in response) {
            isSuccess = response.success === true;

            // User could be in response.data.user OR response.user
            if (response.data && response.data.user) {
              user = response.data.user;
            } else if (response.user) {
              user = response.user;
            }
          } else if (response.user) {
            // Legacy format without success flag
            isSuccess = true;
            user = response.user;
          }
        }

        authLogger.info('useAuth', 'Parsed response (cookie-based auth)', {
          isSuccess,
          hasUser: !!user,
          needRegister,
          userEmail: user?.email,
          userRole: user?.role,
          note: 'Auth tokens handled via httpOnly cookies',
        });

        // 4. Check needRegister
        if (needRegister) {
          const email = googleUser?.email || 'email cua ban';
          authLogger.warning('useAuth', 'Account needs registration - not an admin', { email });
          return {
            success: false,
            error: `Tai khoan ${email} chua duoc cap quyen admin. Vui long lien he quan tri vien de duoc cap quyen.`,
          };
        }

        // 5. Check success and user data
        if (isSuccess && user) {
          authLogger.success('useAuth', 'User data extracted', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          });

          // 6. Check role
          const validRoles = ['super_admin', 'admin', 'editor'];
          if (!validRoles.includes(user.role)) {
            authLogger.error('useAuth', 'Invalid role', {
              userRole: user.role,
              validRoles,
            });
            return {
              success: false,
              error: 'Ban khong co quyen truy cap trang quan tri. Chi danh cho Admin va Editor.',
            };
          }

          authLogger.success('useAuth', 'Role validated', { role: user.role });

          // 7. Set auth state (cookies already set by backend)
          const adminData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as AdminRole,
            twoFactorEnabled: false,
          };

          authLogger.state('useAuth', 'Calling setAuth (cookie-based)...', {
            adminData,
          });

          // No tokens needed - backend uses httpOnly cookies
          setAuth(adminData);

          authLogger.success('useAuth', 'setAuth completed (auth via httpOnly cookies)');

          // 8. Redirect
          authLogger.info('useAuth', 'Redirecting to /dashboard...');
          navigate('/dashboard');

          authLogger.success('useAuth', 'LOGIN FLOW COMPLETED SUCCESSFULLY');
          return { success: true };
        }

        // 9. Handle failure - extract error message
        let errorMessage = 'Dang nhap that bai';
        if (response?.error) {
          errorMessage =
            typeof response.error === 'string'
              ? response.error
              : response.error.message || errorMessage;
        } else if (response?.message) {
          errorMessage = response.message;
        }

        authLogger.error('useAuth', 'Login failed - no valid user data', {
          isSuccess,
          hasUser: !!user,
          errorMessage,
          responseKeys: response ? Object.keys(response) : [],
        });

        return {
          success: false,
          error: errorMessage,
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        authLogger.error(
          'useAuth',
          'LOGIN FLOW EXCEPTION',
          {
            message: err?.message,
            name: err?.name,
            response: err?.response?.data,
            status: err?.response?.status,
            stack: err?.stack,
          },
          err instanceof Error ? err : undefined,
        );

        return {
          success: false,
          error: err?.response?.data?.error || err?.message || 'Co loi xay ra',
        };
      }
    },
    [setAuth, navigate],
  );

  const verify2FA = useCallback(async (_token: string) => {
    authLogger.info('useAuth', '2FA verification called (not supported)');
    return {
      success: false,
      error: 'Xac thuc 2 lop chua duoc ho tro',
    };
  }, []);

  const logout = useCallback(async () => {
    authLogger.info('useAuth', 'Logout started');

    try {
      await legacyApi.auth.logout();
      authLogger.success('useAuth', 'Backend logout successful');
    } catch (error) {
      authLogger.error('useAuth', 'Backend logout failed', error);
    }

    storeLogout();
    authLogger.success('useAuth', 'Local state cleared');
    navigate('/login');
  }, [storeLogout, navigate]);

  return {
    admin,
    isAuthenticated,
    isLoading,
    requires2FA,
    loginWithGoogle,
    verify2FA,
    logout,
  };
}
