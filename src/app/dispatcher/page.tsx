'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import TaskCard, { Task } from '../components/TaskCard';
import { getDrivers, createTask } from '../actions';
import StatusBadge from '../components/StatusBadge';

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

    // Состояние формы
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
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
        });

        if (result.success) {
            setTitle('');
            setDescription('');
            setAssignedTo('');
        } else {
            setError(result.error || 'Произошла ошибка.');
        }
        setSubmitting(false);
    };

    return (
        <div className="space-y-8">
            {/* Заголовок */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Панель диспетчера</h1>
                <p className="text-slate-600 mt-2">Создавайте задачи и назначайте их водителям</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Форма создания задачи */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Новая задача</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="label">Название задачи</label>
                                <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Доставка посылки #123" />
                            </div>
                            <div>
                                <label htmlFor="description" className="label">Описание</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="input" rows={3} placeholder="Забрать со склада А, доставить на склад Б"></textarea>
                            </div>
                            <div>
                                <label htmlFor="driver" className="label">Назначить водителю</label>
                                <select id="driver" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="input" disabled={loadingDrivers}>
                                    <option value="" disabled>{loadingDrivers ? 'Загрузка водителей...' : 'Выберите водителя'}</option>
                                    {drivers.map(driver => (
                                        <option key={driver.uid} value={driver.uid}>{driver.email}</option>
                                    ))}
                                </select>
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <button type="submit" className="btn-primary w-full" disabled={submitting}>
                                {submitting ? 'Создание...' : 'Создать задачу'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Список задач */}
                <div className="lg:col-span-2">
                     <h2 className="text-xl font-semibold text-slate-900 mb-4">Все задачи</h2>
                     {loadingTasks ? (
                         <p>Загрузка задач...</p>
                     ) : tasks.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <div key={task.id} className="bg-white shadow rounded-lg p-4 border flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800">{task.title}</p>
                                        <p className="text-sm text-slate-500">Назначена: {drivers.find(d => d.uid === task.assignedTo)?.email || 'Неизвестно'}</p>
                                    </div>
                                    <StatusBadge status={task.status} variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'warning'} />
                                </div>
                            ))}
                        </div>
                     ) : (
                         <p>Задач пока нет.</p>
                     )}
                </div>
            </div>
        </div>
    );
}
