'use client';

interface StatusBadgeProps {
  status: string;
  variant: 'success' | 'info' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const variants = {
  success: 'bg-green-100 text-green-800',
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
};

const dotVariants = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
}

const sizes = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
    status,
    variant,
    size = 'md',
    showDot = false 
}) => {
  return (
    <span className={`inline-flex items-center gap-2 font-medium rounded-full ${sizes[size]} ${variants[variant]}`}>
      {showDot && (
        <span className={`w-2 h-2 rounded-full ${dotVariants[variant]}`}></span>
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
