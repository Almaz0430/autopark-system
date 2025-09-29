'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import LocationTracker from './LocationTracker';
import TaskCard, { Task } from '../components/TaskCard';
import DriverTaskCard from './DriverTaskCard';
import DriverAchievements from './DriverAchievements';
import ActivityFeed from './ActivityFeed';
import WeatherWidget from './WeatherWidget';
import TaskProgress from './TaskProgress';
import MetricCard from '../components/MetricCard';
import { updateTaskStatus } from '../actions';
import { 
  FaTruck, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheckCircle, 
  FaBell, 
  FaRoute,
  FaStar,
  FaGasPump,
  FaTachometerAlt,
  FaAward,
  FaComments
} from 'react-icons/fa';

export default function DriverPage() {
  const { t } = useLanguage();
  const { auth, firestore } = useFirebase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Новая задача назначена', time: '5 мин назад', type: 'info' },
    { id: 2, message: 'Маршрут обновлен', time: '15 мин назад', type: 'success' }
  ]);
  const [driverStats, setDriverStats] = useState({
    totalDistance: 245,
    workingHours: 8.5,
    rating: 4.8,
    completedToday: 3,
    fuelEfficiency: 12.5
  });

  useEffect(() => {
    if (!auth?.currentUser) {
        // Если пользователя нет, но мы все еще пытаемся загрузить, останавливаем загрузку
        if(loading) setLoading(false);
        return;
    }

    setLoading(true);
    const uid = auth.currentUser.uid;
    const q = query(collection(firestore, 'tasks'), where('assignedTo', '==', uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      // Сортируем задачи: сначала активные, потом остальные
      tasksData.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return 0;
      });
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, loading]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTaskStatus(taskId, newStatus);
    // Локальное обновление для мгновенного отклика UI
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const TasksSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white shadow-lg rounded-xl p-6 border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок с профилем водителя */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('pages.driver.title')}</h1>
            <p className="text-lg text-gray-600">{t('pages.driver.subtitle')}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{t('driver.welcome')}, {auth?.currentUser?.email?.split('@')[0]}</span>
              <div className="flex items-center gap-1">
                <FaStar className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{driverStats.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaAward className="w-4 h-4 text-blue-500" />
                <span>{t('driver.level')}: {t('driver.pro')}</span>
              </div>
              {tracking && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">{t('driver.onShift')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 ${
                  tracking 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
                onClick={() => setTracking(t => !t)}
            >
                {tracking ? (
                  <FaClock className="w-5 h-5" />
                ) : (
                  <FaRoute className="w-5 h-5" />
                )}
                {tracking ? t('driver.endShift') : t('driver.startShift')}
            </button>
            
            <button className="relative p-3 bg-white text-gray-600 hover:text-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <FaBell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Метрики водителя */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <MetricCard
            title={t('driver.distanceToday')}
            value={`${driverStats.totalDistance} км`}
            icon={<FaRoute className="w-5 h-5" />}
            color="blue"
            description={t('driver.totalDistance')}
          />
          <MetricCard
            title={t('driver.workingTime')}
            value={`${driverStats.workingHours} ч`}
            icon={<FaClock className="w-5 h-5" />}
            color="purple"
            description={t('driver.activeWorkTime')}
          />
          <MetricCard
            title={t('driver.completedTasks')}
            value={driverStats.completedToday}
            icon={<FaCheckCircle className="w-5 h-5" />}
            color="green"
            description={t('driver.completedToday')}
          />
          <MetricCard
            title={t('driver.fuelConsumption')}
            value={`${driverStats.fuelEfficiency} л/100км`}
            icon={<FaGasPump className="w-5 h-5" />}
            color="orange"
            description={t('driver.avgConsumption')}
          />
          <MetricCard
            title={t('driver.rating')}
            value={driverStats.rating}
            icon={<FaStar className="w-5 h-5" />}
            color="red"
            description={t('driver.clientRating')}
          />
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Левая колонка - Задачи */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{t('driver.activeTasks')}</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-700 font-medium">
                        {tasks.filter(t => t.status === 'in_progress').length} {t('driver.inProgress')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-700 font-medium">
                        {tasks.filter(t => t.status === 'pending').length} {t('driver.pending')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <TasksSkeleton />
                ) : tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <div key={task.id} className="transform hover:scale-[1.01] transition-transform duration-200">
                        <DriverTaskCard 
                          task={task} 
                          onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <FaTruck className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('driver.noAssignedTasks')}</h3>
                    <p className="text-gray-600">{t('driver.noTasksMessage')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Карта и отслеживание */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{t('driver.routeTracking')}</h2>
                      <p className="text-sm text-gray-600">
                        {tracking ? t('driver.activeTracking') : t('driver.trackingPaused')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-600">
                      {tracking ? t('driver.online') : t('driver.offline')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 min-h-[300px] flex items-center justify-center">
                  <LocationTracker active={tracking} routeId={auth?.currentUser?.uid || null} />
                </div>
              </div>
            </div>

            {/* Активность */}
            <ActivityFeed />
          </div>

          {/* Правая колонка - Боковая панель */}
          <div className="lg:col-span-2 space-y-6">
            {/* Уведомления */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('driver.notifications')}</h3>
                <FaBell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('driver.quickActions')}</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaComments className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Чат с диспетчером</p>
                    <p className="text-xs text-gray-500">Связаться с офисом</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <FaMapMarkerAlt className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Экстренная помощь</p>
                    <p className="text-xs text-gray-500">Вызвать службу поддержки</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FaTachometerAlt className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Отчет о поездке</p>
                    <p className="text-xs text-gray-500">Просмотр статистики</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Прогресс задач */}
            <TaskProgress tasks={tasks} />
            
            {/* Достижения */}
            <DriverAchievements />
            
            {/* Погода */}
            <WeatherWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
