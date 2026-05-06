import { useState, useEffect, useCallback } from 'react';

/**
 * Wraps browser Geolocation API — auto-detects user's GPS position.
 * Returns null lat/lng until real GPS is obtained.
 * Explicitly requests permission and handles denial gracefully.
 */
export default function useGeolocation() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState('prompt'); // 'granted' | 'denied' | 'prompt'

  // Check permission status (if Permissions API is available)
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }).catch(() => {
        // Permissions API not supported, that's okay
      });
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // First, try to get a quick position (allows cached)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Geolocation getCurrentPosition error:', err.message);
        // Don't set loading false yet — watchPosition might still work
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    // Then watch continuously for live updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser/device settings.');
            setPermissionState('denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Make sure GPS/Location Services are turned on.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('Unable to get your location: ' + err.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Manual retry function (useful when permission was denied then granted)
  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return {
    latitude,
    longitude,
    accuracy,
    error,
    loading,
    permissionState,
    retry,
    hasRealLocation: latitude !== null && longitude !== null,
  };
}
