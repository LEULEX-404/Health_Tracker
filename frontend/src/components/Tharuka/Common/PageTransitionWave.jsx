import { useEffect, useRef } from 'react';
import './PageTransitionWave.css';

/**
 * PageTransitionWave — a full-screen wave that sweeps top → bottom
 * whenever triggerWave() is called (font size or language change).
 *
 * Usage: import triggerPageWave from './Common/PageTransitionWave';
 *        triggerPageWave();
 */

let _triggerRef = null;

export function triggerPageWave(callback) {
  if (_triggerRef) _triggerRef(callback);
  else if (callback) callback();
}

export default function PageTransitionWave() {
  const overlayRef = useRef(null);

  useEffect(() => {
    _triggerRef = (callback) => {
      const el = overlayRef.current;
      if (!el) return callback && callback();
      
      // Reset state
      el.classList.remove('pn-wave-active');
      void el.offsetWidth; // force reflow

      // Start wiping horizontally
      el.classList.add('pn-wave-active');

      // Change content exactly in the middle of the sweep (when the thickest part is over the screen)
      const changeTimer = setTimeout(() => {
        if (callback) callback();
      }, 600); // 600ms is exactly middle of 1.2s animation

      // Final cleanup
      const exitTimer = setTimeout(() => {
        el.classList.remove('pn-wave-active');
      }, 1250); 
    };

    return () => { _triggerRef = null; };
  }, []);

  return (
    <div className="pn-trans-wave-root" ref={overlayRef} aria-hidden="true">
      <div className="pn-trans-wave-bg"></div>
    </div>
  );
}
