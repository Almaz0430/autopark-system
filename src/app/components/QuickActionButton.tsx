'use client';

interface QuickActionButtonProps {
  icon: string;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

const colorClasses = {
  blue: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
  green: 'bg-green-100 hover:bg-green-200 text-green-800',
  purple: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
  yellow: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
};

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, title, description, color }) => {
  return (
    <button className={`w-full text-left p-4 rounded-lg transition-colors flex items-start gap-4 ${colorClasses[color]}`}>
      <div className="text-xl p-2 bg-white/50 rounded-full">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </button>
  );
};

export default QuickActionButton;
