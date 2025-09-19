'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Task } from './TaskCard';

interface Driver {
  uid: string;
  email: string;
}

interface TaskListProps {
  tasks: Task[];
  drivers: Driver[];
  loading?: boolean;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-600',
  high: 'bg-red-100 text-red-600',
};

const priorityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

const TaskList: React.FC<TaskListProps> = ({ tasks, drivers, loading = false, onTaskUpdate }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'status'>('created');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 1) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 1);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры и сортировка */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Все', count: tasks.length },
            { key: 'pending', label: 'Ожидают', count: tasks.filter(t => t.status === 'pending').length },
            { key: 'in_progress', label: 'В работе', count: tasks.filter(t => t.status === 'in_progress').length },
            { key: 'completed', label: 'Завершено', count: tasks.filter(t => t.status === 'completed').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created">По дате создания</option>
          <option value="priority">По приоритету</option>
          <option value="status">По статусу</option>
        </select>
      </div>

      {/* Список задач */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            {filter === 'all' ? 'Задач пока нет' : `Нет задач со статусом "${filter}"`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'all' ? 'Создайте первую задачу для начала работы' : 'Попробуйте изменить фильтр'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const driver = drivers.find(d => d.uid === task.assignedTo);
            
            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h3>
                        {task.priority && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                            {priorityLabels[task.priority as keyof typeof priorityLabels]}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{driver?.email || 'Неизвестно'}</span>
                        </div>
                        
                        {task.createdAt && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{new Date(task.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <StatusBadge
                        status={task.status === 'completed' ? 'Завершено' : task.status === 'in_progress' ? 'В работе' : 'Ожидает'}
                        variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'warning'}
                      />
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Прогресс-бар для задач в работе */}
                  {task.status === 'in_progress' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Прогресс выполнения</span>
                        <span className="text-sm font-medium text-gray-900">65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;