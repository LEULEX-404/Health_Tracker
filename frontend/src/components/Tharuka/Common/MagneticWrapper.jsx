import { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

/**
 * A premium magnetic effect component that pulls its children toward the mouse.
 * Optimized with bounds caching to prevent layout thrashing.
 */
export default function MagneticWrapper({ children, strength = 0.35, range = 60, display = "block" }) {
  const ref = useRef(null);
  const bounds = useRef(null);
  
  // Spring physics for smooth "liquid" attraction
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    
    // Cache bounds on-demand for accuracy without constant getBoundingClientRect calls
    if (!bounds.current) {
        bounds.current = ref.current.getBoundingClientRect();
    }
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = bounds.current;
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Only apply if within magnetic range
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < range) {
        x.set(distanceX * strength);
        y.set(distanceY * strength);
    } else {
        x.set(0);
        y.set(0);
        bounds.current = null; // Reset for next entry
    }
  }, [strength, range, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    bounds.current = null;
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        display: display,
        willChange: 'transform'
      }}
    >
      {children}
    </motion.div>
  );
}
