/*
  =========================================
  AUTH PAGE - DAKO EMERGENCY SYSTEM
  =========================================
  Full-page authentication with code-editor themed design.
  Pixel-art campfire background displayed raw (no zoom/blur).
  Color palette matched to the background's purple/amber tones.
  Tabs for Citizen vs Responder vs Admin, toggles Login vs Register.
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, User, UserCog, LogIn, UserPlus,
  ArrowRight, Loader, Eye, EyeOff,
  Phone, Lock, MapPin, IdCard, Contact, Terminal, Sparkles,
  Siren, Car, Shield, Heart, Flame
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import bgImg from '../assets/auth-bg.png';

const SERVICE_TYPES = [
  { key: 'AMBULANCE', label: 'Ambulance', icon: Heart, color: '#10b981' },
  { key: 'FIRE_SERVICE', label: 'Fire Service', icon: Flame, color: '#ef4444' },
  { key: 'POLICE', label: 'Police', icon: Shield, color: '#3b82f6' },
  { key: 'EMERGENCY_CAR', label: 'Emergency Car', icon: Car, color: '#f59e0b' },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'login';

  // Core state
  const [activeRole, setActiveRole] = useState('USER');
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Auth context & navigation
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  // Registration form state
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

  // Submit login to backend
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

  // Submit registration — routes to citizen, responder, or admin endpoint
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

  // Line count for the code-editor gutter
  const getLineCount = () => {
    if (isLogin) return 6;
    if (activeRole === 'RESPONDER') return 10;
    if (activeRole === 'ADMIN') return 8;
    return 10;
  };
  const lineCount = getLineCount();

  // Stagger animations for form fields
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 }
    },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -30, filter: 'blur(10px)' },
    show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 24, mass: 1 } }
  };

  // Accent color changes based on active role
  const accentMap = { USER: '#10b981', RESPONDER: '#e11d48', ADMIN: '#f59e0b' };
  const accent = accentMap[activeRole] || '#10b981';

  // 3D Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXV = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotateYV = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = clientX / innerWidth - 0.5;
    const y = clientY / innerHeight - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      overflow: 'hidden',
      background: '#042f1d',
    }}>

      {/* ── RAW Background Image ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <motion.img
          src={bgImg}
          alt="Emergency rescue vehicles background"
          initial={{ scale: 1.15, filter: 'blur(10px)' }}
          animate={{ scale: 1.05, filter: 'blur(0px)' }}
          transition={{ duration: 15, ease: 'easeOut' }}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            display: 'block',
            willChange: 'transform'
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(4,47,29,0.5) 0%, rgba(4,47,29,0.3) 40%, rgba(4,47,29,0.7) 100%)',
            backdropFilter: 'blur(2px)'
          }}
        />
      </div>

      {/* Floating particles (sparks/embers) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
          animate={{ 
            y: [-20, -100, -200], 
            x: [0, Math.random() * 50 - 25, Math.random() * 50 - 25],
            opacity: [0, 0.8, 0] 
          }}
          transition={{ 
            duration: 4 + Math.random() * 4, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute', width: '4px', height: '4px', borderRadius: '50%',
            background: i % 3 === 0 ? '#10b981' : '#fbbf24', // Mix of green and amber sparks
            left: `${10 + Math.random() * 80}%`, bottom: `${10 + Math.random() * 40}%`,
            zIndex: 1, boxShadow: `0 0 10px ${i % 3 === 0 ? '#10b981' : '#fbbf24'}`
          }}
        />
      ))}

      {/* ── Main Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.9, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ 
          position: 'relative', zIndex: 2, width: '100%', maxWidth: '560px', perspective: '1000px',
          rotateX: rotateXV, rotateY: rotateYV, transformStyle: 'preserve-3d'
        }}
      >
        {/* Subtle dynamic highlight matching the accent color to give depth */}
        <motion.div 
          style={{
            position: 'absolute', inset: -2, borderRadius: '18px', zIndex: -1,
            background: `radial-gradient(circle at 50% 0%, ${accent}40 0%, transparent 60%)`,
            filter: 'blur(15px)',
            opacity: 0.8
          }}
        />

        {/* Back button */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ x: -5 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', color: '#e9d5ff',
            fontFamily: "'Orbitron', monospace", fontSize: '11px', letterSpacing: '3px',
            cursor: 'pointer', marginBottom: '28px', textTransform: 'uppercase',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          <ArrowLeft size={16} /> Back to DAKO
        </motion.button>

        {/* ── Role Tabs: User / Responder / Admin ── */}
        <div style={{ display: 'flex', position: 'relative', zIndex: 3 }}>
          {[
            { key: 'USER', label: 'Citizen', icon: User, color: '#10b981' },
            { key: 'RESPONDER', label: 'Responder', icon: Siren, color: '#e11d48' },
            { key: 'ADMIN', label: 'Admin', icon: UserCog, color: '#f59e0b' },
          ].map((tab) => {
            const active = activeRole === tab.key;
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveRole(tab.key)}
                whileHover={!active ? { y: -2 } : {}}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', padding: '13px 16px',
                  background: active ? 'rgba(4, 30, 20, 0.4)' : 'rgba(4, 30, 20, 0.2)',
                  border: `1px solid ${active ? tab.color + '50' : 'rgba(255,255,255,0.06)'}`,
                  borderBottom: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px 14px 0 0',
                  color: active ? tab.color : '#a7f3d0',
                  fontFamily: "'Orbitron', monospace", fontSize: '11px', fontWeight: 800,
                  letterSpacing: '1.5px', cursor: 'pointer', textTransform: 'uppercase',
                  transition: 'all 0.3s ease', position: 'relative', backdropFilter: 'blur(8px)',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="activeTabGlow"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    style={{
                      position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px',
                      background: `linear-gradient(90deg, transparent, ${tab.color}, transparent)`,
                      boxShadow: `0 0 20px ${tab.color}80`,
                    }}
                  />
                )}
                <TabIcon size={15} /> {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* ── Code Editor Window ── */}
        <div style={{
          background: 'rgba(4, 30, 20, 0.4)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none',
          borderRadius: '0 0 18px 18px', overflow: 'hidden',
          boxShadow: `0 30px 60px rgba(0,0,0,0.7), 0 0 80px ${accent}08`,
        }}>

          {/* Terminal title bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 22px', background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#ff5f56', '#ffbd2e', '#27c93f'].map((c, i) => (
                <motion.div
                  key={i} whileHover={{ scale: 1.3 }}
                  style={{ width: '11px', height: '11px', borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}60` }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={13} color="#64748b" />
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', color: '#94a3b8', letterSpacing: '1px' }}>
                {activeRole === 'USER' ? 'citizen' : activeRole === 'RESPONDER' ? 'responder' : 'admin'}_auth.dako
              </span>
            </div>
            <Sparkles size={13} color="#64748b" />
          </div>

          {/* Login / Register toggle */}
          <div style={{
            display: 'flex', margin: '20px 24px 8px', borderRadius: '10px',
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '3px',
          }}>
            {[
              { mode: true, label: 'Authenticate', icon: LogIn },
              { mode: false, label: 'Enroll', icon: UserPlus },
            ].map((item) => {
              const active = isLogin === item.mode;
              const ItemIcon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  onClick={() => setIsLogin(item.mode)}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: '11px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px',
                    background: active ? `${accent}18` : 'transparent',
                    border: 'none', borderRadius: '8px',
                    color: active ? accent : '#64748b',
                    fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: 700,
                    letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <ItemIcon size={13} /> {item.label}
                </motion.button>
              );
            })}
          </div>

          {/* Form area with line number gutter */}
          <div style={{ display: 'flex', padding: '14px 0 28px' }}>

            {/* Line numbers */}
            <div style={{
              padding: '0 14px 0 22px', borderRight: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column', userSelect: 'none',
            }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} style={{
                  fontFamily: 'monospace', fontSize: '13px', color: '#4c1d95',
                  height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Form fields */}
            <div style={{ flex: 1, padding: '0 24px 0 18px', overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.form
                    key={`login-${activeRole}`}
                    variants={containerVariants} initial="hidden" animate="show" exit="exit"
                    onSubmit={handleLogin}
                  >
                    <motion.div variants={itemVariants} style={commentStyle}>
                      <span style={{ color: '#f472b6' }}>#</span>
                      {`Initialize ${activeRole === 'USER' ? 'citizen' : activeRole === 'RESPONDER' ? 'responder' : 'admin'} session`}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FieldRow icon={Phone} label="phone" placeholder="Enter mobile number"
                        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} accent={accent} required />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FieldRow icon={Lock} label="passcode" placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)} accent={accent} required
                        suffix={<PwdToggle show={showPassword} toggle={() => setShowPassword(!showPassword)} />} />
                    </motion.div>

                    <motion.div variants={itemVariants} style={commentStyle}>
                      <span style={{ color: '#f472b6' }}>#</span> Execute handshake
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <ActionButton loading={loading} label="Authenticate" icon={ArrowRight} color={accent} />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ ...commentStyle, marginTop: '2px' }}>
                      <span style={{ color: '#c084fc' }}>return</span>
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}
                        style={{ color: accent }}>access_granted</motion.span>
                    </motion.div>
                  </motion.form>
                ) : (
                  <motion.form
                    key={`register-${activeRole}`}
                    variants={containerVariants} initial="hidden" animate="show" exit="exit"
                    onSubmit={handleRegister}
                  >
                    <motion.div variants={itemVariants} style={commentStyle}>
                      <span style={{ color: '#f472b6' }}>#</span>
                      {`Create new ${activeRole === 'USER' ? 'citizen' : activeRole === 'RESPONDER' ? 'responder' : 'admin'} record`}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FieldRow icon={User} label="name" placeholder="Full name" name="fullName" onChange={handleChange} accent={accent} required />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FieldRow icon={IdCard} label="nid" placeholder="National ID" name="nid" onChange={handleChange} accent={accent} required />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FieldRow icon={Phone} label="phone" placeholder="Mobile number" name="phoneNumber" onChange={handleChange} accent={accent} required />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FieldRow icon={Lock} label="passcode" placeholder="Create passcode" name="password"
                        type={showPassword ? 'text' : 'password'} onChange={handleChange} accent={accent} required
                        suffix={<PwdToggle show={showPassword} toggle={() => setShowPassword(!showPassword)} />} />
                    </motion.div>

                    {/* Responder-specific fields */}
                    {activeRole === 'RESPONDER' && (
                      <>
                        <motion.div variants={itemVariants} style={commentStyle}>
                          <span style={{ color: '#f472b6' }}>#</span> Select service type
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <div style={{ height: '54px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {SERVICE_TYPES.map(st => {
                              const active = formData.serviceType === st.key;
                              const StIcon = st.icon;
                              return (
                                <motion.button
                                  key={st.key} type="button"
                                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => setFormData({ ...formData, serviceType: st.key })}
                                  style={{
                                    padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                                    background: active ? `${st.color}25` : 'transparent',
                                    border: `1px solid ${active ? st.color : 'rgba(255,255,255,0.1)'}`,
                                    color: active ? st.color : '#64748b',
                                    fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                                    fontFamily: "'Orbitron', monospace",
                                  }}
                                >
                                  <StIcon size={12} /> {st.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <FieldRow icon={Car} label="vehicle" placeholder="Vehicle reg. number (optional)" name="vehicleRegistrationNumber" onChange={handleChange} accent={accent} />
                        </motion.div>
                      </>
                    )}

                    {/* Citizen-specific fields */}
                    {activeRole === 'USER' && (
                      <>
                        <motion.div variants={itemVariants}>
                          <FieldRow icon={MapPin} label="address" placeholder="Home address" name="homeAddress" onChange={handleChange} accent={accent} required />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <FieldRow icon={Contact} label="emergency" placeholder="Emergency contact" name="emergencyContactNumber" onChange={handleChange} accent={accent} />
                        </motion.div>
                      </>
                    )}

                    {/* Admin fields */}
                    {activeRole === 'ADMIN' && (
                      <motion.div variants={itemVariants}>
                        <FieldRow icon={MapPin} label="address" placeholder="Admin HQ" name="homeAddress" onChange={handleChange} accent={accent} />
                      </motion.div>
                    )}

                    <motion.div variants={itemVariants} style={commentStyle}>
                      <span style={{ color: '#f472b6' }}>#</span> Commit to database
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <ActionButton loading={loading} label="Confirm Enrollment" icon={UserPlus} color={accent} />
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 22px', background: 'rgba(0,0,0,0.4)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: '10px', color: '#4c1d95', fontFamily: 'monospace' }}>
              DAKO v3.0 — <span style={{ color: '#27c93f' }}>Online</span>
            </span>
            <span style={{ fontSize: '10px', color: '#4c1d95', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {activeRole}_MODE
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Password toggle button ── */
const PwdToggle = ({ show, toggle }) => (
  <motion.button
    type="button" onClick={toggle} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex' }}
  >
    {show ? <EyeOff size={15} /> : <Eye size={15} />}
  </motion.button>
);

/* ── Code-editor style field row ── */
function FieldRow({ icon: Icon, label, placeholder, type = 'text', value, onChange, name, accent, required, suffix }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ height: '54px', display: 'flex', alignItems: 'center' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#c084fc', whiteSpace: 'nowrap', marginRight: '6px' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748b', margin: '0 6px' }}>=</span>
      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#4ade80', marginRight: '4px' }}>"</span>

      <motion.div
        animate={focused ? { background: 'rgba(167,139,250,0.06)' } : { background: 'transparent' }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', borderRadius: '6px',
          padding: '0 8px', transition: 'background 0.3s',
        }}
      >
        <Icon size={14} color={focused ? accent : '#64748b'} style={{ marginRight: '8px', flexShrink: 0, transition: 'color 0.3s' }} />
        <input
          type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: '9px 0', background: 'transparent', border: 'none',
            borderBottom: `1px solid ${focused ? accent : 'rgba(255,255,255,0.08)'}`,
            color: '#f1f5f9', fontSize: '13px', fontFamily: "'Inter', sans-serif",
            outline: 'none', transition: 'border-color 0.3s', minWidth: 0,
          }}
        />
        {suffix}
      </motion.div>

      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#4ade80', marginLeft: '4px' }}>"</span>
    </div>
  );
}

/* ── Animated submit button ── */
function ActionButton({ loading, label, icon: Icon, color }) {
  return (
    <div style={{ height: '54px', display: 'flex', alignItems: 'center' }}>
      <motion.button
        type="submit" disabled={loading}
        whileHover={{ boxShadow: `0 0 30px ${color}50, 0 0 60px ${color}20`, y: -2 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: '100%', padding: '13px 20px', borderRadius: '10px',
          border: `1px solid ${color}50`,
          background: `linear-gradient(135deg, ${color}25, ${color}08)`,
          color: color, fontFamily: "'Orbitron', monospace", fontSize: '12px',
          fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          transition: 'all 0.3s ease', opacity: loading ? 0.5 : 1,
          boxShadow: `0 0 15px ${color}15`,
        }}
      >
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader size={17} />
          </motion.div>
        ) : (
          <>
            <span>{label}</span>
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Icon size={16} />
            </motion.div>
          </>
        )}
      </motion.button>
    </div>
  );
}

/* ── Comment line styling ── */
const commentStyle = {
  fontFamily: 'monospace', fontSize: '13px', color: '#64748b',
  height: '54px', display: 'flex', alignItems: 'center', fontStyle: 'italic', gap: '6px',
};
