

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Leaf, Users, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, admin } = useAuthStore();

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển đến dashboard
    if (isAuthenticated && admin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, admin, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Quản lý thành viên',
      description: 'Quản lý hơn 10 loại vai trò: Nhà nông, Cộng đồng, Doanh nghiệp, HTX, Cửa hàng, Chuyên gia, KOL, KOC...',
    },
    {
      icon: BarChart3,
      title: 'Thống kê chi tiết',
      description: 'Theo dõi số liệu đăng ký, phân bố vai trò, thống kê online theo thời gian thực.',
    },
    {
      icon: Shield,
      title: 'Phân quyền linh hoạt',
      description: 'Hệ thống phân quyền Super Admin, Admin, Editor với các chức năng khác nhau.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-green-800">CDHC Admin</h1>
              <p className="text-xs text-gray-500">Con Đường Hữu Cơ</p>
            </div>
          </div>
          <Link to="/login">
            <Button>
              Đăng nhập
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">
            <Leaf className="h-4 w-4" />
            Hệ thống quản lý thành viên
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Trang quản trị
            <span className="text-green-600"> Con Đường Hữu Cơ</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Hệ thống quản lý thành viên, theo dõi hoạt động, thống kê và gửi thông báo
            cho cộng đồng nông nghiệp hữu cơ Việt Nam.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Đăng nhập bằng Google
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tính năng chính</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hệ thống quản trị đầy đủ cho việc quản lý cộng đồng Con Đường Hữu Cơ
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Các vai trò trong hệ thống</h3>
            <p className="text-gray-500 mt-2">Hỗ trợ quản lý 11 loại vai trò khác nhau</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { name: 'Nhà nông', color: 'bg-green-100 text-green-700' },
              { name: 'Cộng đồng', color: 'bg-blue-100 text-blue-700' },
              { name: 'Doanh nghiệp', color: 'bg-purple-100 text-purple-700' },
              { name: 'Hợp tác xã', color: 'bg-orange-100 text-orange-700' },
              { name: 'Cửa hàng', color: 'bg-pink-100 text-pink-700' },
              { name: 'Chuyên gia', color: 'bg-indigo-100 text-indigo-700' },
              { name: 'KOL', color: 'bg-yellow-100 text-yellow-700' },
              { name: 'KOC', color: 'bg-teal-100 text-teal-700' },
            ].map((role, index) => (
              <div
                key={index}
                className={`${role.color} rounded-lg px-4 py-3 text-center font-medium`}
              >
                {role.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900">Con Đường Hữu Cơ</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2024 CDHC. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
