/*
  =========================================
  HERO SECTION (SCENE 1)
  =========================================
  The initial viewport the user sees upon loading.
  Displays the main DAKO branding and Login/Register entry points.
  Parallax animations are synced to master scroll.
*/
import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { ChevronDown, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../../assets/ChatGPT Image Apr 11, 2026, 07_42_14 PM.png';


export default function HeroSection({ scrollYProgress }) {
  const navigate = useNavigate();

  const scale = useTransform(scrollYProgress, [0, 0.35], [1, 1.6]);
  const opacity = useTransform(scrollYProgress, [0.18, 0.4], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const titleOpacity = useTransform(scrollYProgress, [0.15, 0.3], [1, 0]);

  return (
    <section
      id="hero-section"
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background image — zooms on scroll */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          scale,
          opacity,
        }}
      >
        <img
          src={heroImg}
          alt="Spaceship cockpit looking out at Mars"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        {/* Dark gradient overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(3,7,18,0.5) 0%, rgba(3,7,18,0.2) 40%, rgba(3,7,18,0.6) 100%)',
          }}
        />
      </motion.div>

      {/* Scanline overlay for cinematic effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Title overlay */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          y: titleY,
          opacity: titleOpacity,
          pointerEvents: 'auto',
        }}
      >
        {/* Horizontal accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
            margin: '0 auto 24px',
            transformOrigin: 'center',
          }}
        />

        {/* Subtitle tag above title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '13px',
            letterSpacing: '6px',
            color: 'rgba(0,240,255,0.7)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Emergency Dispatch System
        </motion.p>

        {/* Main DAKO title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(64px, 12vw, 140px)',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '12px',
            textShadow:
              '0 0 60px rgba(0,240,255,0.4), 0 0 120px rgba(0,240,255,0.15)',
            margin: 0,
          }}
        >
          DAKO
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            marginTop: '20px',
            fontWeight: 300,
            letterSpacing: '1px',
          }}
        >
          Protecting lives across the frontier
        </motion.p>

        {/* Accent line below */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
          style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
            margin: '28px auto 0',
            transformOrigin: 'center',
          }}
        />

        {/* ── User Login & Register Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '40px',
            flexWrap: 'wrap',
          }}
        >
          {/* Login Button */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 35px rgba(0,240,255,0.5), 0 0 80px rgba(0,240,255,0.15)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?mode=login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 36px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05))',
              border: '1px solid rgba(0,240,255,0.35)',
              color: '#00f0ff',
              fontFamily: "'Orbitron', monospace",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 20px rgba(0,240,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.1), transparent)',
                pointerEvents: 'none',
              }}
            />
            <LogIn size={20} />
            <span>Login</span>
          </motion.button>

          {/* Register Button */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 35px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.15)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?mode=register')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 36px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
              border: '1px solid rgba(16,185,129,0.35)',
              color: '#10b981',
              fontFamily: "'Orbitron', monospace",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 20px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent)',
                pointerEvents: 'none',
              }}
            />
            <UserPlus size={20} />
            <span>Register</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll-to-explore indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '10px',
            letterSpacing: '4px',
            color: 'rgba(0,240,255,0.5)',
            textTransform: 'uppercase',
          }}
        >
          Scroll to Explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} color="rgba(0,240,255,0.5)" />
        </motion.div>
      </motion.div>
    </section>
  );
}
