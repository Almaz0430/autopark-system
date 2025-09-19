'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import TaskCard, { Task } from '../components/TaskCard';
import { getDrivers, createTask } from '../actions';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import TaskList from '../components/TaskList';

interface Driver {
    uid: string;
    email: string;
}

export default function DispatcherPage() {
    const { auth, firestore } = useFirebase();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingDrivers, setLoadingDrivers] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Состояние формы
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState('medium');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Загрузка водителей
    useEffect(() => {
        async function fetchDrivers() {
            const result = await getDrivers();
            if (result.success) {
                setDrivers(result.drivers || []);
            }
            setLoadingDrivers(false);
        }
        fetchDrivers();
    }, []);

    // Загрузка задач
    useEffect(() => {
        const q = query(collection(firestore, 'tasks'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(tasksData);
            setLoadingTasks(false);
        }, (err) => {
            console.error(err);
            setLoadingTasks(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title || !description || !assignedTo) {
            setError('Все поля обязательны для заполнения.');
            return;
        }
        setError('');
        setSubmitting(true);

        const result = await createTask({
            title,
            description,
            assignedTo,
            assignedBy: auth?.currentUser?.email || 'dispatcher',
            priority,
        });

        if (result.success) {
            setTitle('');
            setDescription('');
            setAssignedTo('');
            setPriority('medium');
            setShowCreateForm(false);
        } else {
            setError(result.error || 'Произошла ошибка.');
        }
        setSubmitting(false);
    };

    // Вычисляем метрики
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const activeDrivers = drivers.length;

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Заголовок */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Панель диспетчера</h1>
                        <p className="text-lg text-gray-600">Управляйте задачами и координируйте работу водителей</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Новая задача
                    </button>
                </div>

                {/* Метрики */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <MetricCard
                        title="Всего задач"
                        value={totalTasks}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                        color="blue"
                    />
                    <MetricCard
                        title="В работе"
                        value={activeTasks}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        color="orange"
                    />
                    <MetricCard
                        title="Ожидают"
                        value={pendingTasks}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="purple"
                    />
                    <MetricCard
                        title="Завершено"
                        value={completedTasks}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="green"
                    />
                    <MetricCard
                        title="Водители"
                        value={activeDrivers}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        color="red"
                    />
                </div>

                {/* Основной контент */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Список задач */}
                    <div className="xl:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Активные задачи</h2>
                                    <div className="flex items-center gap-2">
                                        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option>Все статусы</option>
                                            <option>Ожидают</option>
                                            <option>В работе</option>
                                            <option>Завершено</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <TaskList 
                                    tasks={tasks} 
                                    drivers={drivers} 
                                    loading={loadingTasks}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Боковая панель */}
                    <div className="space-y-6">
                        {/* Быстрые действия */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Отчеты</p>
                                        <p className="text-xs text-gray-500">Просмотр статистики</p>
                                    </div>
                                </button>
                                
                                <button className="w-full flex items-center gap-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Карта</p>
                                        <p className="text-xs text-gray-500">Отслеживание водителей</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Активные водители */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Активные водители</h3>
                            {loadingDrivers ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {drivers.slice(0, 5).map(driver => (
                                        <div key={driver.uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">
                                                    {driver.email?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{driver.email}</p>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs text-gray-500">Онлайн</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Модальное окно создания задачи */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Создать новую задачу</h2>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label htmlFor="title" className="label">Название задачи</label>
                                    <input 
                                        id="title" 
                                        type="text" 
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)} 
                                        className="input" 
                                        placeholder="Доставка посылки #123" 
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="description" className="label">Описание</label>
                                    <textarea 
                                        id="description" 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        className="input" 
                                        rows={3} 
                                        placeholder="Забрать со склада А, доставить на склад Б"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="priority" className="label">Приоритет</label>
                                    <select 
                                        id="priority" 
                                        value={priority} 
                                        onChange={e => setPriority(e.target.value)} 
                                        className="input"
                                    >
                                        <option value="low">Низкий</option>
                                        <option value="medium">Средний</option>
                                        <option value="high">Высокий</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label htmlFor="driver" className="label">Назначить водителю</label>
                                    <select 
                                        id="driver" 
                                        value={assignedTo} 
                                        onChange={e => setAssignedTo(e.target.value)} 
                                        className="input" 
                                        disabled={loadingDrivers}
                                        required
                                    >
                                        <option value="" disabled>
                                            {loadingDrivers ? 'Загрузка водителей...' : 'Выберите водителя'}
                                        </option>
                                        {drivers.map(driver => (
                                            <option key={driver.uid} value={driver.uid}>{driver.email}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {submitting ? 'Создание...' : 'Создать задачу'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
