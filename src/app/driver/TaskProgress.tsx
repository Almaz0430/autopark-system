'use client';

import { Task } from '../components/TaskCard';
import { FaCheckCircle, FaClock, FaHourglassHalf } from 'react-icons/fa';

interface TaskProgressProps {
  tasks: Task[];
}

const TaskProgress: React.FC<TaskProgressProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Прогресс выполнения</h3>
        <div className="text-2xl font-bold text-blue-600">
          {Math.round(completionPercentage)}%
        </div>
      </div>
      
      {/* Прогресс-бар */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Выполнено задач</span>
          <span>{completedTasks} из {totalTasks}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Статистика по статусам */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <div className="flex justify-center mb-2">
            <FaCheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-lg font-bold text-green-900">{completedTasks}</div>
          <div className="text-xs text-green-600">Завершено</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <div className="flex justify-center mb-2">
            <FaHourglassHalf className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-blue-900">{inProgressTasks}</div>
          <div className="text-xs text-blue-600">В работе</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-xl">
          <div className="flex justify-center mb-2">
            <FaClock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-lg font-bold text-yellow-900">{pendingTasks}</div>
          <div className="text-xs text-yellow-600">Ожидают</div>
        </div>
      </div>

      {/* Мотивационное сообщение */}
      {totalTasks > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="text-sm text-center">
            {completionPercentage === 100 ? (
              <span className="text-green-700 font-medium">🎉 Отличная работа! Все задачи выполнены!</span>
            ) : completionPercentage >= 75 ? (
              <span className="text-blue-700 font-medium">💪 Почти готово! Осталось совсем немного!</span>
            ) : completionPercentage >= 50 ? (
              <span className="text-purple-700 font-medium">⚡ Хорошая работа! Продолжайте в том же духе!</span>
            ) : (
              <span className="text-gray-700 font-medium">🚀 Начинаем день! Удачи в выполнении задач!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskProgress;