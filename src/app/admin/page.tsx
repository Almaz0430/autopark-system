'use client';

import { useState, useEffect } from 'react';
import { firestore } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import MetricCard from '../components/MetricCard';
import ActionCard from '../components/ActionCard';
import ActivityFeed from '../components/ActivityFeed';
import RealTimeChart from '../components/RealTimeChart';

// Определяем тип для записей активности
interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: unknown; // Firestore Timestamp
  status: 'success' | 'info' | 'warning' | 'danger';
  details?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export default function AdminPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'vehicle' | 'report' | 'settings'>('user');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: '1', email: 'driver@example.com', role: 'driver', status: 'active', lastLogin: '2025-09-29 10:30' },
    { id: '2', email: 'dispatcher@example.com', role: 'dispatcher', status: 'active', lastLogin: '2025-09-29 09:15' },
    { id: '3', email: 'admin@example.com', role: 'admin', status: 'active', lastLogin: '2025-09-29 11:45' },
  ]);
  const [newUser, setNewUser] = useState({ email: '', role: 'driver', password: '' });
  const [systemStats, setSystemStats] = useState({
    totalUsers: 24,
    activeRoutes: 18,
    completedTrips: 156,
    avgSpeed: 65
  });

  useEffect(() => {
    const q = query(collection(firestore, 'activity_log'), orderBy('timestamp', 'desc'), limit(10));
    
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

    return () => unsubscribe();
  }, []);

  // Функция для показа уведомлений
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Функция для добавления пользователя
  const handleAddUser = () => {
    if (!newUser.email || !newUser.password) {
      showNotification('Заполните все поля', 'error');
      return;
    }
    
    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: 'Никогда'
    };
    
    setUsers([...users, user]);
    setNewUser({ email: '', role: 'driver', password: '' });
    setShowModal(false);
    showNotification('Пользователь успешно добавлен', 'success');
    
    // Обновляем статистику
    setSystemStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
  };

  // Функция для удаления пользователя
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    showNotification('Пользователь удален', 'info');
    setSystemStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
  };

  // Функция для экспорта данных
  const handleExportData = () => {
    const data = {
      users: users,
      stats: systemStats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleetly-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Данные экспортированы', 'success');
  };

  // Функция для открытия модального окна
  const openModal = (type: 'user' | 'vehicle' | 'report' | 'settings') => {
    setModalType(type);
    setShowModal(true);
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: '📊' },
    { id: 'users', name: 'Пользователи', icon: '👥' },
    { id: 'fleet', name: 'Автопарк', icon: '🚛' },
    { id: 'reports', name: 'Отчеты', icon: '📈' },
    { id: 'settings', name: 'Настройки', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Панель администратора</h1>
            <p className="text-lg text-gray-600">Полный контроль над системой управления автопарком</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Экспорт данных
            </button>
            <button 
              onClick={() => openModal('user')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить пользователя
            </button>
          </div>
        </div>

        {/* Навигационные вкладки */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Контент вкладки "Обзор" */}
        {activeTab === 'overview' && (
          <>
            {/* Метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Всего пользователей"
                value={systemStats.totalUsers.toString()}
                change="+2"
                trend="up"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                color="blue"
                description="Активных пользователей"
              />
              <MetricCard
                title="Активных маршрутов"
                value={systemStats.activeRoutes.toString()}
                change="+5"
                trend="up"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
                color="green"
                description="В данный момент"
              />
              <MetricCard
                title="Завершенных рейсов"
                value={systemStats.completedTrips.toString()}
                change="+12"
                trend="up"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                color="purple"
                description="За этот месяц"
              />
              <MetricCard
                title="Средняя скорость"
                value={`${systemStats.avgSpeed} км/ч`}
                change="-3"
                trend="down"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                color="orange"
                description="По автопарку"
              />
            </div>

            {/* Аналитика */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <RealTimeChart title="Активность водителей" color="blue" />
              <RealTimeChart title="Загрузка системы" color="green" />
            </div>

            {/* Основной контент */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Активность */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Журнал активности</h2>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                        Показать все
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <ActivityFeed activities={activities} loading={loading} />
                  </div>
                </div>
              </div>

              {/* Боковая панель */}
              <div className="space-y-6">
                {/* Быстрые действия */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Быстрые действия</h3>
                  <div className="space-y-4">
                    <button onClick={() => setActiveTab('users')} className="w-full">
                      <ActionCard
                        title="Управление пользователями"
                        description="Добавить, редактировать или удалить пользователей"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
                        color="blue"
                      />
                    </button>
                    <button onClick={() => openModal('vehicle')} className="w-full">
                      <ActionCard
                        title="Добавить транспорт"
                        description="Зарегистрировать новое транспортное средство"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                        color="green"
                      />
                    </button>
                    <button onClick={() => openModal('report')} className="w-full">
                      <ActionCard
                        title="Создать отчет"
                        description="Сформировать отчет по работе автопарка"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                        color="purple"
                      />
                    </button>
                    <button onClick={() => openModal('settings')} className="w-full">
                      <ActionCard
                        title="Настройки системы"
                        description="Конфигурация и параметры системы"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        color="orange"
                      />
                    </button>
                  </div>
                </div>

                {/* Системная информация */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Системная информация</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">Версия системы</span>
                      </div>
                      <span className="font-semibold text-gray-900">v1.2</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">Последнее обновление</span>
                      </div>
                      <span className="font-semibold text-gray-900">29.09.2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Вкладка "Пользователи" */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Управление пользователями</h2>
                <button 
                  onClick={() => openModal('user')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Добавить пользователя
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Последний вход</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'dispatcher' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status === 'active' ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Заглушки для других вкладок */}
        {activeTab !== 'overview' && activeTab !== 'users' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            <p className="text-gray-600">Эта секция находится в разработке</p>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === 'user' && 'Добавить пользователя'}
                {modalType === 'vehicle' && 'Добавить транспорт'}
                {modalType === 'report' && 'Создать отчет'}
                {modalType === 'settings' && 'Настройки системы'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalType === 'user' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="driver">Водитель</option>
                    <option value="dispatcher">Диспетчер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {modalType === 'vehicle' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <p className="text-gray-600">Функция добавления транспорта будет доступна в следующем обновлении</p>
              </div>
            )}

            {modalType === 'report' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-600">Система отчетов находится в разработке</p>
              </div>
            )}

            {modalType === 'settings' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">Настройки системы будут доступны в административной панели</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Уведомления */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {notification.type === 'success' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                )}
                {notification.type === 'error' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
                {notification.type === 'info' && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>{notification.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
