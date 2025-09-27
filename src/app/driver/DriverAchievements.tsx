'use client';

import { FaTrophy, FaStar, FaMedal, FaFire, FaClock, FaRoute } from 'react-icons/fa';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  color: string;
}

const DriverAchievements = () => {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Первая поездка',
      description: 'Выполните свою первую задачу',
      icon: <FaStar className="w-5 h-5" />,
      earned: true,
      color: 'bg-yellow-500'
    },
    {
      id: '2',
      title: 'Скоростной водитель',
      description: 'Выполните 10 задач за день',
      icon: <FaFire className="w-5 h-5" />,
      earned: false,
      progress: 3,
      maxProgress: 10,
      color: 'bg-red-500'
    },
    {
      id: '3',
      title: 'Мастер времени',
      description: 'Выполните задачу досрочно 5 раз',
      icon: <FaClock className="w-5 h-5" />,
      earned: false,
      progress: 2,
      maxProgress: 5,
      color: 'bg-blue-500'
    },
    {
      id: '4',
      title: 'Дальнобойщик',
      description: 'Проедьте 1000 км',
      icon: <FaRoute className="w-5 h-5" />,
      earned: false,
      progress: 245,
      maxProgress: 1000,
      color: 'bg-green-500'
    },
    {
      id: '5',
      title: 'Профессионал',
      description: 'Получите рейтинг 4.8+',
      icon: <FaTrophy className="w-5 h-5" />,
      earned: true,
      color: 'bg-purple-500'
    },
    {
      id: '6',
      title: 'Надежный партнер',
      description: 'Выполните 100 задач',
      icon: <FaMedal className="w-5 h-5" />,
      earned: false,
      progress: 47,
      maxProgress: 100,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Достижения</h3>
        <div className="flex items-center gap-2">
          <FaTrophy className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">
            {achievements.filter(a => a.earned).length}/{achievements.length}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              achievement.earned 
                ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${achievement.color} ${
                achievement.earned ? 'text-white' : 'text-white opacity-50'
              }`}>
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${
                  achievement.earned ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {achievement.description}
                </p>
                
                {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{achievement.progress}</span>
                      <span>{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${achievement.color}`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {achievement.earned && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <FaStar className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverAchievements;