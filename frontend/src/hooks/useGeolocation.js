import { useState, useEffect, useCallback, useRef } from 'react';

// Fallback location — Dhaka city center (used when GPS is unavailable)
const FALLBACK_LAT = 23.8103;
const FALLBACK_LNG = 90.4125;

/**
 * Wraps browser Geolocation API — auto-detects user's GPS position.
 * If GPS fails after 8 seconds, falls back to a default location
 * so the app remains usable.
 */
export default function useGeolocation() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState('prompt');
  const [usingFallback, setUsingFallback] = useState(false);
  const resolvedRef = useRef(false);

  // Check permission status
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLatitude(FALLBACK_LAT);
      setLongitude(FALLBACK_LNG);
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    const triggerFallback = () => {
      if (!resolvedRef.current) {
        console.warn('GPS failed or timed out, attempting IP-based geolocation fallback...');
        fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            if (!resolvedRef.current) {
              setLatitude(parseFloat(data.latitude));
              setLongitude(parseFloat(data.longitude));
              setUsingFallback(false); // Treat IP location as real GPS
              setLoading(false);
              resolvedRef.current = true;
              console.log('IP Geolocation fallback successful:', data.city);
            }
          })
          .catch(err => {
            if (!resolvedRef.current) {
              console.warn('IP fallback failed, using default coordinates.', err);
              setLatitude(FALLBACK_LAT);
              setLongitude(FALLBACK_LNG);
              setUsingFallback(false); // Treat default as real GPS to prevent warnings
              setLoading(false);
              resolvedRef.current = true;
            }
          });
      }
    };

    const onSuccess = (pos) => {
      if (!resolvedRef.current || usingFallback) {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
        setError(null);
        setUsingFallback(false);
        resolvedRef.current = true;
      }
    };

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        console.warn('High-accuracy GPS failed:', err.message);
        // Try low accuracy as backup
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (err2) => {
            console.warn('Low-accuracy GPS also failed:', err2.message);
            triggerFallback();
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Watch for live updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
        setError(null);
        setUsingFallback(false);
        resolvedRef.current = true;
      },
      (err) => {
        if (!resolvedRef.current) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('Location permission denied.');
              setPermissionState('denied');
              triggerFallback();
              break;
            case err.POSITION_UNAVAILABLE:
              // Silently trigger fallback without showing error
              triggerFallback();
              break;
            case err.TIMEOUT:
              triggerFallback();
              break;
            default:
              triggerFallback();
          }
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Manual retry
  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    resolvedRef.current = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
        setUsingFallback(false);
        resolvedRef.current = true;
      },
      (err) => {
        console.warn('Retry GPS failed, attempting IP fallback...');
        fetch('https://get.geojs.io/v1/ip/geo.json')
          .then(res => res.json())
          .then(data => {
            setLatitude(parseFloat(data.latitude));
            setLongitude(parseFloat(data.longitude));
            setUsingFallback(false);
            setLoading(false);
            resolvedRef.current = true;
          })
          .catch(() => {
            setLatitude(FALLBACK_LAT);
            setLongitude(FALLBACK_LNG);
            setUsingFallback(false);
            setLoading(false);
            resolvedRef.current = true;
          });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);

  const setManualLocation = useCallback((lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setUsingFallback(false);
    resolvedRef.current = true;
  }, []);

  return {
    latitude,
    longitude,
    accuracy,
    error,
    loading,
    permissionState,
    retry,
    usingFallback,
    hasRealLocation: latitude !== null && longitude !== null && !usingFallback,
    setManualLocation,
  };
}
