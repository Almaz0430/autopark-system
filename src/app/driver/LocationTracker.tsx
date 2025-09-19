"use client";

import { useEffect, useRef, useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { Timestamp, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

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
      // @ts-ignore
      if ('permissions' in navigator && navigator.permissions?.query) {
        // @ts-ignore
        navigator.permissions.query({ name: 'geolocation' }).then((res: any) => {
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
      const payload: any = {
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
    <div>
      {location ? (
        <p>
          Текущая позиция: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </p>
      ) : (
        <p>{error ? 'Ошибка получения геолокации' : status === 'requesting' ? 'Запрашиваем доступ к геолокации…' : 'Ожидание старта маршрута'}</p>
      )}
      {error && <p>Ошибка: {error}</p>}
    </div>
  );
}
