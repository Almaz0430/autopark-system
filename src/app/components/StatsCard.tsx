'use client';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon, 
  color = 'blue' 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  return (
    <div className="card card-hover p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${trendColors[trend]}`}>
                {trend === 'up' && '↗'} {trend === 'down' && '↘'} {change}
              </span>
              <span className="text-xs text-slate-500">за неделю</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}