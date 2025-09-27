'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaRoute, FaMapMarkerAlt, FaBell } from 'react-icons/fa';

interface Activity {
  id: string;
  type: 'task_started' | 'task_completed' | 'location_update' | 'notification';
  message: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'task_completed',
      message: 'Задача "Доставка посылки #123" выполнена',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      icon: <FaCheckCircle className="w-4 h-4" />,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'location_update',
      message: 'Местоположение обновлено',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      icon: <FaMapMarkerAlt className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'task_started',
      message: 'Начато выполнение задачи "Забрать груз"',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      icon: <FaRoute className="w-4 h-4" />,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'notification',
      message: 'Новое уведомление от диспетчера',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      icon: <FaBell className="w-4 h-4" />,
      color: 'text-orange-600'
    }
  ]);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    
    return timestamp.toLocaleDateString('ru-RU');
  };

  // Симуляция добавления новых активностей
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'location_update',
        message: 'Местоположение обновлено',
        timestamp: new Date(),
        icon: <FaMapMarkerAlt className="w-4 h-4" />,
        color: 'text-blue-600'
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Оставляем только последние 10
    }, 30000); // Каждые 30 секунд

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Активность</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-3 group">
            <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors ${activity.color}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors">
                {activity.message}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <FaClock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            </div>
            {index === 0 && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          Показать всю историю
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;