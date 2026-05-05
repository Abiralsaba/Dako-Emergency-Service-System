import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';

const MARKER_COLORS = {
  POLICE: '#3b82f6',
  AMBULANCE: '#10b981',
  MEDICAL: '#10b981',
  FIRE: '#ef4444',
  FIRE_SERVICE: '#ef4444',
  EMERGENCY_CAR: '#f59e0b',
  CITIZEN: '#e11d48',
  DEFAULT: '#00f0ff',
};

export default function ServiceMarker({ position, type, label, details }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!position?.lat || !position?.lng) return null;

  const color = MARKER_COLORS[type] || MARKER_COLORS.DEFAULT;

  const icon = window.google ? {
    path: 'M12 21.3653C12 21.3653 20.3013 13.9109 20.3013 8.35821C20.3013 3.74239 16.5855 0 12 0C7.4145 0 3.69873 3.74239 3.69873 8.35821C3.69873 13.9109 12 21.3653 12 21.3653ZM12 6.51865C13.5707 6.51865 14.8443 7.7923 14.8443 9.36294C14.8443 10.9336 13.5707 12.2072 12 12.2072C10.4293 12.2072 9.15569 10.9336 9.15569 9.36294C9.15569 7.7923 10.4293 6.51865 12 6.51865Z',
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 1.6,
    anchor: new window.google.maps.Point(12, 21),
  } : undefined;

  return (
    <Marker
      position={position}
      icon={icon}
      onClick={() => setShowInfo(true)}
      animation={type === 'CITIZEN' && window.google ? window.google.maps.Animation.DROP : undefined}
    >
      {showInfo && (
        <InfoWindow onCloseClick={() => setShowInfo(false)}>
          <div style={{ color: '#0f172a', padding: '6px', minWidth: '120px' }}>
            <strong style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }}>{label || type}</strong>
            {details && <p style={{ fontSize: '12px', margin: 0, color: '#64748b' }}>{details}</p>}
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
}
