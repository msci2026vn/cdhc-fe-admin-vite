

import { Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { authLogger } from '@/lib/auth-logger';

function LoginContent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authLogger.info('LoginPage', 'Page mounted', {
      pathname: window.location.pathname,
      href: window.location.href,
      origin: window.location.origin,
    });

    // Check localStorage
    try {
      const stored = localStorage.getItem('admin-auth-storage');
      authLogger.info('LoginPage', 'LocalStorage check', {
        hasStoredAuth: !!stored,
        storedData: stored ? JSON.parse(stored) : null,
      });
    } catch (e) {
      authLogger.error('LoginPage', 'LocalStorage read failed', e);
    }

    return () => {
      authLogger.info('LoginPage', 'Page unmounting');
    };
  }, []);

  useEffect(() => {
    authLogger.info('LoginPage', 'isAuthenticated changed', { isAuthenticated });

    if (isAuthenticated) {
      authLogger.info('LoginPage', 'Already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    authLogger.success('LoginPage', 'Google OAuth callback received', {
      hasCredential: !!credentialResponse.credential,
      credentialLength: credentialResponse.credential?.length,
    });

    if (!credentialResponse.credential) {
      authLogger.error('LoginPage', 'No credential in Google response');
      setError('Khong nhan duoc thong tin dang nhap tu Google');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      authLogger.info('LoginPage', 'Calling loginWithGoogle...');
      const result = await loginWithGoogle(credentialResponse.credential);

      authLogger.info('LoginPage', 'loginWithGoogle returned', {
        result,
        success: result?.success,
        error: result?.error,
      });

      if (!result.success) {
        authLogger.error('LoginPage', 'Login failed', { error: result.error });
        setError(result.error || 'Dang nhap that bai');
      } else {
        authLogger.success('LoginPage', 'Login successful, should redirect...');
      }
    } catch (err) {
      authLogger.error('LoginPage', 'Exception in handleGoogleSuccess', {
        error: err,
        message: err instanceof Error ? err.message : String(err),
      });
      console.error('Login error:', err);
      setError('Co loi xay ra khi ket noi server. Vui long thu lai.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    authLogger.error('LoginPage', 'Google OAuth error callback');
    setError('Dang nhap Google that bai. Vui long thu lai.');
  };

  const handleBeforeLogin = () => {
    authLogger.info('LoginPage', 'Google login button clicked');
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center space-y-4">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lai trang chu
        </Link>
        <div className="mx-auto h-16 w-16 rounded-2xl bg-green-600 flex items-center justify-center">
          <Leaf className="h-8 w-8 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">CDHC Admin</CardTitle>
          <CardDescription className="text-base mt-2">
            Dang nhap de quan ly he thong Con Duong Huu Co
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
            <p className="text-sm text-gray-500">Dang xu ly dang nhap...</p>
          </div>
        ) : (
          <div className="flex justify-center" onClick={handleBeforeLogin}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              type="standard"
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width={350}
              ux_mode="popup"
            />
          </div>
        )}

        {/* Debug Panel */}
        <div className="fixed bottom-4 right-4 bg-black/90 text-green-400 p-4 rounded-lg text-xs z-50 font-mono max-w-xs">
          <div className="mb-3 font-bold text-white">Auth Logger</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => authLogger.export()}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700"
            >
              Export
            </button>
            <button
              onClick={() => authLogger.summary()}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700"
            >
              Summary
            </button>
            <button
              onClick={() => authLogger.clear()}
              className="bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700"
            >
              Clear
            </button>
            <button
              onClick={() => {
                const logs = authLogger.getLogs();
                console.log('All logs:', logs);
                alert(`Total logs: ${logs.length}\nErrors: ${logs.filter(l => l.level === 'error').length}`);
              }}
              className="bg-yellow-600 text-black px-3 py-1.5 rounded text-xs hover:bg-yellow-700"
            >
              Count
            </button>
          </div>
          <div className="mt-2 text-gray-400 text-[10px]">
            Open Console (F12) to see logs
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Chi danh cho Admin va Editor cua CDHC
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-center text-gray-400">
            Bang viec dang nhap, ban dong y voi{' '}
            <a href="#" className="text-green-600 hover:underline">
              Dieu khoan su dung
            </a>{' '}
            va{' '}
            <a href="#" className="text-green-600 hover:underline">
              Chinh sach bao mat
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginLoading() {
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-green-600 flex items-center justify-center">
          <Leaf className="h-8 w-8 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">CDHC Admin</CardTitle>
          <CardDescription className="text-base mt-2">
            Dang tai...
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Suspense fallback={<LoginLoading />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
