'use client';

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export default function ProgressBar({ 
  progress, 
  label, 
  color = 'blue', 
  size = 'md',
  showPercentage = true 
}: ProgressBarProps) {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
          {showPercentage && <span className="text-sm text-slate-900">{progress}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${sizes[size]} overflow-hidden`}>
        <div 
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}