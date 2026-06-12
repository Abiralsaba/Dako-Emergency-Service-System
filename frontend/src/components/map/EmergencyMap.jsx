import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const LIBRARIES = ['places', 'geometry'];

const containerStyle = { width: '100%', height: '100%' };

export default function EmergencyMap({ center, children, directions = null, zoom = 14, routeInfo, onMapLoad, onMapClick }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);

  const defaultCenter = center || { lat: 23.8103, lng: 90.4125 };

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    if (onMapLoad) onMapLoad(map);
  }, [onMapLoad]);

  if (!isLoaded) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0f1e', color: '#006A4E', fontSize: '14px', fontWeight: 600,
        fontFamily: "'Poppins', sans-serif", letterSpacing: '2px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{
            width: '40px', height: '40px', border: '3px solid rgba(0,106,78,0.2)',
            borderTop: '3px solid #006A4E', borderRadius: '50%', margin: '0 auto 16px',
          }} />
          INITIALIZING MAP ENGINE
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={zoom}
        onLoad={onLoad}
        onClick={(e) => {
          if (onMapClick) onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Route polyline between citizen and responder */}
        {directions && (
          <DirectionsRenderer
            key={`route-${Date.now()}`}
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#F42A41',
                strokeOpacity: 1,
                strokeWeight: 6,
                zIndex: 10,
              },
            }}
          />
        )}

        {/* Custom markers */}
        {children}
      </GoogleMap>

      {/* ETA / Distance overlay */}
      {routeInfo && (
        <div 
          className="map-eta-overlay"
          style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 15, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 106, 78, 0.3)',
          borderRadius: '16px',
          padding: '16px 32px',
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
          boxShadow: '0 0 30px rgba(0, 106, 78, 0.15), 0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 100,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px',
              fontFamily: "'Poppins', sans-serif",
            }}>ETA</div>
            <div style={{
              fontSize: '22px', fontWeight: 800, color: '#D4A853',
              fontFamily: "'Poppins', sans-serif",
            }}>{routeInfo.duration}</div>
          </div>
          <div style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(transparent, rgba(0,106,78,0.4), transparent)',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px',
              fontFamily: "'Poppins', sans-serif",
            }}>Distance</div>
            <div style={{
              fontSize: '22px', fontWeight: 800, color: '#006A4E',
              fontFamily: "'Poppins', sans-serif",
            }}>{routeInfo.distance}</div>
          </div>
        </div>
      )}
    </div>
  );
}
