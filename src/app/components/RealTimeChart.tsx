'use client';

import { useState, useEffect } from 'react';

interface ChartData {
  time: string;
  value: number;
}

interface RealTimeChartProps {
  title: string;
  data?: ChartData[];
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  height?: number;
}

const colorClasses = {
  blue: 'stroke-blue-500 fill-blue-100',
  green: 'stroke-green-500 fill-green-100',
  purple: 'stroke-purple-500 fill-purple-100',
  orange: 'stroke-orange-500 fill-orange-100',
  red: 'stroke-red-500 fill-red-100',
};

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  title,
  data = [],
  color = 'blue',
  height = 200
}) => {
  const [animatedData, setAnimatedData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Генерируем статичные демо-данные если данные не переданы
    if (data.length === 0 && animatedData.length === 0) {
      const demoData: ChartData[] = [];
      const now = new Date();
      
      // Генерируем статичные данные (без Math.random для предотвращения перерендеров)
      const staticValues = [45, 52, 48, 61, 55, 67, 59, 73, 68, 74, 71, 78, 82, 79, 85, 88, 84, 91, 87, 93, 89, 95, 92, 88];
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        demoData.push({
          time: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          value: staticValues[23 - i]
        });
      }
      
      setAnimatedData(demoData);
    } else if (data.length > 0) {
      setAnimatedData(data);
    }
  }, [data.length]); // Зависимость только от длины массива

  const maxValue = animatedData.length > 0 ? Math.max(...animatedData.map(d => d.value), 100) : 100;
  const minValue = animatedData.length > 0 ? Math.min(...animatedData.map(d => d.value), 0) : 0;
  const range = maxValue - minValue || 1; // Предотвращаем деление на 0

  const createPath = () => {
    if (animatedData.length === 0) return '';
    
    const width = 300;
    const stepX = width / (animatedData.length - 1);
    
    let path = '';
    
    animatedData.forEach((point, index) => {
      const x = index * stepX;
      const y = height - ((point.value - minValue) / range) * (height - 40);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  const createAreaPath = () => {
    if (animatedData.length === 0) return '';
    
    const linePath = createPath();
    const width = 300;
    
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
          <span className="text-sm text-gray-500">Статистика</span>
        </div>
      </div>
      
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 300 ${height}`} className="overflow-visible">
          {/* Сетка */}
          <defs>
            <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="300" height={height} fill="url(#grid)" />
          
          {/* Область под графиком */}
          <path
            d={createAreaPath()}
            className={`${colorClasses[color]} opacity-20`}
            strokeWidth="0"
          />
          
          {/* Линия графика */}
          <path
            d={createPath()}
            fill="none"
            className={`stroke-${color}-500`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Точки на графике */}
          {animatedData.map((point, index) => {
            const x = (index * 300) / (animatedData.length - 1);
            const y = height - ((point.value - minValue) / range) * (height - 40);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                className={`fill-${color}-500`}
                opacity="0.8"
              />
            );
          })}
        </svg>
        
        {/* Подписи по оси X */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {animatedData.filter((_, index) => index % 4 === 0).map((point, index) => (
            <span key={index}>{point.time}</span>
          ))}
        </div>
      </div>
      
      {/* Статистика */}
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">Среднее</p>
          <p className="font-semibold text-gray-900">
            {animatedData.length > 0 ? Math.round(animatedData.reduce((sum, d) => sum + d.value, 0) / animatedData.length) : 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Максимум</p>
          <p className="font-semibold text-gray-900">
            {animatedData.length > 0 ? Math.max(...animatedData.map(d => d.value)) : 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Минимум</p>
          <p className="font-semibold text-gray-900">
            {animatedData.length > 0 ? Math.min(...animatedData.map(d => d.value)) : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChart;