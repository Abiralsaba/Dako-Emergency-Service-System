import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';

export default function AuthSection({ isAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <section
      id="auth-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow behind the panel */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-100px' }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '11px',
              letterSpacing: '5px',
              color: 'rgba(0,240,255,0.6)',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Command Center
          </p>
          <h2
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '28px',
              fontWeight: 800,
              color: '#e2e8f0',
              margin: 0,
            }}
          >
            {isAuthenticated ? 'Welcome Back' : isLogin ? 'Authenticate' : 'Enroll'}
          </h2>
        </div>

        {/* === LOGGED-IN STATE: Dashboard CTA === */}
        {isAuthenticated ? (
          <div
            className="glass-panel hud-border"
            style={{
              borderRadius: '20px',
              padding: '48px 32px',
              textAlign: 'center',
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(0,240,255,0)',
                  '0 0 40px rgba(0,240,255,0.15)',
                  '0 0 20px rgba(0,240,255,0)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                margin: '0 auto 24px',
                background: 'rgba(0,240,255,0.08)',
                border: '2px solid rgba(0,240,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Rocket size={32} color="#00f0ff" />
            </motion.div>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                marginBottom: '32px',
                lineHeight: 1.6,
              }}
            >
              Your session is active. Access the dispatch dashboard to manage emergencies.
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(0,240,255,0.3)',
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(16,185,129,0.1))',
                color: '#00f0ff',
                fontFamily: "'Orbitron', monospace",
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Enter Command Center
            </motion.button>
          </div>
        ) : (
          <>
            {/* Auth mode toggle */}
            <div
              style={{
                display: 'flex',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: '32px',
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
                      padding: '12px',
                      background: active
                        ? 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(16,185,129,0.1))'
                        : 'transparent',
                      border: 'none',
                      color: active ? '#00f0ff' : '#64748b',
                      fontFamily: "'Orbitron', monospace",
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '2px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      position: 'relative',
                    }}
                  >
                    {label}
                    {active && (
                      <motion.div
                        layoutId="auth-tab-indicator"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '20%',
                          right: '20%',
                          height: '2px',
                          background:
                            'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Glassmorphism card with HUD border */}
            <div
              className="glass-panel hud-border"
              style={{
                borderRadius: '20px',
                padding: '40px 32px',
              }}
            >
              {/* Dark-theme override wrapper for the auth forms */}
              <div className="auth-dark-override">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LoginForm switchMode={() => setIsLogin(false)} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RegisterForm switchMode={() => setIsLogin(true)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
