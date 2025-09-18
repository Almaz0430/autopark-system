'use client';

import LocationTracker from './LocationTracker';
import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import QuickActionButton from '../components/QuickActionButton';
import ProgressBar from '../components/ProgressBar';

export default function DriverPage() {
  const [currentRoute] = useState({
    id: 'RT-2025-001',
    from: 'Склад №1, ул. Промышленная, 15',
    to: 'ТЦ "Мега", ул. Ленина, 45',
    cargo: 'Продукты питания',
    weight: '2.5 т',
    status: 'В пути',
    progress: 65,
    estimatedTime: '45 мин'
  });

  const [todayStats] = useState({
    completedRoutes: 3,
    totalDistance: 156,
    workingTime: '6ч 30мин',
    fuelConsumption: '28.5л'
  });

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Кабинет водителя</h1>
          <p className="text-slate-600 mt-2">Управляйте маршрутами и отслеживайте выполнение заданий</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">На смене</span>
          </div>
        </div>
      </div>

      {/* Текущий маршрут */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Текущий маршрут</h2>
          <StatusBadge 
            status={currentRoute.status}
            variant="info"
            size="md"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Маршрут #{currentRoute.id}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Откуда</p>
                    <p className="text-sm text-slate-600">{currentRoute.from}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Куда</p>
                    <p className="text-sm text-slate-600">{currentRoute.to}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">Груз</p>
                <p className="text-sm text-slate-900">{currentRoute.cargo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Вес</p>
                <p className="text-sm text-slate-900">{currentRoute.weight}</p>
              </div>
            </div>
            
            <div>
              <ProgressBar 
                progress={currentRoute.progress}
                label="Прогресс маршрута"
                color="blue"
                size="md"
              />
              <p className="text-xs text-slate-500 mt-2">Осталось примерно {currentRoute.estimatedTime}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <button className="flex-1 btn-primary">
                Прибыл на место
              </button>
              <button className="btn-secondary">
                Связаться с диспетчером
              </button>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-yellow-800">Важно</span>
              </div>
              <p className="text-sm text-yellow-700">
                Не забудьте получить подпись получателя при доставке груза
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Отслеживание местоположения */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Отслеживание местоположения</h2>
            <LocationTracker />
          </div>
        </div>

        {/* Статистика за день */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Статистика за день</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Выполнено маршрутов</span>
                <span className="text-lg font-semibold text-slate-900">{todayStats.completedRoutes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Пройдено км</span>
                <span className="text-lg font-semibold text-slate-900">{todayStats.totalDistance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Время в пути</span>
                <span className="text-lg font-semibold text-slate-900">{todayStats.workingTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Расход топлива</span>
                <span className="text-lg font-semibold text-slate-900">{todayStats.fuelConsumption}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Быстрые действия</h2>
            <div className="space-y-3">
              <QuickActionButton
                icon="📍"
                title="Отметить прибытие"
                description="Подтвердить прибытие на точку назначения"
                color="blue"
              />
              <QuickActionButton
                icon="✅"
                title="Завершить маршрут"
                description="Отметить успешное завершение маршрута"
                color="green"
              />
              <QuickActionButton
                icon="🚨"
                title="Сообщить о проблеме"
                description="Уведомить диспетчера о возникших проблемах"
                color="red"
              />
              <QuickActionButton
                icon="⛽"
                title="Заправка"
                description="Зафиксировать заправку транспорта"
                color="yellow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
