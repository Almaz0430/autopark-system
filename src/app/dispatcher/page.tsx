"use client";

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { useFirebase } from '../FirebaseProvider';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import Chat from './Chat';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function DispatcherPage() {
  const { firestore } = useFirebase();
  const [drivers, setDrivers] = useState<Array<any>>([]);

  useEffect(() => {
    // users collection: {name, role, status, vehicle}
    const q = query(collection(firestore, 'users'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any);
    });
    return () => unsub();
  }, [firestore]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'В пути': return 'success';
      case 'Загрузка': return 'warning';
      case 'Разгрузка': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Панель диспетчера</h1>
          <p className="text-slate-600 mt-2">Отслеживайте местоположение и статус водителей в реальном времени</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Обновить
          </button>
          <button className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Новый маршрут
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Список водителей */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Активные водители</h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {drivers.length}
              </span>
            </div>
            <div className="space-y-3">
              {drivers.map((driver: any) => (
                <div key={driver.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900 text-sm">{driver.name || driver.id}</h3>
                    <div className={`w-2 h-2 rounded-full ${driver.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{driver.vehicle || '—'}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge
                      status={driver.status || '—'}
                      variant={getStatusVariant(driver.status || '') as any}
                      size="sm"
                    />
                    <details>
                      <summary className="text-xs text-blue-600 hover:underline cursor-pointer">написать сообщение</summary>
                      <div className="mt-3">
                        <Chat dispatcherUid={"dispatcher"} driverUid={driver.id} />
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Карта */}
        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Карта отслеживания</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">В пути</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-600">Загрузка</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">Разгрузка</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-96">
              <Map />
            </div>
          </div>
        </div>
      </div>

      {/* Статистика маршрутов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Активных маршрутов</p>
              <p className="text-2xl font-bold text-slate-900">18</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Завершено сегодня</p>
              <p className="text-2xl font-bold text-slate-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Среднее время</p>
              <p className="text-2xl font-bold text-slate-900">2.5ч</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
