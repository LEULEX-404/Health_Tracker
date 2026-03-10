import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  // Still use MotionValues for the ring's elastic physics
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // "Extreme" spring physics - 10k stiffness for instant snap
  const springConfig = { damping: 15, stiffness: 10000, mass: 0.01 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // If it's a touch device, don't even add the event listeners
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const moveCursor = (e) => {
      const { clientX, clientY } = e;
      
      // 1. Direct Style update for the dot - zero latency + precise centering
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate3d(-50%, -50%, 0)`;
      }
      
      // 2. Continuous spring update for the ring
      cursorX.set(clientX);
      cursorY.set(clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      const isInteractive = !!(
        target.closest('button') || 
        target.closest('a') || 
        target.closest('.pn-feat-card') ||
        target.closest('.pn-stat-card') ||
        window.getComputedStyle(target).cursor === 'pointer'
      );
      
      // Update the class directly on the DOM nodes to avoid React Re-renders
      if (isInteractive) {
        dotRef.current?.classList.add('hovering');
        ringRef.current?.classList.add('hovering');
      } else {
        dotRef.current?.classList.remove('hovering');
        ringRef.current?.classList.remove('hovering');
      }
    };

    const handleMouseLeave = () => {
      dotRef.current?.classList.add('hidden');
      ringRef.current?.classList.add('hidden');
    };
    const handleMouseEnter = () => {
      dotRef.current?.classList.remove('hidden');
      ringRef.current?.classList.remove('hidden');
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        ref={ringRef}
        className="pn-cursor-ring"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <div
        ref={dotRef}
        className="pn-cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999999,
          pointerEvents: 'none',
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      >
        <div className="pn-cursor-dot-inner" />
      </div>
    </>
  );
}
