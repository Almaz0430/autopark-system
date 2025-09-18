'use client';

interface QuickActionButtonProps {
  icon: string;
  title: string;
  description?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export default function QuickActionButton({ 
  icon, 
  title, 
  description, 
  onClick,
  variant = 'secondary',
  color = 'blue'
}: QuickActionButtonProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  const buttonClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  return (
    <button 
      onClick={onClick}
      className={`w-full ${buttonClass} text-left flex items-center gap-3 p-4`}
    >
      <span className={`text-xl ${colorClasses[color]}`}>{icon}</span>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}