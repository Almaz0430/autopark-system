'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  description?: string;
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

const trendClasses = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-gray-400',
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  color = 'blue',
  description
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl ${colorClasses[color]} text-white shadow-lg`}>
            {icon}
          </div>
        </div>
        
        {change && (
          <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
            <div className={`flex items-center text-sm font-medium ${trendClasses[trend]}`}>
              {trend === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change}
            </div>
            <span className="text-xs text-gray-500 ml-2">за последний месяц</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;