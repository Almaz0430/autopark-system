
'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, toggleUserStatus } from '../../actions';
import { useFirebase } from '../../FirebaseProvider';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { FaUserShield, FaUser, FaUserClock, FaToggleOn, FaToggleOff, FaSpinner } from 'react-icons/fa';
import { GeminiQuery } from '../../components/GeminiQuery'; // Импортируем новый компонент

// Определяем типы данных, которые мы ожидаем от server action
type User = {
    uid: string;
    email?: string;
    role: string;
    disabled: boolean;
    lastSignInTime?: string;
};

type ActivityLog = {
    id: string;
    user: string;
    action: string;
    status: string;
    timestamp: Timestamp;
};

export default function AdminDashboard() {
    const { firestore } = useFirebase();
    const [users, setUsers] = useState<User[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Загрузка данных ---
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.users || []);
            } else {
                setError(result.error || 'Не удалось загрузить пользователей.');
            }
        } catch (err) {
            setError('Произошла критическая ошибка при загрузке пользователей.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();

        // Подписка на логи активности
        const q = query(collection(firestore, 'activity_log'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
            setActivityLogs(logs);
        });

        return () => unsubscribe();
    }, [firestore]);

    // --- Обработчики действий ---
    const handleRoleChange = async (uid: string, newRole: string) => {
        await updateUserRole(uid, newRole);
        fetchUsers(); // Обновляем список пользователей
    };

    const handleStatusToggle = async (uid: string, currentStatus: boolean) => {
        await toggleUserStatus(uid, !currentStatus);
        fetchUsers(); // Обновляем список пользователей
    };
    
    const RoleIcon = ({ role }: { role: string }) => {
        switch (role) {
            case 'admin': return <FaUserShield className="text-red-500" title="Администратор" />;
            case 'dispatcher': return <FaUserClock className="text-blue-500" title="Диспетчер" />;
            case 'driver': return <FaUser className="text-green-500" title="Водитель" />;
            default: return <FaUser className="text-gray-400" title="Нет роли" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Заголовок */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Панель администратора</h1>
                <p className="text-slate-600 mt-2">Управление пользователями и мониторинг системы</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Управление пользователями */}
                <div className="lg:col-span-2">
                    <div className="card p-0 overflow-hidden">
                        <div className="p-6">
                           <h2 className="text-xl font-semibold text-slate-900">Управление пользователями</h2>
                        </div>
                        {loading ? (
                             <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-blue-500"/></div>
                        ) : (
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Пользователь</th>
                                        <th scope="col" className="px-6 py-3">Роль</th>
                                        <th scope="col" className="px-6 py-3">Статус</th>
                                        <th scope="col" className="px-6 py-3">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.uid} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <RoleIcon role={user.role} />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select value={user.role} onChange={(e) => handleRoleChange(user.uid, e.target.value)} className="input py-1 text-xs">
                                                    <option value="admin">Админ</option>
                                                    <option value="dispatcher">Диспетчер</option>
                                                    <option value="driver">Водитель</option>
                                                    <option value="no-role">Нет роли</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {user.disabled ? 'Заблокирован' : 'Активен'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleStatusToggle(user.uid, user.disabled)} className="text-xl">
                                                    {user.disabled ? <FaToggleOff className='text-slate-400'/> : <FaToggleOn className='text-green-500'/>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Лента активности */}
                <div className="lg:col-span-1">
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Последние действия</h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {activityLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-3">
                                     <div className={`mt-1 w-2.5 h-2.5 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-sm text-slate-700">{log.action}</p>
                                        <p className="text-xs text-slate-500">{log.user} - {log.timestamp?.toDate().toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
             {/* Секция для Gemini Query */}
             <div className="mt-8">
                <GeminiQuery />
            </div>
        </div>
    );
}
