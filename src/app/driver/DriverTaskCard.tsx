'use client';

import { Task } from '../components/TaskCard';
import StatusBadge from '../components/StatusBadge';
import { FaClock, FaMapMarkerAlt, FaRoute, FaFlag, FaUser } from 'react-icons/fa';

interface DriverTaskCardProps {
  task: Task;
  onStatusChange?: (newStatus: Task['status']) => void;
}

const statusConfig = {
  pending: { variant: 'warning', label: 'Ожидает', color: 'yellow' },
  in_progress: { variant: 'info', label: 'В процессе', color: 'blue' },
  completed: { variant: 'success', label: 'Завершено', color: 'green' },
};

const priorityConfig = {
  low: { color: 'text-green-600', bg: 'bg-green-100', label: 'Низкий' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Средний' },
  high: { color: 'text-red-600', bg: 'bg-red-100', label: 'Высокий' },
};

const DriverTaskCard: React.FC<DriverTaskCardProps> = ({ task, onStatusChange }) => {
  const config = statusConfig[task.status];
  const priority = priorityConfig[task.priority || 'medium'];
  
  const formatTime = (timestamp: string | number) => {
    if (!timestamp) return 'Не указано';
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Заголовок с приоритетом */}
      <div className={`h-2 ${config.color === 'blue' ? 'bg-blue-500' : config.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
              {task.priority && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${priority.bg} ${priority.color}`}>
                  {priority.label}
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm mb-3">{task.description}</p>
          </div>
          <StatusBadge 
            status={config.label} 
            variant={config.variant as 'success' | 'info' | 'warning' | 'danger'} 
          />
        </div>

        {/* Детали задачи */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FaClock className="w-4 h-4" />
            <span>Создано: {formatTime(task.createdAt || Date.now())}</span>
          </div>
          
          {task.assignedBy && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaUser className="w-4 h-4" />
              <span>Назначил: {task.assignedBy}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <FaRoute className="w-4 h-4" />
            <span>Маршрут: Автоматически построен</span>
          </div>
        </div>

        {/* Действия */}
        {onStatusChange && task.status !== 'completed' && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex gap-2">
              {task.status === 'pending' && (
                <>
                  <button 
                    onClick={() => onStatusChange('in_progress')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                  >
                    <FaRoute className="w-4 h-4" />
                    Начать выполнение
                  </button>
                  <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">
                    <FaMapMarkerAlt className="w-4 h-4" />
                  </button>
                </>
              )}
              {task.status === 'in_progress' && (
                <>
                  <button 
                    onClick={() => onStatusChange('completed')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                  >
                    <FaFlag className="w-4 h-4" />
                    Завершить задачу
                  </button>
                  <button className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors">
                    <FaMapMarkerAlt className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Индикатор завершенной задачи */}
        {task.status === 'completed' && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 py-2 text-green-600">
              <FaFlag className="w-4 h-4" />
              <span className="text-sm font-medium">Задача выполнена</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTaskCard;