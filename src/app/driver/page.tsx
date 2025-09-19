'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import LocationTracker from './LocationTracker';
import TaskCard, { Task } from '../components/TaskCard';
import { updateTaskStatus } from '../actions';

export default function DriverPage() {
  const { auth, firestore } = useFirebase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);

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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Панель водителя</h1>
            <p className="text-lg text-gray-600">Ваши текущие задачи и отслеживание маршрута</p>
          </div>
          <button 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
                tracking 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={() => setTracking(t => !t)}
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {tracking ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {tracking ? 'Завершить смену' : 'Начать смену'}
          </button>
        </div>

        {/* Секция задач */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Активные задачи</h2>
        {loading ? (
          <TasksSkeleton />
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)} 
              />
            ))}
          </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет назначенных задач</h3>
              <p className="text-gray-600">Отдыхайте! Как только появится новая задача, вы увидите ее здесь.</p>
            </div>
          )}
        </div>

        {/* Нижняя секция */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Отслеживание местоположения</h2>
              <LocationTracker active={tracking} routeId={auth?.currentUser?.uid || null} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Статистика за день</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Выполнено задач</span>
                  <span className="text-lg font-bold text-gray-900">{tasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Пройдено км</span>
                  <span className="text-lg font-bold text-gray-900">-</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Время в пути</span>
                  <span className="text-lg font-bold text-gray-900">-</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
