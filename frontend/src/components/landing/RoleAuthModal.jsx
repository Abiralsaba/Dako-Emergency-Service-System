/*
  =========================================
  ROLE AUTHENTICATION MODAL
  =========================================
  Provides a slide-up modal used for authenticating or registering Responders.
  - Takes in `role` config to determine endpoints.
  - Swaps between login and enrollment.
*/
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, ArrowRight, ArrowLeft, Loader, UserPlus } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';


const roleConfig = {
  AMBULANCE: {
    loginTitle: 'Medical Unit Login',
    registerTitle: 'Medical Unit Enrollment',
    subtitle: 'Ambulance crew authentication portal',
    registerAs: 'CITIZEN', // Citizens call ambulances
  },
  FIRE_SERVICE: {
    loginTitle: 'Fire Service Login',
    registerTitle: 'Fire Service Enrollment',
    subtitle: 'Fire department access portal',
    registerAs: 'FIRE_SERVICE',
  },
  POLICE: {
    loginTitle: 'Law Enforcement Login',
    registerTitle: 'Law Enforcement Enrollment',
    subtitle: 'Police department access portal',
    registerAs: 'POLICE',
  },
  ADMIN: {
    loginTitle: 'Admin Panel Login',
    registerTitle: 'Admin Panel Enrollment',
    subtitle: 'Command center administrator access',
    registerAs: 'ADMIN',
  },
};

export default function RoleAuthModal({ role, roleLabel, color, onClose, startOnRegister }) {
  const [isLogin, setIsLogin] = useState(!startOnRegister);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const config = roleConfig[role] || roleConfig.AMBULANCE;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    nid: '',
    phoneNumber: '',
    password: '',
    homeAddress: '',
    vehicleRegistrationNumber: '',
    emergencyContactNumber: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(phoneNumber, password);
      login(res.data);
      toast.success(`Welcome back, ${res.data.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (config.registerAs === 'CITIZEN') {
        res = await authService.registerCitizen({
          fullName: formData.fullName,
          nid: formData.nid,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          homeAddress: formData.homeAddress,
          emergencyContactNumber: formData.emergencyContactNumber,
        });
      } else if (config.registerAs === 'ADMIN') {
        res = await authService.registerCitizen({
          fullName: formData.fullName,
          nid: formData.nid,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          homeAddress: formData.homeAddress || 'Admin HQ',
          emergencyContactNumber: formData.emergencyContactNumber || '',
        });
      } else {
        res = await authService.registerResponder({
          fullName: formData.fullName,
          nid: formData.nid,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          serviceType: config.registerAs,
          vehicleRegistrationNumber: formData.vehicleRegistrationNumber,
        });
      }
      login(res.data);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const isResponder = ['POLICE', 'FIRE_SERVICE'].includes(config.registerAs);
  const isCitizen = config.registerAs === 'CITIZEN' || config.registerAs === 'ADMIN';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px 24px 0 0',
          background: 'rgba(8, 12, 24, 0.95)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          padding: '32px 28px 40px',
          position: 'relative',
        }}
      >
        {/* Top accent glow line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: '3px',
            borderRadius: '0 0 2px 2px',
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />

        {/* Drag handle */}
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.2)',
            margin: '0 auto 24px',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: `${color}15`,
              border: `1px solid ${color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            {isLogin ? (
              <Fingerprint size={26} color={color} />
            ) : (
              <UserPlus size={26} color={color} />
            )}
          </div>
          <h2
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '20px',
              fontWeight: 700,
              color: '#e2e8f0',
              margin: '0 0 6px',
            }}
          >
            {isLogin ? config.loginTitle : config.registerTitle}
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              margin: 0,
            }}
          >
            {config.subtitle}
          </p>
        </div>

        {/* Toggle Login / Register */}
        <div
          style={{
            display: 'flex',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '24px',
          }}
        >
          {['Login', 'Register'].map((label, i) => {
            const active = i === 0 ? isLogin : !isLogin;
            return (
              <button
                key={label}
                onClick={() => setIsLogin(i === 0)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: active
                    ? `linear-gradient(135deg, ${color}20, ${color}08)`
                    : 'transparent',
                  border: 'none',
                  color: active ? color : '#64748b',
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLogin}
            >
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Mobile Number</label>
                <input
                  type="text"
                  placeholder="Enter your registered mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  style={inputStyle(color)}
                />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Passcode</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle(color)}
                />
              </div>
              <button type="submit" disabled={loading} style={btnStyle(color)}>
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRegister}
            >
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  name="fullName"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                  style={inputStyle(color)}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>National ID</label>
                <input
                  name="nid"
                  placeholder="National ID"
                  onChange={handleChange}
                  required
                  style={inputStyle(color)}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Phone Number</label>
                <input
                  name="phoneNumber"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  required
                  style={inputStyle(color)}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Passcode</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  style={inputStyle(color)}
                />
              </div>

              {isCitizen && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Home Address</label>
                    <input
                      name="homeAddress"
                      placeholder="Home Address"
                      onChange={handleChange}
                      required
                      style={inputStyle(color)}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Emergency Contact</label>
                    <input
                      name="emergencyContactNumber"
                      placeholder="Emergency Contact Number"
                      onChange={handleChange}
                      style={inputStyle(color)}
                    />
                  </div>
                </>
              )}

              {isResponder && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Vehicle Registration</label>
                  <input
                    name="vehicleRegistrationNumber"
                    placeholder="Vehicle Registration (Optional)"
                    onChange={handleChange}
                    style={inputStyle(color)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ ...btnStyle(color), marginTop: '16px' }}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  'Confirm Enrollment'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  color: '#94a3b8',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  fontWeight: 600,
  fontFamily: "'Orbitron', monospace",
};

const inputStyle = (color) => ({
  width: '100%',
  padding: '13px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: '#e2e8f0',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.3s',
  boxSizing: 'border-box',
});

const btnStyle = (color) => ({
  width: '100%',
  padding: '14px',
  borderRadius: '10px',
  border: `1px solid ${color}40`,
  background: `linear-gradient(135deg, ${color}20, ${color}08)`,
  color: color,
  fontFamily: "'Orbitron', monospace",
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'all 0.3s ease',
});
