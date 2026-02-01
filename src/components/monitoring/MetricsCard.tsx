

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  color?: 'green' | 'red' | 'orange' | 'blue' | 'gray';
  className?: string;
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend: _trend,
  color = 'blue',
  className,
}: MetricsCardProps) {
  // _trend is reserved for future use (trend indicator)
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50',
    blue: 'text-blue-600 bg-blue-50',
    gray: 'text-gray-600 bg-gray-50',
  };

  const valueColors = {
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-500',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueColors[color])}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
