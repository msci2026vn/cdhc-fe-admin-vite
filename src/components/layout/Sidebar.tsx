import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  History,
  Bell,
  Settings,
  LogOut,
  Database,
  HardDrive,
  Shield,
  AlertTriangle,
  Activity,
  Search,
  UserCheck,
  TrendingUp,
  FolderCode,
  Newspaper,
  MailCheck,
  ArrowLeftRight,
  Truck,
  Wallet,
  Swords,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    permission: 'stats.view',
  },
  {
    name: 'Quản lý thành viên',
    href: '/users',
    icon: Users,
    permission: 'users.view',
  },
  {
    name: 'Quản lý nhân viên',
    href: '/staff',
    icon: UserCog,
    permission: 'staff.manage',
    superAdminOnly: true,
  },
  {
    name: 'Database',
    href: '/dashboard/database',
    icon: Database,
    permission: 'stats.view',
  },
  {
    name: 'Backup',
    href: '/monitoring/backup',
    icon: HardDrive,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Security',
    href: '/monitoring/security',
    icon: Shield,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Alerts',
    href: '/monitoring/alerts',
    icon: AlertTriangle,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Metrics',
    href: '/monitoring/metrics',
    icon: Activity,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Query Analytics',
    href: '/monitoring/query-analytics',
    icon: Search,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Đổi Điểm',
    href: '/conversion',
    icon: ArrowLeftRight,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Khôi phục TV cũ',
    href: '/legacy-recovery',
    icon: UserCheck,
    permission: 'users.view',
    superAdminOnly: true,
  },
  {
    name: 'Top Holders',
    href: '/top-holders',
    icon: TrendingUp,
    permission: 'users.view',
    superAdminOnly: true,
  },
  {
    name: 'Khôi phục Email',
    href: '/email-changes',
    icon: MailCheck,
    permission: 'users.view',
    superAdminOnly: true,
  },
  {
    name: 'Nap AVAX',
    href: '/topup',
    icon: Wallet,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Giao hang',
    href: '/delivery',
    icon: Truck,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'World Boss',
    href: '/world-boss',
    icon: Swords,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'File Manager',
    href: '/file-manager',
    icon: FolderCode,
    permission: 'stats.view',
    superAdminOnly: true,
  },
  {
    name: 'Tin tức',
    href: '/news',
    icon: Newspaper,
    permission: 'stats.view',
  },
  {
    name: 'Danh mục tin tức',
    href: '/news/categories',
    icon: Newspaper,
    permission: 'stats.view',
  },
  {
    name: 'Lịch sử hoạt động',
    href: '/activity-logs',
    icon: History,
    permission: 'logs.view_own',
  },
  {
    name: 'Thông báo',
    href: '/notifications',
    icon: Bell,
    permission: 'notifications.send',
  },
  {
    name: 'Cài đặt',
    href: '/settings',
    icon: Settings,
    permission: 'settings.view',
  },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { canAccess, isSuperAdmin } = usePermission();

  const filteredNavigation = navigation.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin()) return false;
    return canAccess(item.permission);
  });

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CD</span>
          </div>
          <span className="text-white font-semibold text-lg">CDHC Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-400 hover:bg-gray-800 hover:text-white"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
