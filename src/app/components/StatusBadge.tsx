'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export default function StatusBadge({ 
  status, 
  variant = 'neutral', 
  size = 'md',
  showDot = false 
}: StatusBadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
  };

  return (
    <span className={`
      inline-flex items-center gap-2 font-medium rounded-full border
      ${variants[variant]} ${sizes[size]}
    `}>
      {showDot && (
        <div className={`w-2 h-2 rounded-full ${dotColors[variant]}`}></div>
      )}
      {status}
    </span>
  );
}