import React from 'react';
import { getStatusColor, getServiceColor, formatTimeAgo } from '../../utils/helpers';
import { Shield, Heart, Flame, MapPin, Car, Zap, User, Phone } from 'lucide-react';

const serviceIcons = {
  POLICE: Shield, MEDICAL: Heart, FIRE: Flame,
  AMBULANCE: Heart, FIRE_SERVICE: Flame,
  EMERGENCY_CAR: Car, GENERAL: Zap,
};

export default function EmergencyCard({ emergency, onClick, showDetails }) {
  const color = getServiceColor(emergency.emergencyType);
  const statusColor = getStatusColor(emergency.status);
  const Icon = serviceIcons[emergency.emergencyType] || MapPin;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px', borderRadius: '12px', cursor: onClick ? 'pointer' : 'default',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s ease',
        marginBottom: '8px',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Service icon */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color}33`, flexShrink: 0,
        }}>
          <Icon size={18} color={color} />
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
              {emergency.emergencyType?.replace(/_/g, ' ')} Emergency
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
              background: `${statusColor}22`, color: statusColor, textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {emergency.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {emergency.citizenName || 'Citizen'} · {formatTimeAgo(emergency.createdAt)}
          </div>
        </div>
      </div>

      {/* Extended details for admin */}
      {showDetails && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} /> {emergency.citizenName}
            </div>
            {emergency.citizenPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {emergency.citizenPhone}
              </div>
            )}
            {emergency.responderName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#006A4E' }}>
                → {emergency.responderName}
              </div>
            )}
          </div>
          {emergency.description && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
              "{emergency.description}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
