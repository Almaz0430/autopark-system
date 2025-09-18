'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { doc, setDoc } from 'firebase/firestore';

export default function LocationTracker() {
  const { auth, firestore } = useFirebase();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            if (auth.currentUser) {
              setDoc(doc(firestore, 'locations', auth.currentUser.uid), { latitude, longitude, timestamp: new Date() });
            }
          },
          (error) => {
            setError(error.message);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    };

    sendLocation(); // Send location immediately on component mount
    const interval = setInterval(sendLocation, 5000); // Send location every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [auth, firestore]);

  return (
    <div>
      {location ? (
        <p>
          Your location: {location.latitude}, {location.longitude}
        </p>
      ) : (
        <p>Getting your location...</p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
