import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { memo } from "react";

/**
 * ScrollAura - A premium, liquid scroll progress indicator.
 * Displays a thin glowing line at the top of the viewport.
 * Optimized with GPU-accelerated transforms and spring physics.
 */
const ScrollAura = memo(() => {
  const { scrollYProgress } = useScroll();
  
  // Smooth spring for a "liquid" flowing feel
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Dynamic opacity that fades out at the very top/bottom
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      className="pn-scroll-aura"
      style={{
        scaleX,
        opacity,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, var(--color-primary), #39FF14)',
        transformOrigin: '0%',
        zIndex: 1000000,
        pointerEvents: 'none',
        willChange: 'transform',
        boxShadow: '0 0 15px var(--color-primary), 0 0 5px #39FF14'
      }}
    >
      {/* Liquid Pulse End-cap */}
      <motion.div
        animate={{ 
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#39FF14',
          boxShadow: '0 0 20px #39FF14'
        }}
      />
    </motion.div>
  );
});

export default ScrollAura;
