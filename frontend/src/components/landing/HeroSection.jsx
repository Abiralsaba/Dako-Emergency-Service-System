/*
  Hero Section — First viewport of the landing page.
  Shows DAKO branding with Bangladeshi identity,
  Bengali subtitle, and Login/Register entry points.
*/
import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { ChevronDown, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../../assets/bangladesh-hero.png';


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
      {/* Background image — Dhaka cityscape, zooms on scroll */}
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
          alt="Aerial view of Dhaka cityscape with emergency services"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        {/* Dark gradient overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(12,18,25,0.82) 0%, rgba(12,18,25,0.55) 35%, rgba(12,18,25,0.65) 55%, rgba(12,18,25,0.88) 100%)',
          }}
        />
      </motion.div>

      {/* Subtle geometric pattern overlay (Kantha-inspired) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,106,78,0.012) 3px, rgba(0,106,78,0.012) 6px)',
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
          background: 'radial-gradient(ellipse at center, rgba(12,18,25,0.7) 0%, rgba(12,18,25,0.2) 60%, transparent 80%)',
          padding: '60px 80px',
          borderRadius: '32px',
        }}
      >
        {/* Accent line — green to gold */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #006A4E, #D4A853, transparent)',
            margin: '0 auto 24px',
            transformOrigin: 'center',
          }}
        />

        {/* Bengali subtitle above title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            fontFamily: "'Noto Sans Bengali', 'Poppins', sans-serif",
            fontSize: '18px',
            letterSpacing: '3px',
            color: '#D4A853',
            textTransform: 'uppercase',
            marginBottom: '16px',
            textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 30px rgba(212,168,83,0.3)',
          }}
        >
          জরুরি সেবা ব্যবস্থা — বাংলাদেশ
        </motion.p>

        {/* Main DAKO title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(64px, 12vw, 150px)',
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1,
            letterSpacing: '20px',
            textTransform: 'uppercase',
            textShadow:
              '0 0 60px rgba(0,106,78,0.7), 0 0 120px rgba(0,106,78,0.3), 0 10px 30px rgba(0,0,0,0.9)',
            margin: '10px 0',
          }}
        >
          DAKO
        </motion.h1>

        {/* English subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '6px',
            color: '#00C896',
            textTransform: 'uppercase',
            marginTop: '12px',
            textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,137,106,0.4)',
          }}
        >
          National Emergency Dispatch
        </motion.p>

        {/* Bengali tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif",
            fontSize: '18px',
            color: '#C8D4E0',
            marginTop: '16px',
            fontWeight: 400,
            letterSpacing: '1px',
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          সারাদেশে জীবন রক্ষায় নিবেদিত — Protecting lives across the nation
        </motion.p>

        {/* Accent line below — green to gold */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
          style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #D4A853, #006A4E, transparent)',
            margin: '28px auto 0',
            transformOrigin: 'center',
          }}
        />

        {/* Login & Register Buttons */}
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
          {/* Login Button — Bangladesh Green */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 35px rgba(0,106,78,0.5), 0 0 80px rgba(0,106,78,0.15)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?mode=login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 36px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(0,106,78,0.2), rgba(0,106,78,0.08))',
              border: '1px solid rgba(0,106,78,0.4)',
              color: '#00896A',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 20px rgba(0,106,78,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
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
                background: 'linear-gradient(90deg, transparent, rgba(0,106,78,0.12), transparent)',
                pointerEvents: 'none',
              }}
            />
            <LogIn size={20} />
            <span>Login</span>
          </motion.button>

          {/* Register Button — Flag Red */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 35px rgba(244,42,65,0.4), 0 0 80px rgba(244,42,65,0.12)',
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?mode=register')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 36px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(244,42,65,0.15), rgba(244,42,65,0.05))',
              border: '1px solid rgba(244,42,65,0.35)',
              color: '#F42A41',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 20px rgba(244,42,65,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
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
                background: 'linear-gradient(90deg, transparent, rgba(244,42,65,0.1), transparent)',
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
            fontFamily: "'Poppins', sans-serif",
            fontSize: '10px',
            letterSpacing: '4px',
            color: 'rgba(0,106,78,0.6)',
            textTransform: 'uppercase',
          }}
        >
          Scroll to Explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} color="rgba(0,106,78,0.6)" />
        </motion.div>
      </motion.div>
    </section>
  );
}
