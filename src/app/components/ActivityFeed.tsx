'use client';

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: unknown;
  status: 'success' | 'info' | 'warning' | 'danger';
  details?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const statusConfig = {
  success: {
    color: 'bg-green-100 text-green-600',
    dot: 'bg-green-500',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )
  },
  info: {
    color: 'bg-blue-100 text-blue-600',
    dot: 'bg-blue-500',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  },
  warning: {
    color: 'bg-yellow-100 text-yellow-600',
    dot: 'bg-yellow-500',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  },
  danger: {
    color: 'bg-red-100 text-red-600',
    dot: 'bg-red-500',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }
};

const formatTime = (timestamp: unknown) => {
  if (!timestamp) return 'только что';
  // Проверяем, что timestamp имеет метод toDate (Firestore Timestamp)
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    const date = (timestamp as { toDate: () => Date }).toDate();
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    if (diffSeconds < 60) return `${diffSeconds} сек назад`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    return date.toLocaleDateString();
  }
  return 'неизвестно';
};

const ActivitySkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
          <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-16 h-3 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
  if (loading) {
    return <ActivitySkeleton />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Пока нет активности</p>
        <p className="text-sm text-gray-400 mt-1">Активность будет отображаться здесь</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const config = statusConfig[activity.status];
        return (
          <div 
            key={activity.id} 
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
                {config.icon}
              </div>
              {index < activities.length - 1 && (
                <div className="absolute top-8 left-1/2 w-px h-8 bg-gray-200 transform -translate-x-1/2"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900 text-sm">{activity.user}</p>
                <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{activity.action}</p>
              {activity.details && (
                <p className="text-xs text-gray-500">{activity.details}</p>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;