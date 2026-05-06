/*
  =========================================
  EMERGENCY TRIGGER SECTION (SCENE 3)
  =========================================
  Dedicated portal triggers for the specific Responder roles.
  - Police
  - Fire Service
  - Ambulance
  Clicking these opens the RoleAuthModal.
*/
import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Shield, Flame, Siren, AlertTriangle, Radio } from 'lucide-react';
import marsImg from '../../assets/ChatGPT Image Apr 11, 2026, 07_30_45 PM.png';
import RoleAuthModal from './RoleAuthModal';


const emergencyServices = [
  {
    id: 'police',
    role: 'POLICE',
    label: 'Police',
    subtitle: 'Law Enforcement Unit',
    desc: 'Tactical patrol & threat response',
    icon: Shield,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
    gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    pulseColor: 'rgba(59,130,246,0.3)',
  },
  {
    id: 'fire',
    role: 'FIRE_SERVICE',
    label: 'Fire Service',
    subtitle: 'Fire Intercept Unit',
    desc: 'Rapid fire suppression & rescue',
    icon: Flame,
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.4)',
    gradient: 'linear-gradient(135deg, #991b1b, #ef4444)',
    pulseColor: 'rgba(239,68,68,0.3)',
  },
  {
    id: 'ambulance',
    role: 'AMBULANCE',
    label: 'Ambulance',
    subtitle: 'Medical Response Unit',
    desc: 'Emergency medical dispatch',
    icon: Siren,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    gradient: 'linear-gradient(135deg, #065f46, #10b981)',
    pulseColor: 'rgba(16,185,129,0.3)',
  },
];

function TriggerButton({ service, index, onTrigger }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.2, ease: 'easeOut' }}
      style={{ flex: '1 1 280px', maxWidth: '340px' }}
    >
      <motion.button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onTrigger(service)}
        whileHover={{ scale: 1.04, y: -8 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: '100%',
          padding: '0',
          borderRadius: '20px',
          background: 'rgba(8, 12, 24, 0.85)',
          backdropFilter: 'blur(24px)',
          border: `1.5px solid ${hovered ? service.color : service.glow.replace('0.4', '0.15')}`,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.3s ease',
          boxShadow: hovered
            ? `0 0 50px ${service.glow}, 0 25px 50px rgba(0,0,0,0.5)`
            : `0 10px 30px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Top glow accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${service.color}, transparent)`,
            opacity: hovered ? 1 : 0.4,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Animated pulse ring behind icon */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '50px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: service.pulseColor,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div style={{ padding: '36px 28px 32px', position: 'relative', zIndex: 1 }}>
          {/* Icon container */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: `${service.color}12`,
              border: `1.5px solid ${service.color}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              position: 'relative',
            }}
          >
            <Icon
              size={32}
              color={service.color}
              style={{
                filter: hovered ? `drop-shadow(0 0 12px ${service.glow})` : 'none',
                transition: 'filter 0.3s',
              }}
            />

            {/* Corner accents on icon box */}
            {[
              { top: '-1px', left: '-1px', borderTop: `2px solid ${service.color}`, borderLeft: `2px solid ${service.color}` },
              { top: '-1px', right: '-1px', borderTop: `2px solid ${service.color}`, borderRight: `2px solid ${service.color}` },
              { bottom: '-1px', left: '-1px', borderBottom: `2px solid ${service.color}`, borderLeft: `2px solid ${service.color}` },
              { bottom: '-1px', right: '-1px', borderBottom: `2px solid ${service.color}`, borderRight: `2px solid ${service.color}` },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  ...pos,
                  width: '10px',
                  height: '10px',
                  borderRadius: i === 0 ? '4px 0 0 0' : i === 1 ? '0 4px 0 0' : i === 2 ? '0 0 0 4px' : '0 0 4px 0',
                  opacity: hovered ? 1 : 0.4,
                  transition: 'opacity 0.3s',
                }}
              />
            ))}
          </div>

          {/* Service name */}
          <h3
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '20px',
              fontWeight: 800,
              color: '#e2e8f0',
              marginBottom: '6px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {service.label}
          </h3>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '10px',
              letterSpacing: '3px',
              color: service.color,
              textTransform: 'uppercase',
              marginBottom: '12px',
              opacity: 0.8,
            }}
          >
            {service.subtitle}
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {service.desc}
          </p>

          {/* Action bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              background: hovered
                ? `linear-gradient(135deg, ${service.color}25, ${service.color}10)`
                : `${service.color}08`,
              border: `1px solid ${service.color}${hovered ? '50' : '20'}`,
              transition: 'all 0.3s ease',
            }}
          >
            <Radio
              size={14}
              color={service.color}
              style={{
                animation: hovered ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
              }}
            />
            <span
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: service.color,
                textTransform: 'uppercase',
              }}
            >
              Access Portal
            </span>
          </div>
        </div>

        {/* Bottom gradient glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: `linear-gradient(to top, ${service.color}08, transparent)`,
            pointerEvents: 'none',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      </motion.button>
    </motion.div>
  );
}

export default function EmergencyTriggerSection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const handleTrigger = (service) => {
    setSelectedRole({
      role: service.role,
      label: service.subtitle,
      color: service.color,
    });
  };

  return (
    <>
      <section
        id="trigger-section"
        ref={sectionRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
        }}
      >
        {/* Background Mars vehicles image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <img
            src={marsImg}
            alt="Emergency response vehicles on Mars surface"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
            }}
          />
          {/* Heavy dark overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(3,7,18,0.85) 0%, rgba(3,7,18,0.65) 30%, rgba(3,7,18,0.6) 60%, rgba(3,7,18,0.9) 100%)',
            }}
          />
          {/* Vignette effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(3,7,18,0.5) 100%)',
            }}
          />
        </div>

        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.01) 3px, rgba(0,240,255,0.01) 6px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1200px',
            width: '100%',
          }}
        >
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '16px' }}
          >
            {/* Alert icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <AlertTriangle size={26} color="#ef4444" />
            </motion.div>

            <p
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '12px',
                letterSpacing: '5px',
                color: 'rgba(0,240,255,0.6)',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              Responder Access
            </p>
            <h2
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 'clamp(24px, 4vw, 42px)',
                fontWeight: 800,
                color: '#e2e8f0',
                margin: '0 0 16px',
                lineHeight: 1.2,
              }}
            >
              Emergency Service Portals
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#64748b',
                maxWidth: '550px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Select your service division to authenticate and access the
              DAKO emergency dispatch network.
            </p>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3 }}
            style={{
              width: '120px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
              margin: '0 auto 50px',
              transformOrigin: 'center',
            }}
          />

          {/* Trigger buttons grid */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '28px',
              flexWrap: 'wrap',
            }}
          >
            {emergencyServices.map((service, i) => (
              <TriggerButton
                key={service.id}
                service={service}
                index={i}
                onTrigger={handleTrigger}
              />
            ))}
          </div>

          {/* Bottom tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            style={{
              textAlign: 'center',
              marginTop: '50px',
            }}
          >
            <p
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '10px',
                letterSpacing: '4px',
                color: 'rgba(0,240,255,0.35)',
                textTransform: 'uppercase',
              }}
            >
              Together We Save Lives
            </p>
          </motion.div>
        </div>
      </section>

      {/* Auth modal for selected service */}
      <AnimatePresence>
        {selectedRole && (
          <RoleAuthModal
            role={selectedRole.role}
            roleLabel={selectedRole.label}
            color={selectedRole.color}
            onClose={() => setSelectedRole(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
