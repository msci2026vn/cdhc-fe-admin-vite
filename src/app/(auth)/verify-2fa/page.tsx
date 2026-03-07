import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

export default function Verify2FAPage() {
  const navigate = useNavigate();
  const { admin, requires2FA, isAuthenticated } = useAuthStore();
  const { verify2FA } = useAuth();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect nếu đã đăng nhập hoặc không cần 2FA
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (!requires2FA) {
      navigate('/login');
    }
  }, [isAuthenticated, requires2FA, navigate]);

  // Focus vào input khi trang load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (token.length !== 6) {
      setError('Vui long nhap ma 6 chu so');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verify2FA(token);

      if (!result.success) {
        setError(result.error || 'Ma xac thuc khong dung');
        setToken('');
        inputRef.current?.focus();
      }
      // Nếu thành công, useAuth sẽ tự redirect
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      setToken('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép nhập số, tối đa 6 ký tự
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
    setError('');
  };

  // Không hiển thị nếu không có admin hoặc không cần 2FA
  if (!admin || !requires2FA) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại đăng nhập
          </Link>
          <div className="mx-auto h-16 w-16 rounded-2xl bg-green-600 flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Xác thực 2 lớp</CardTitle>
            <CardDescription className="text-base mt-2">
              Nhập mã 6 chữ số từ ứng dụng xác thực của bạn
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thông tin email đang đăng nhập */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Đăng nhập với</p>
            <p className="font-medium text-gray-900">{sessionStorage.getItem('pending2FAMail')}</p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={token}
                onChange={handleTokenChange}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                disabled={isLoading}
                autoComplete="one-time-code"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || token.length !== 6}
              className="w-full h-12 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Dang xac thuc...
                </div>
              ) : (
                'Xac thuc'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Mo ung dung Google Authenticator hoac Authy de lay ma
            </p>
            <p className="text-xs text-gray-400">Ma se het han sau 30 giay</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-center text-gray-400">
              Không thể truy cập ứng dụng xác thực?{' '}
              <button type="button" className="text-green-600 hover:underline">
                Lien he ho tro
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
