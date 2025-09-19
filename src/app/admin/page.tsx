'use client';

import { useState, useEffect } from 'react';
import { firestore } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import StatsCard from '../components/StatsCard';
import QuickActionButton from '../components/QuickActionButton';
import StatusBadge from '../components/StatusBadge';

// Определяем тип для записей активности
interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: any; // Firestore Timestamp
  status: 'success' | 'info' | 'warning' | 'danger';
}

export default function AdminPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(firestore, 'activity_log'), orderBy('timestamp', 'desc'), limit(5));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activitiesData: Activity[] = [];
      querySnapshot.forEach((doc) => {
        activitiesData.push({ id: doc.id, ...doc.data() } as Activity);
      });
      setActivities(activitiesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activities: ", error);
      setLoading(false);
    });

    // Отписываемся при размонтировании компонента
    return () => unsubscribe();
  }, []);

  // Функция для форматирования времени
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'только что';
    const date = timestamp.toDate();
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} сек назад`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    return date.toLocaleDateString();
  };

  // Данные для стат. карточек (пока оставляем статичными)
  const stats = [
    { title: 'Всего водителей', value: '24', change: '+2', trend: 'up' as const, icon: '👥', color: 'blue' as const },
    { title: 'Активных маршрутов', value: '18', change: '+5', trend: 'up' as const, icon: '🚛', color: 'green' as const },
    { title: 'Завершенных рейсов', value: '156', change: '+12', trend: 'up' as const, icon: '✅', color: 'purple' as const },
    { title: 'Средняя скорость', value: '65 км/ч', change: '-3', trend: 'down' as const, icon: '⚡', color: 'yellow' as const },
  ];

  const ActivitySkeleton = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 animate-pulse">
          <div className="w-3 h-3 rounded-full bg-slate-200"></div>
          <div className="flex-1 space-y-2">
            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
          </div>
          <div className="w-1/6 h-4 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Панель администратора</h1>
          <p className="text-slate-600 mt-2">Управляйте автопарком, пользователями и системными настройками</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Добавить водителя
        </button>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <StatsCard key={index} {...stat} />)}
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Активность */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Последняя активность</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Показать все</button>
            </div>
            {loading ? (
              <ActivitySkeleton />
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <StatusBadge 
                      status=""
                      variant={activity.status}
                      size="sm"
                      showDot={true}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                      <p className="text-sm text-slate-600">{activity.action}</p>
                    </div>
                    <span className="text-xs text-slate-500">{formatTime(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">Пока нет активности для отображения.</p>
              </div>
            )}
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Быстрые действия</h2>
            <div className="space-y-3">
              <QuickActionButton icon="👤" title="Управление пользователями" description="Добавить, редактировать или удалить пользователей" color="blue" />
              <QuickActionButton icon="🚛" title="Добавить транспорт" description="Зарегистрировать новое транспортное средство" color="green" />
              <QuickActionButton icon="📊" title="Создать отчет" description="Сформировать отчет по работе автопарка" color="purple" />
              <QuickActionButton icon="⚙️" title="Настройки системы" description="Конфигурация и параметры системы" color="yellow" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Системная информация</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Версия системы:</span><span className="font-medium">v2.1.0</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Последнее обновление:</span><span className="font-medium">15.01.2025</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Статус сервера:</span><span className="text-green-600 font-medium">Онлайн</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
