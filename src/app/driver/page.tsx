'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import LocationTracker from './LocationTracker';
import TaskCard, { Task } from '../components/TaskCard';
import { updateTaskStatus } from '../actions';
import { FaSpinner } from 'react-icons/fa';

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
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Панель водителя</h1>
          <p className="text-slate-600 mt-2">Ваши текущие задачи и отслеживание</p>
        </div>
        <button 
            className={`btn ${tracking ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setTracking(t => !t)}
        >
            {tracking ? 'Завершить смену' : 'Начать смену'}
        </button>
      </div>

      {/* Секция задач */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Активные задачи</h2>
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
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <h3 className="text-lg font-medium text-slate-800">Нет назначенных задач</h3>
            <p className="text-slate-500 mt-2">Отдыхайте! Как только появится новая задача, вы увидите ее здесь.</p>
          </div>
        )}
      </div>

      {/* Нижняя секция */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Отслеживание местоположения</h2>
            <LocationTracker active={tracking} routeId={auth?.currentUser?.uid || null} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Статистика за день</h2>
          <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Выполнено задач</span><span className="text-lg font-semibold text-slate-900">{tasks.filter(t => t.status === 'completed').length}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Пройдено км</span><span className="text-lg font-semibold text-slate-900">-</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Время в пути</span><span className="text-lg font-semibold text-slate-900">-</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
