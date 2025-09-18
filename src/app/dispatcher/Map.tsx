'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useFirebase } from '../FirebaseProvider';
import { collection, onSnapshot } from 'firebase/firestore';
import { Icon } from 'leaflet';

// Leaflet icons
const driverIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Map() {
  const { firestore } = useFirebase();
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'locations'), (snapshot) => {
      const newLocations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      {locations.map((location) => (
        <Marker key={location.id} position={[location.latitude, location.longitude]} icon={driverIcon}>
          <Popup>
            Driver ID: {location.id} <br />
            Last seen: {location.timestamp?.toDate().toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
