import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { LogOut, Shield, Siren, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const roleBadge = {
    CITIZEN: { label: 'Civilian', color: '#a1a1aa', icon: <UserCircle size={14} /> },
    RESPONDER: { label: 'Responder', color: '#e11d48', icon: <Siren size={14} /> },
    ADMIN: { label: 'Admin', color: '#f59e0b', icon: <Shield size={14} /> },
  };

  const badge = roleBadge[user?.role] || roleBadge.CITIZEN;

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px',
      background: 'rgba(9, 9, 11, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Siren size={22} color="var(--accent)" />
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          DAKO<span style={{ color: 'var(--accent)' }}> System</span>
        </span>
      </div>

      {/* User info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: '#a1a1aa', fontSize: '14px' }}>{user?.fullName}</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: `${badge.color}22`, color: badge.color, border: `1px solid ${badge.color}44`,
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          {badge.icon} {badge.label}
        </span>
        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#a1a1aa', borderRadius: '8px', padding: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.target.style.color = '#e11d48'}
          onMouseLeave={e => e.target.style.color = '#a1a1aa'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
