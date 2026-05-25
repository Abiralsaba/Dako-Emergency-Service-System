import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Flame, Stethoscope, Clock, Map, Users, HeartPulse, Sparkles } from 'lucide-react';
// Video background replaced with CSS gradient (original asset removed)

const services = [
  {
    icon: Stethoscope,
    title: 'Medical Response',
    desc: 'Rapid-deployment medical teams equipped with advanced life support, reaching any colony sector under 4 minutes.',
    color: '#ef4444', 
    stat: '98.7%',
    statLabel: 'Save Rate',
  },
  {
    icon: Flame,
    title: 'Fire Intercept',
    desc: 'Thermal detection networks instantly deploy suppression units, ensuring zero-delay response to critical incidents.',
    color: '#f97316',
    stat: '< 2 min',
    statLabel: 'Deploy Time',
  },
  {
    icon: ShieldCheck,
    title: 'Law Enforcement',
    desc: 'Community-focused patrol units providing safety and security, guided by real-time spatial analysis.',
    color: '#3b82f6',
    stat: '24/7',
    statLabel: 'Coverage',
  },
];

const stats = [
  { icon: Clock, label: 'Average Response', value: '< 3 minutes' },
  { icon: Map, label: 'Protected Area', value: '12,000 km²' },
  { icon: Users, label: 'Active Personnel', value: '340+' },
  { icon: HeartPulse, label: 'System Uptime', value: '99.9%' },
];

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      style={{
        borderRadius: '16px',
        background: 'rgba(20, 20, 22, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <service.icon size={24} color={service.color} strokeWidth={1.5} />
        </div>
        <div>
          <h3 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '20px',
            fontWeight: 500,
            color: '#f8fafc',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {service.title}
          </h3>
        </div>
      </div>

      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        lineHeight: 1.6,
        color: '#94a3b8',
        margin: 0,
        fontWeight: 400
      }}>
        {service.desc}
      </p>

      <div style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '24px',
          fontWeight: 300,
          color: service.color,
          letterSpacing: '-1px'
        }}>
          {service.stat}
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          color: '#64748b',
          fontWeight: 400
        }}>
          {service.statLabel}
        </span>
      </div>
    </motion.div>
  );
}

export default function MarsRevealSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      id="mars-section"
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* ── GRADIENT BACKGROUND (replaces missing video) ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0.95) 70%)',
        }} />
        {/* Vignette overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.9) 100%)',
        }} />
      </div>

      {/* ── Content ── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1100px',
        width: '100%',
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          style={{ textAlign: 'center', marginBottom: '80px' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '100px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            marginBottom: '24px'
          }}>
            <Sparkles size={14} color="#e5e7eb" strokeWidth={1.5} />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#e5e7eb',
              letterSpacing: '0.5px'
            }}>
              DAKO Unified System
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 300,
            color: '#ffffff',
            margin: '0 0 24px',
            lineHeight: 1.1,
            letterSpacing: '-2px',
          }}>
            Three Services.{' '}
            <span style={{ fontWeight: 600, color: '#f8fafc' }}>
              One Bangladesh.
            </span>
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '18px',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Coordinating medical, fire, and police resources through an intelligent network to ensure the fastest response anywhere in the country.
          </p>
        </motion.div>

        {/* Service cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '80px',
        }}>
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '40px',
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: [0.25, 1, 0.5, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{
                color: '#e2e8f0'
              }}>
                <stat.icon size={28} strokeWidth={1} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '24px',
                  fontWeight: 300,
                  color: '#ffffff',
                  letterSpacing: '-0.5px'
                }}>
                  {stat.value}
                </span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
