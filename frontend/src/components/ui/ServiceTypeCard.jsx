import React from 'react';

const SERVICES = [
  { type: 'POLICE', label: 'Police', image: '/assets/police_3d.png', desc: 'Law enforcement', eta: '5 min' },
  { type: 'MEDICAL', label: 'Ambulance', image: '/assets/ambulance_3d.png', desc: 'Medical emergency', eta: '6 min' },
  { type: 'FIRE', label: 'Fire Dept', image: '/assets/fire_truck_3d.png', desc: 'Fire & rescue', eta: '4 min' },
  { type: 'GENERAL', label: 'Emergency Car', image: '/assets/suv_3d.png', desc: 'Nearest unit', eta: '10 min' },
];

export const AMBULANCE_OPTIONS = [
  { id: 'NEAREST', label: 'Nearest Ambulance', price: 'Emergency', base: 500, perKm: 50, desc: 'Fastest available unit' },
  { id: 'BASIC', label: 'Basic Ambulance', price: 'Base 800৳ + 60৳/km', base: 800, perKm: 60, desc: 'Basic Life Support' },
  { id: 'ICU', label: 'ICU Ambulance', price: 'Base 2,000৳ + 100৳/km', base: 2000, perKm: 100, desc: 'Advanced Life Support' },
  { id: 'GOVT', label: 'Govt Free Ambulance', price: 'FREE', base: 0, perKm: 0, desc: 'Subject to availability' },
];

export default function ServiceTypeSelector({ selected, onSelect, subSelected, onSubSelect }) {
  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
      {SERVICES.map(({ type, label, image, desc, eta }) => {
        const active = selected === type;
        
        let rightText = null;
        if (type === 'FIRE') rightText = <span style={{ color: '#10B981', fontWeight: 700 }}>FREE</span>;
        else if (type === 'GENERAL') rightText = '50 ৳ / km';
        else if (type === 'MEDICAL') rightText = 'View Options';

        return (
          <React.Fragment key={type}>
            <div
              onClick={() => onSelect(type)}
              style={{
                padding: '12px 16px',
                borderRadius: '16px',
                cursor: 'pointer',
                background: 'transparent',
                border: `2px solid ${active ? '#FFFFFF' : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#1A1D21', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden'
                }}>
                  <img src={image} alt={label} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#F1F5F9', fontFamily: "'Inter', sans-serif" }}>
                      {label}
                    </span>
                    <span style={{ fontSize: '13px', color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {type === 'FIRE' ? '4' : '2'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '2px', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                    {timeString} • {eta}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', fontFamily: "'Inter', sans-serif" }}>
                    {desc}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 500, color: '#F1F5F9', fontFamily: "'Inter', sans-serif" }}>
                 {rightText}
              </div>
            </div>

            {/* Expandable Ambulance Chart */}
            {type === 'MEDICAL' && active && (
              <div style={{
                marginLeft: '32px', marginRight: '16px', marginTop: '4px', marginBottom: '8px',
                padding: '12px', borderRadius: '12px', background: '#1A1D21',
                borderLeft: '2px solid #00C896'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Select Ambulance Type
                </div>
                {AMBULANCE_OPTIONS.map(opt => {
                  const isOptActive = subSelected === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={(e) => { e.stopPropagation(); onSubSelect(opt.id); }}
                      style={{
                        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                        background: isOptActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: `1px solid ${isOptActive ? '#FFF' : 'transparent'}`,
                        marginBottom: '4px', transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFF' }}>{opt.label}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>{opt.desc}</div>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: opt.price === 'FREE' ? '#10B981' : '#FFF' }}>
                        {opt.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
