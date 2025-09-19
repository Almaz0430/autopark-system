'use client';

type Trend = 'up' | 'down';
type Color = 'blue' | 'green' | 'purple' | 'yellow';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: Trend;
  icon: string;
  color: Color;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
};

const trendClasses = {
  up: 'text-green-600',
  down: 'text-red-600',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, icon, color }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-slate-200">
      <div className="flex items-center gap-4">
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <div className="flex items-center text-sm mt-1">
            <span className={trendClasses[trend]}>{change}</span>
            <span className="text-slate-500 ml-1">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
