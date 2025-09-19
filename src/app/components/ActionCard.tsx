'use client';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
  badge?: string;
}

const colorClasses = {
  blue: 'bg-blue-500 hover:bg-blue-600',
  green: 'bg-green-500 hover:bg-green-600',
  purple: 'bg-purple-500 hover:bg-purple-600',
  orange: 'bg-orange-500 hover:bg-orange-600',
  red: 'bg-red-500 hover:bg-red-600',
};

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  color = 'blue',
  onClick,
  badge
}) => {
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
    >
      <div className={`absolute inset-0 ${colorClasses[color].split(' ')[0]} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      <div className="relative flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 group-hover:text-gray-500 transition-colors">
            {description}
          </p>
        </div>
        
        <svg 
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default ActionCard;