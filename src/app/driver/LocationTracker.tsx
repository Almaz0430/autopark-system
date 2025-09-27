"use client";

import { useEffect, useRef, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

type Props = {
  active: boolean;
  routeId: string | null;
};

export default function LocationTracker({ active, routeId }: Props) {
  const { auth, firestore } = useFirebase();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'watching'>('idle');
  const lastSentAtRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setStatus('idle');
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('Геолокация не поддерживается этим браузером.');
      return;
    }
    setStatus('requesting');

    try {
      if ('permissions' in navigator && navigator.permissions?.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((res: { state: string }) => {
          if (res.state === 'denied') {
            setError('Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.');
          }
        }).catch(() => {});
      }
    } catch {}

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 5000,
    };

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      setStatus('watching');

      const now = Date.now();
      const lastSentAt = lastSentAtRef.current;
      if (!auth.currentUser) return;
      // каждые 10 сек максимум
      if (now - lastSentAt < 10000) return;
      lastSentAtRef.current = now;

      const uid = auth.currentUser.uid;
      const payload: { latitude: number; longitude: number; timestamp: unknown } = {
        latitude,
        longitude,
        timestamp: serverTimestamp(),
      };

      // users/{uid}/location/current
      await setDoc(doc(firestore, 'users', uid, 'location', 'current'), payload, { merge: true }).catch(() => {});

      // routes/{driverId} top-level doc and append track point
      if (routeId) {
        await setDoc(doc(firestore, 'routes', uid), { activeRouteId: routeId, lastLocation: payload }, { merge: true }).catch(() => {});
        const trackCol = collection(firestore, 'routes', uid, 'track');
        const pointId = String(now);
        await setDoc(doc(trackCol, pointId), { ...payload, routeId }).catch(() => {});
      }
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setError('Доступ к геолокации отклонён. Разрешите доступ, затем обновите страницу.');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setError('Позиция недоступна. Проверьте GPS/сеть и попробуйте снова.');
      } else if (err.code === err.TIMEOUT) {
        setError('Не удалось получить координаты: таймаут.');
      } else {
        setError(err.message);
      }
      setStatus('idle');
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
    watchIdRef.current = watchId;
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [active, routeId, auth, firestore]);

  return (
    <div className="w-full">
      {location ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Местоположение отслеживается</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Широта:</span>
                  <p className="font-mono font-medium text-gray-900">{location.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Долгота:</span>
                  <p className="font-mono font-medium text-gray-900">{location.longitude.toFixed(6)}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Обновляется каждые 10 секунд</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            {status === 'requesting' ? (
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error ? 'Ошибка геолокации' : status === 'requesting' ? 'Получение местоположения...' : 'Ожидание старта маршрута'}
          </h3>
          <p className="text-sm text-gray-600">
            {error ? error : status === 'requesting' ? 'Запрашиваем доступ к геолокации' : 'Нажмите "Начать смену" для активации отслеживания'}
          </p>
        </div>
      )}
    </div>
  );
}
