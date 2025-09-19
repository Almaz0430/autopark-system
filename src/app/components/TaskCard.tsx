'use client';

import StatusBadge from './StatusBadge';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string | number;
  assignedBy?: string;
}

interface TaskCardProps {
  task: Task;
  onStatusChange?: (newStatus: TaskStatus) => void;
}

const statusConfig = {
  pending: { variant: 'warning', label: 'Ожидает' },
  in_progress: { variant: 'info', label: 'В процессе' },
  completed: { variant: 'success', label: 'Завершено' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const config = statusConfig[task.status];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
            <StatusBadge status={config.label} variant={config.variant as 'success' | 'info' | 'warning' | 'danger'} />
          </div>
          <p className="text-slate-600 text-sm mb-4">{task.description}</p>
        </div>
        {onStatusChange && task.status !== 'completed' && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
            {task.status === 'pending' && (
              <button 
                onClick={() => onStatusChange('in_progress')}
                className="btn-primary w-full"
              >
                Начать выполнение
              </button>
            )}
            {task.status === 'in_progress' && (
              <button 
                onClick={() => onStatusChange('completed')}
                className="btn-success w-full"
              >
                Завершить задачу
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
