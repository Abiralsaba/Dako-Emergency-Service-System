import React from 'react';
import { getStatusColor } from '../../utils/helpers';
import { Check, Search, Send, CheckCircle, Navigation, MapPin, Zap } from 'lucide-react';

// Matches the new Uber-like lifecycle
const STEPS = [
  { key: 'SEARCHING', label: 'Searching', icon: Search },
  { key: 'OFFER_SENT', label: 'Offer Sent', icon: Send },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle },
  { key: 'RESPONDER_EN_ROUTE', label: 'En Route', icon: Navigation },
  { key: 'RESPONDER_ARRIVED', label: 'Arrived', icon: MapPin },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Zap },
  { key: 'COMPLETED', label: 'Completed', icon: Check },
];

export default function StatusStepper({ currentStatus }) {
  // Find the current step index, fallback to -1 if cancelled/unassigned
  const currentIndex = STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%', padding: '16px 0' }}>
      {STEPS.map((step, i) => {
        const isCompleted = currentIndex >= 0 && i < currentIndex;
        const isActive = i === currentIndex;
        const color = getStatusColor(step.key);
        const StepIcon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              {/* Circle */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCompleted ? color : isActive ? `${color}33` : 'rgba(255,255,255,0.06)',
                border: `2px solid ${isCompleted || isActive ? color : 'rgba(255,255,255,0.1)'}`,
                transition: 'all 0.4s ease',
                boxShadow: isActive ? `0 0 12px ${color}55` : 'none',
              }}>
                {isCompleted ? <Check size={14} color="#fff" /> :
                  <StepIcon size={12} color={isActive ? color : '#555'} />
                }
              </div>
              {/* Label */}
              <span style={{
                fontSize: '8px', fontWeight: 700, marginTop: '6px',
                color: isCompleted || isActive ? color : '#555',
                textTransform: 'uppercase', letterSpacing: '0.3px',
                textAlign: 'center', lineHeight: '1.2',
              }}>
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 0.3, height: '2px', marginBottom: '18px',
                background: currentIndex >= 0 && i < currentIndex ? color : 'rgba(255,255,255,0.08)',
                transition: 'background 0.4s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
