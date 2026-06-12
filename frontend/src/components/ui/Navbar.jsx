import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { LogOut, Shield, Siren, UserCircle, MoreVertical, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const roleBadge = {
    CITIZEN: { label: 'Civilian', color: '#006A4E', icon: <UserCircle size={14} /> },
    RESPONDER: { label: 'Responder', color: '#F42A41', icon: <Siren size={14} /> },
    ADMIN: { label: 'Admin', color: '#D4A853', icon: <Shield size={14} /> },
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
        <Siren size={22} color="#006A4E" />
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: "'Poppins', sans-serif" }}>
          DAKO<span style={{ color: '#006A4E' }}> System</span>
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
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#a1a1aa', borderRadius: '8px', padding: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#a1a1aa'}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#1A1D21', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              minWidth: '200px', overflow: 'hidden', zIndex: 200
            }}>
              <button onClick={() => { setMenuOpen(false); navigate('/health'); }} style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '12px 16px', background: 'transparent', border: 'none',
                color: '#f1f5f9', cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Activity size={16} color="#dc2626" />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Health Portal</span>
              </button>
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#a1a1aa', borderRadius: '8px', padding: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.target.style.color = '#F42A41'}
          onMouseLeave={e => e.target.style.color = '#a1a1aa'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
