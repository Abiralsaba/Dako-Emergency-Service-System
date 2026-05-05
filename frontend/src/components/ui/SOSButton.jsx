import React from 'react';
import { motion } from 'framer-motion';

export default function SOSButton({ onClick, disabled }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        style={{
          width: '140px', height: '140px', borderRadius: '50%',
          background: disabled
            ? 'linear-gradient(135deg, #374151, #1f2937)'
            : 'linear-gradient(135deg, #e11d48, #be123c)',
          border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          color: '#fff', fontSize: '28px', fontWeight: 900, letterSpacing: '2px',
          boxShadow: disabled
            ? 'none'
            : '0 0 40px rgba(225, 29, 72, 0.4), 0 0 80px rgba(225, 29, 72, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: disabled ? 'none' : 'sosPulse 2s infinite',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        SOS
      </motion.button>
    </div>
  );
}
