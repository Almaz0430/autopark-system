'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useFirebase } from '../FirebaseProvider';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Вспомогательная функция для форматирования timestamp
const formatTimestamp = (timestamp: unknown): string => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate().toLocaleString();
  }
  return '';
};

// Leaflet icons
const driverIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Map() {
  const { firestore } = useFirebase();
  const [locations, setLocations] = useState<Array<{ id: string; userId: string; latitude: number; longitude: number; timestamp: unknown; name?: string; status?: string }>>([]);

  useEffect(() => {
    // Listen to all users' latest location documents located at users/{uid}/location/{docId}
    const unsubscribe = onSnapshot(collectionGroup(firestore, 'location'), (snapshot) => {
      const newLocations = snapshot.docs.map((doc) => {
        // Parent of collection 'location' is user document
        const userId = doc.ref.parent.parent?.id || doc.id;
        const data = doc.data() as { latitude: number; longitude: number; timestamp: unknown; name?: string; status?: string };
        return {
          id: `${userId}-${doc.id}`,
          userId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
          name: data.name,
          status: data.status,
        };
      });
      setLocations(newLocations);
    });

    return () => unsubscribe();
  }, [firestore]);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '70vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.filter((l) => typeof l.latitude === 'number' && typeof l.longitude === 'number').map((location) => (
        <Marker key={location.id} position={[location.latitude, location.longitude]} icon={driverIcon}>
          <Popup>
            Водитель: {location.name || location.userId} <br />
            Статус: {location.status || '—'} <br />
            Обновлено: {formatTimestamp(location.timestamp)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
