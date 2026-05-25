/*
  Services Section — Second viewport of the landing page.
  Showcases the three core emergency services with
  Bangladesh-specific context and national statistics.
*/
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Flame, Stethoscope, Clock, Map, Users, HeartPulse, Sparkles } from 'lucide-react';

const services = [
  {
    icon: Stethoscope,
    title: 'জরুরি চিকিৎসা',
    titleEn: 'Medical Response',
    desc: 'Advanced life-support ambulance teams deployed across all 64 districts, ensuring rapid medical care reaches every corner of Bangladesh.',
    color: '#10B981',
    stat: '< 4 min',
    statLabel: 'Response Time',
  },
  {
    icon: Flame,
    title: 'অগ্নিনির্বাপণ',
    titleEn: 'Fire Service',
    desc: 'Bangladesh Fire Service & Civil Defence units equipped with modern suppression systems for industrial, residential, and wildfire emergencies.',
    color: '#EF4444',
    stat: '24/7',
    statLabel: 'Active Duty',
  },
  {
    icon: ShieldCheck,
    title: 'আইন প্রয়োগ',
    titleEn: 'Law Enforcement',
    desc: 'Bangladesh Police community patrol units providing safety and security through real-time coordination and GPS-based dispatch.',
    color: '#3A7BD5',
    stat: '999',
    statLabel: 'Emergency Hotline',
  },
];

const stats = [
  { icon: Clock, label: 'Average Response', value: '< 4 min' },
  { icon: Map, label: 'Coverage Area', value: '64 Districts' },
  { icon: Users, label: '8 Divisions', value: 'Nationwide' },
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
        background: 'rgba(17, 29, 43, 0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,106,78,0.12)',
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
            fontFamily: "'Poppins', sans-serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#f8fafc',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {service.title}
          </h3>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: '#8899AA',
            fontWeight: 400,
          }}>
            {service.titleEn}
          </span>
        </div>
      </div>

      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        lineHeight: 1.6,
        color: '#8899AA',
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
        borderTop: '1px solid rgba(0,106,78,0.1)'
      }}>
        <span style={{
          fontFamily: "'Poppins', sans-serif",
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
          color: '#5A6A7A',
          fontWeight: 500
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
      id="services-section"
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
      {/* Background gradient — warm green tones */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,106,78,0.12) 0%, rgba(12,18,25,0.98) 70%)',
        }} />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(12,18,25,0.8) 0%, rgba(12,18,25,0.3) 40%, rgba(12,18,25,0.3) 60%, rgba(12,18,25,0.9) 100%)',
        }} />
      </div>

      {/* Content */}
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
          {/* Badge pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '100px',
            background: 'rgba(0,106,78,0.08)',
            border: '1px solid rgba(0,106,78,0.2)',
            backdropFilter: 'blur(10px)',
            marginBottom: '24px'
          }}>
            <Sparkles size={14} color="#D4A853" strokeWidth={1.5} />
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#D4A853',
              letterSpacing: '1px'
            }}>
              DAKO জরুরি সেবা
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 300,
            color: '#ffffff',
            margin: '0 0 12px',
            lineHeight: 1.1,
            letterSpacing: '-2px',
          }}>
            তিন সেবা।{' '}
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>
              এক বাংলাদেশ।
            </span>
          </h2>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: '#8899AA',
            marginBottom: '4px',
            fontWeight: 400,
            letterSpacing: '2px',
          }}>
            Three Services. One Bangladesh.
          </p>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: '#8899AA',
            maxWidth: '600px',
            margin: '16px auto 0',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Coordinating medical, fire, and police resources through an intelligent dispatch network — serving every division, district, and upazila.
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
            <ServiceCard key={s.titleEn} service={s} index={i} />
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
                color: '#D4A853'
              }}>
                <stat.icon size={28} strokeWidth={1} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '22px',
                  fontWeight: 400,
                  color: '#ffffff',
                  letterSpacing: '-0.5px'
                }}>
                  {stat.value}
                </span>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#5A6A7A',
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
