'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { doc, setDoc } from 'firebase/firestore';

export default function LocationTracker() {
  const { auth, firestore } = useFirebase();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'watching'>('idle');
  const lastSentAtRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Геолокация не поддерживается этим браузером.');
      return;
    }

    setStatus('requesting');

    // Try to read current permission state to give clearer UX
    try {
      // @ts-expect-error: TS либы могут не знать о типе PermissionName
      if ('permissions' in navigator && navigator.permissions?.query) {
        // @ts-ignore
        navigator.permissions.query({ name: 'geolocation' }).then((res) => {
          if (res.state === 'denied') {
            setError('Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.');
          }
        }).catch(() => {});
      }
    } catch {}

    const options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 10000,
    };

    const onSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      setStatus('watching');

      const now = Date.now();
      const lastSentAt = lastSentAtRef.current;
      if (auth.currentUser && now - lastSentAt >= 5000) {
        lastSentAtRef.current = now;
        setDoc(
          doc(firestore, 'locations', auth.currentUser.uid),
          { latitude, longitude, timestamp: new Date() }
        ).catch(() => {});
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

    // Use watchPosition for continuous updates; clear on unmount
    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [auth, firestore]);

  return (
    <div>
      {location ? (
        <p>
          Your location: {location.latitude}, {location.longitude}
        </p>
      ) : (
        <p>
          {error ? 'Ошибка получения геолокации' : status === 'requesting' ? 'Запрашиваем доступ к геолокации…' : 'Получаем вашу геолокацию…'}
        </p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
