import React from 'react';
import { motion } from 'framer-motion';

export default function SpecialistSeal() {
  return (
    <div className="n-specialist-seal" style={{ position: 'relative', width: 60, height: 60 }}>
      {/* Outer rotating ring */}
      <motion.svg
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="10 20"
          style={{ opacity: 0.4 }}
        />
      </motion.svg>

      {/* Hexagon core */}
      <div style={{
        position: 'absolute',
        inset: '15%',
        background: 'rgba(0, 200, 151, 0.1)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(0, 200, 151, 0.5)',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00c897',
        fontSize: '10px',
        fontWeight: '900',
        textShadow: '0 0 10px rgba(0, 200, 151, 0.5)'
      }}>
        VERIFIED
      </div>

      {/* Pulse effect */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid #00c897',
          boxShadow: '0 0 20px #00c897',
        }}
        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
    </div>
  );
}
