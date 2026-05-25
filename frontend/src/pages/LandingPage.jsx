/*
  =========================================
  LANDING PAGE ORCHESTRATOR
  =========================================
  This component manages the main scroll-driven landing experience.
  It uses Framer Motion's useScroll to feed parallax values into:
  1. HeroSection (Page 1)
  2. MarsRevealSection (Page 2)
*/
import React, { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import StarField from '../components/3d/StarField';
import HeroSection from '../components/landing/HeroSection';
import MarsRevealSection from '../components/landing/MarsRevealSection';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [starScroll, setStarScroll] = React.useState(0);
  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => setStarScroll(v));
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        background: 'var(--bg-deep)',
      }}
    >
      {/* Fixed starfield background — always visible */}
      <StarField scrollProgress={starScroll} />

      {/* Scene 1 — Hero section with DAKO branding and Login/Register */}
      <HeroSection scrollYProgress={scrollYProgress} />

      {/* Scene 2 — Emergency services showcase with Bangladesh stats */}
      <MarsRevealSection scrollYProgress={scrollYProgress} />
    </div>
  );
}
