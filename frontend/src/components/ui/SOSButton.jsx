import React from 'react';
import { motion } from 'framer-motion';

export default function SOSButton({ onClick, disabled, typeLabel }) {
  const buttonText = typeLabel ? `Choose ${typeLabel}` : 'Choose Service';
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        style={{
          width: '100%', 
          padding: '16px',
          borderRadius: '12px',
          background: disabled ? '#374151' : '#F1F5F9', // Uber's light grey/white button
          border: 'none', 
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled ? '#9CA3AF' : '#121212', // Black text for contrast
          fontSize: '18px', 
          fontWeight: 600, 
          fontFamily: "'Inter', sans-serif",
          transition: 'all 0.2s ease',
        }}
      >
        {buttonText}
      </motion.button>
    </div>
  );
}
