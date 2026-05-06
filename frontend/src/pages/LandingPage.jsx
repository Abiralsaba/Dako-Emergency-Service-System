/*
  =========================================
  LANDING PAGE ORCHESTRATOR
  =========================================
  This component manages the main scroll-driven landing experience.
  It uses Framer Motion's useScroll to feed parallax values into:
  1. HeroSection (Page 1)
  2. MarsRevealSection (Page 2)
  3. EmergencyTriggerSection (Page 3)
*/
import React, { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import StarField from '../components/3d/StarField';
import HeroSection from '../components/landing/HeroSection';
import MarsRevealSection from '../components/landing/MarsRevealSection';
import EmergencyTriggerSection from '../components/landing/EmergencyTriggerSection';

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

      {/* Scene 1 — Spaceship window with User Login/Register */}
      <HeroSection scrollYProgress={scrollYProgress} />

      {/* Scene 2 — Mars surface with service cards */}
      <MarsRevealSection scrollYProgress={scrollYProgress} />

      {/* Scene 3 — Emergency service trigger portals */}
      <EmergencyTriggerSection />
    </div>
  );
}
