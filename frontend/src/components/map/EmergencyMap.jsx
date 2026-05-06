import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const LIBRARIES = ['places', 'geometry'];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1b3a1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

const containerStyle = { width: '100%', height: '100%' };

export default function EmergencyMap({ center, children, directions = null, zoom = 14, routeInfo, onMapLoad }) {
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
        background: '#0a0f1e', color: '#00f0ff', fontSize: '14px', fontWeight: 600,
        fontFamily: "'Orbitron', monospace", letterSpacing: '2px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{
            width: '40px', height: '40px', border: '3px solid rgba(0,240,255,0.2)',
            borderTop: '3px solid #00f0ff', borderRadius: '50%', margin: '0 auto 16px',
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
        options={{
          styles: darkMapStyle,
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
                strokeColor: '#00f0ff',
                strokeOpacity: 1,
                strokeWeight: 5,
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
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: '16px',
          padding: '16px 32px',
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.15), 0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 100,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px',
              fontFamily: "'Orbitron', monospace",
            }}>ETA</div>
            <div style={{
              fontSize: '22px', fontWeight: 800, color: '#00f0ff',
              fontFamily: "'Orbitron', monospace",
            }}>{routeInfo.duration}</div>
          </div>
          <div style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(transparent, rgba(0,240,255,0.4), transparent)',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px',
              fontFamily: "'Orbitron', monospace",
            }}>Distance</div>
            <div style={{
              fontSize: '22px', fontWeight: 800, color: '#10b981',
              fontFamily: "'Orbitron', monospace",
            }}>{routeInfo.distance}</div>
          </div>
        </div>
      )}
    </div>
  );
}
