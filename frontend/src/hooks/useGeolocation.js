import { useState, useEffect } from 'react';

// Wraps browser Geolocation API — auto-detects user's GPS position
export default function useGeolocation() {
  // Initialize with default Dhaka coordinates so it's never completely blocked
  const [position, setPosition] = useState({ latitude: 23.8103, longitude: 90.4125 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      setLoading(false);
      return;
    }

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { ...position, error, loading };
}
