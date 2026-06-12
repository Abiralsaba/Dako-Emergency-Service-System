import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, User, UserCog, LogIn, UserPlus,
  ArrowRight, Loader, Eye, EyeOff,
  Phone, Lock, MapPin, IdCard, Contact,
  Siren, Car, Shield, Heart, Flame
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import authBg from '../assets/auth-bg.png';

const SERVICE_TYPES = [
  { key: 'AMBULANCE', label: 'Ambulance', icon: Heart, color: '#10b981' },
  { key: 'FIRE_SERVICE', label: 'Fire Service', icon: Flame, color: '#F42A41' },
  { key: 'POLICE', label: 'Police', icon: Shield, color: '#3b82f6' },
  { key: 'EMERGENCY_CAR', label: 'Emergency Car', icon: Car, color: '#D4A853' },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'login';

  const [activeRole, setActiveRole] = useState('USER');
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    nid: '',
    phoneNumber: '',
    password: '',
    homeAddress: '',
    emergencyContactNumber: '',
    serviceType: '',
    vehicleRegistrationNumber: '',
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
      if (activeRole === 'RESPONDER') {
        if (!formData.serviceType) {
          toast.error('Select a service type');
          setLoading(false);
          return;
        }
        res = await authService.registerResponder({
          fullName: formData.fullName,
          nid: formData.nid,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          serviceType: formData.serviceType,
          vehicleRegistrationNumber: formData.vehicleRegistrationNumber,
        });
      } else if (activeRole === 'ADMIN') {
        res = await authService.registerAdmin({
          fullName: formData.fullName,
          nid: formData.nid,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          homeAddress: formData.homeAddress,
          emergencyContactNumber: formData.emergencyContactNumber,
        });
      } else {
        res = await authService.registerCitizen({
          fullName: formData.fullName,
          nid: formData.nid,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          homeAddress: formData.homeAddress,
          emergencyContactNumber: formData.emergencyContactNumber,
        });
      }
      login(res.data);
      const msg = activeRole === 'RESPONDER'
        ? 'Registration successful! Awaiting admin approval.'
        : 'Registration successful!';
      toast.success(msg);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 }
    },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
  };

  const roleTabColors = {
    USER: '#006A4E',
    RESPONDER: '#F42A41',
    ADMIN: '#D4A853',
  };

  const accent = roleTabColors[activeRole] || '#006A4E';

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      background: '#0C1219',
    }}>

      {/* ── Left Decorative Panel ── */}
      <div style={{
        width: '40%',
        minHeight: '100vh',
        background: 'linear-gradient(170deg, #006A4E 0%, #004D38 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '60px 40px',
      }}
        className="auth-left-panel"
      >
        {/* Bangladesh flag red circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: '#F42A41',
            top: '50%',
            left: '45%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.08 }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.6 }}
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            top: '50%',
            left: '45%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '48px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '6px',
            lineHeight: 1.1,
            marginBottom: '16px',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            DAKO
          </div>

          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '22px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '8px',
            lineHeight: 1.4,
          }}>
            জরুরি সেবা ব্যবস্থা
          </div>

          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}>
            National Emergency Dispatch
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '60px' }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              height: '2px',
              background: 'rgba(255,255,255,0.3)',
              margin: '0 auto 48px',
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          style={{
            position: 'absolute',
            bottom: '48px',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 400,
            lineHeight: 1.6,
          }}>
            সারাদেশে জীবন রক্ষায় নিবেদিত
          </div>
        </motion.div>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto',
        background: `linear-gradient(rgba(12, 18, 25, 0.6), rgba(12, 18, 25, 0.8)), url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            width: '100%', 
            maxWidth: '520px',
            background: 'rgba(18, 26, 36, 0.65)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '40px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Back button */}
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ x: -4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#8899AA',
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '32px',
              padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </motion.button>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '26px',
              fontWeight: 700,
              color: '#E8EDF2',
              margin: '0 0 6px',
            }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#5A6A7A',
              margin: 0,
            }}>
              {isLogin
                ? 'Sign in to access the emergency dispatch system'
                : `Register as a new ${activeRole === 'USER' ? 'citizen' : activeRole === 'RESPONDER' ? 'responder' : 'admin'}`
              }
            </p>
          </div>

          {/* ── Role Tabs ── */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
          }}>
            {[
              { key: 'USER', label: 'Citizen', icon: User, color: '#006A4E' },
              { key: 'RESPONDER', label: 'Responder', icon: Siren, color: '#F42A41' },
              { key: 'ADMIN', label: 'Admin', icon: UserCog, color: '#D4A853' },
            ].map((tab) => {
              const active = activeRole === tab.key;
              const TabIcon = tab.icon;
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveRole(tab.key)}
                  whileHover={!active ? { y: -1 } : {}}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    background: active ? `${tab.color}18` : 'rgba(17, 29, 43, 0.88)',
                    border: `1.5px solid ${active ? tab.color : 'rgba(0, 106, 78, 0.15)'}`,
                    borderRadius: '10px',
                    color: active ? tab.color : '#8899AA',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="activeRoleIndicator"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '20%',
                        right: '20%',
                        height: '2px',
                        background: tab.color,
                        borderRadius: '2px 2px 0 0',
                      }}
                    />
                  )}
                  <TabIcon size={14} /> {tab.label}
                </motion.button>
              );
            })}
          </div>

          {/* ── Login / Register Toggle ── */}
          <div style={{
            display: 'flex',
            borderRadius: '10px',
            background: 'rgba(17, 29, 43, 0.88)',
            border: '1px solid rgba(0, 106, 78, 0.15)',
            padding: '3px',
            marginBottom: '24px',
          }}>
            {[
              { mode: true, label: 'Login', icon: LogIn },
              { mode: false, label: 'Register', icon: UserPlus },
            ].map((item) => {
              const active = isLogin === item.mode;
              const ItemIcon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  onClick={() => setIsLogin(item.mode)}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: active ? '#006A4E20' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: active ? '#00896A' : '#5A6A7A',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <ItemIcon size={14} /> {item.label}
                </motion.button>
              );
            })}
          </div>

          {/* ── Form Card ── */}
          <div style={{
            background: 'rgba(17, 29, 43, 0.88)',
            border: '1px solid rgba(0, 106, 78, 0.15)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key={`login-${activeRole}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  onSubmit={handleLogin}
                >
                  <motion.div variants={itemVariants}>
                    <FormField
                      icon={Phone}
                      label="Phone Number"
                      placeholder="Enter mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      icon={Lock}
                      label="Password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      suffix={<PwdToggle show={showPassword} toggle={() => setShowPassword(!showPassword)} />}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} style={{ marginTop: '8px' }}>
                    <SubmitButton loading={loading} label="Sign In" icon={ArrowRight} />
                  </motion.div>
                </motion.form>
              ) : (
                <motion.form
                  key={`register-${activeRole}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  onSubmit={handleRegister}
                >
                  <motion.div variants={itemVariants}>
                    <FormField
                      icon={User}
                      label="Full Name"
                      placeholder="Enter your full name"
                      name="fullName"
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      icon={IdCard}
                      label="National ID"
                      placeholder="Enter NID number"
                      name="nid"
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      icon={Phone}
                      label="Phone Number"
                      placeholder="Enter mobile number"
                      name="phoneNumber"
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      icon={Lock}
                      label="Password"
                      placeholder="Create a password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      onChange={handleChange}
                      required
                      suffix={<PwdToggle show={showPassword} toggle={() => setShowPassword(!showPassword)} />}
                    />
                  </motion.div>

                  {activeRole === 'RESPONDER' && (
                    <>
                      <motion.div variants={itemVariants}>
                        <div style={{ marginBottom: '18px' }}>
                          <label style={{
                            display: 'block',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#8899AA',
                            marginBottom: '8px',
                            letterSpacing: '0.3px',
                          }}>
                            Service Type
                          </label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {SERVICE_TYPES.map(st => {
                              const active = formData.serviceType === st.key;
                              const StIcon = st.icon;
                              return (
                                <motion.button
                                  key={st.key}
                                  type="button"
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setFormData({ ...formData, serviceType: st.key })}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: active ? `${st.color}20` : 'rgba(12, 18, 25, 0.6)',
                                    border: `1.5px solid ${active ? st.color : 'rgba(0, 106, 78, 0.15)'}`,
                                    color: active ? st.color : '#8899AA',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontFamily: "'Inter', sans-serif",
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <StIcon size={13} /> {st.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          icon={Car}
                          label="Vehicle Registration"
                          placeholder="Vehicle reg. number (optional)"
                          name="vehicleRegistrationNumber"
                          onChange={handleChange}
                        />
                      </motion.div>
                    </>
                  )}

                  {activeRole === 'USER' && (
                    <>
                      <motion.div variants={itemVariants}>
                        <FormField
                          icon={MapPin}
                          label="Home Address"
                          placeholder="Enter your home address"
                          name="homeAddress"
                          onChange={handleChange}
                          required
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <FormField
                          icon={Contact}
                          label="Emergency Contact"
                          placeholder="Emergency contact number"
                          name="emergencyContactNumber"
                          onChange={handleChange}
                        />
                      </motion.div>
                    </>
                  )}

                  {activeRole === 'ADMIN' && (
                    <motion.div variants={itemVariants}>
                      <FormField
                        icon={MapPin}
                        label="Office Address"
                        placeholder="Admin headquarters address"
                        name="homeAddress"
                        onChange={handleChange}
                      />
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} style={{ marginTop: '8px' }}>
                    <SubmitButton loading={loading} label="Create Account" icon={UserPlus} />
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              color: '#5A6A7A',
            }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <motion.button
                onClick={() => setIsLogin(!isLogin)}
                whileHover={{ color: '#00896A' }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#006A4E',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                {isLogin ? 'Register' : 'Sign In'}
              </motion.button>
            </span>
          </motion.div>

        </motion.div>
      </div>

      {/* Responsive: hide left panel on mobile */}
      <style>{`
        @media (max-width: 900px) {
          .auth-left-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function PwdToggle({ show, toggle }) {
  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'none',
        border: 'none',
        color: '#5A6A7A',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </motion.button>
  );
}

function FormField({ icon: Icon, label, placeholder, type = 'text', value, onChange, name, required, suffix }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{
        display: 'block',
        fontFamily: "'Inter', sans-serif",
        fontSize: '12px',
        fontWeight: 500,
        color: '#8899AA',
        marginBottom: '6px',
        letterSpacing: '0.3px',
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: focused ? 'rgba(0, 106, 78, 0.06)' : 'rgba(12, 18, 25, 0.6)',
        border: `1.5px solid ${focused ? '#006A4E' : 'rgba(0, 106, 78, 0.15)'}`,
        borderRadius: '10px',
        padding: '0 14px',
        transition: 'all 0.25s ease',
        boxShadow: focused ? '0 0 0 3px rgba(0, 106, 78, 0.1)' : 'none',
      }}>
        <Icon
          size={16}
          color={focused ? '#006A4E' : '#5A6A7A'}
          style={{ marginRight: '10px', flexShrink: 0, transition: 'color 0.25s' }}
        />
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            padding: '12px 0',
            background: 'transparent',
            border: 'none',
            color: '#E8EDF2',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            minWidth: 0,
          }}
        />
        {suffix}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label, icon: Icon }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ boxShadow: '0 4px 20px rgba(0, 106, 78, 0.3)', y: -1 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        padding: '14px 20px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #006A4E, #00896A)',
        color: '#FFFFFF',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
        opacity: loading ? 0.6 : 1,
        boxShadow: '0 2px 12px rgba(0, 106, 78, 0.2)',
      }}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader size={18} />
        </motion.div>
      ) : (
        <>
          <span>{label}</span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Icon size={16} />
          </motion.div>
        </>
      )}
    </motion.button>
  );
}
