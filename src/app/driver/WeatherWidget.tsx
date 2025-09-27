'use client';

import { useState, useEffect } from 'react';
import { FaCloud, FaSun, FaCloudRain, FaSnowflake, FaWind, FaEye, FaThermometerHalf } from 'react-icons/fa';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  roadCondition: 'good' | 'wet' | 'icy' | 'poor';
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 15,
    condition: 'cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 8,
    roadCondition: 'good'
  });

  const weatherIcons = {
    sunny: <FaSun className="w-8 h-8 text-yellow-500" />,
    cloudy: <FaCloud className="w-8 h-8 text-gray-500" />,
    rainy: <FaCloudRain className="w-8 h-8 text-blue-500" />,
    snowy: <FaSnowflake className="w-8 h-8 text-blue-300" />
  };

  const conditionLabels = {
    sunny: 'Солнечно',
    cloudy: 'Облачно',
    rainy: 'Дождь',
    snowy: 'Снег'
  };

  const roadConditionConfig = {
    good: { label: 'Хорошие', color: 'text-green-600', bg: 'bg-green-100' },
    wet: { label: 'Мокрые', color: 'text-blue-600', bg: 'bg-blue-100' },
    icy: { label: 'Гололед', color: 'text-red-600', bg: 'bg-red-100' },
    poor: { label: 'Плохие', color: 'text-orange-600', bg: 'bg-orange-100' }
  };

  // Симуляция обновления погоды
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 3)
      }));
    }, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, []);

  const roadCondition = roadConditionConfig[weather.roadCondition];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Погода и дороги</h3>
        <div className="text-xs text-gray-500">Обновлено: сейчас</div>
      </div>
      
      {/* Основная погодная информация */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {weatherIcons[weather.condition]}
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-sm text-gray-600">
              {conditionLabels[weather.condition]}
            </div>
          </div>
        </div>
        
        <div className={`px-3 py-2 rounded-lg ${roadCondition.bg}`}>
          <div className="text-xs text-gray-600">Дороги</div>
          <div className={`text-sm font-medium ${roadCondition.color}`}>
            {roadCondition.label}
          </div>
        </div>
      </div>

      {/* Детальная информация */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <FaWind className="w-4 h-4 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500">Ветер</div>
            <div className="text-sm font-medium text-gray-900">
              {Math.round(weather.windSpeed)} км/ч
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <FaThermometerHalf className="w-4 h-4 text-red-500" />
          <div>
            <div className="text-xs text-gray-500">Влажность</div>
            <div className="text-sm font-medium text-gray-900">
              {weather.humidity}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl col-span-2">
          <FaEye className="w-4 h-4 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500">Видимость</div>
            <div className="text-sm font-medium text-gray-900">
              {weather.visibility} км
            </div>
          </div>
        </div>
      </div>

      {/* Предупреждения */}
      {(weather.condition === 'rainy' || weather.roadCondition === 'icy') && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-800">
              Осторожно на дороге!
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            {weather.condition === 'rainy' && 'Дождь может ухудшить видимость'}
            {weather.roadCondition === 'icy' && 'Возможен гололед'}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;