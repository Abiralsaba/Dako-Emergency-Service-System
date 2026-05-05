import React from 'react';
import { Shield, Heart, Flame, Car, Zap } from 'lucide-react';
import { getServiceColor } from '../../utils/helpers';

const SERVICES = [
  { type: 'POLICE', label: 'Police', icon: Shield, desc: 'Law enforcement' },
  { type: 'MEDICAL', label: 'Ambulance', icon: Heart, desc: 'Medical emergency' },
  { type: 'FIRE', label: 'Fire Dept', icon: Flame, desc: 'Fire & rescue' },
  { type: 'EMERGENCY_CAR', label: 'Emergency Car', icon: Car, desc: 'Rapid transport' },
  { type: 'GENERAL', label: 'General', icon: Zap, desc: 'Nearest unit' },
];

export default function ServiceTypeSelector({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
      {SERVICES.map(({ type, label, icon: Icon, desc }) => {
        const active = selected === type;
        const color = getServiceColor(type);
        return (
          <div
            key={type}
            onClick={() => onSelect(type)}
            style={{
              padding: '14px 10px', borderRadius: '12px', cursor: 'pointer',
              background: active ? `${color}15` : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              transition: 'all 0.25s ease',
              boxShadow: active ? `0 0 20px ${color}20` : 'none',
            }}
          >
            <Icon size={22} color={active ? color : '#555'} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: active ? color : '#aaa' }}>
              {label}
            </span>
            <span style={{ fontSize: '9px', color: '#555', textAlign: 'center' }}>{desc}</span>
          </div>
        );
      })}
    </div>
  );
}
