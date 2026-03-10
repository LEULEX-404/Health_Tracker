import { useState, useEffect } from 'react';
import { useRive, Layout, Fit, Alignment, useStateMachineInput } from '@rive-app/react-canvas';

/**
 * Rive-based DoctorCat (Background Removed Version).
 * 
 * Props:
 *   isHiding   - mapped to 'isHandsUp' or 'isHiding'
 *   isWatching - mapped to 'isChecking' or 'isLooking'
 *   isHappy    - success state / 'check' trigger
 */
export default function DoctorCat({
  isHiding = false,
  isWatching = false,
  isHappy = false,
}) {
  const { rive, RiveComponent } = useRive({
    // Using the 'not-track' version which often implies no background hit-box shape
    src: '/Riv/4014-8344-cat-not-track-mouse.riv',
    stateMachines: 'State Machine 1',
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  // Common Rive input names for this type of animation
  const isHandsUpInput = useStateMachineInput(rive, 'State Machine 1', 'isHandsUp');
  const isCheckingInput = useStateMachineInput(rive, 'State Machine 1', 'isChecking');
  const checkInput = useStateMachineInput(rive, 'State Machine 1', 'check');

  useEffect(() => {
    if (isHandsUpInput) {
      isHandsUpInput.value = isHiding;
    }
  }, [isHiding, isHandsUpInput]);

  useEffect(() => {
    if (isCheckingInput) {
      isCheckingInput.value = isWatching;
    }
    if (checkInput && isHappy) {
      checkInput.fire();
    }
  }, [isWatching, isHappy, isCheckingInput, checkInput]);

  return (
    <div className="Imasha-rive-cat-container" style={{
      width: 180,
      height: 180,
      position: 'relative',
      filter: 'drop-shadow(0 0 15px rgba(0, 200, 151, 0.4)) drop-shadow(0 0 30px rgba(0, 255, 140, 0.2))',
    }}>
      {/* Intense green glow pulse behind */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%', height: '70%',
        background: 'radial-gradient(circle, rgba(0, 200, 151, 0.3) 0%, transparent 70%)',
        filter: 'blur(20px)',
        borderRadius: '50%',
        zIndex: -1,
        animation: 'Imasha-glow-pulse 3s infinite alternate'
      }} />

      {RiveComponent && <RiveComponent />}

      <style>{`
        @keyframes Imasha-glow-pulse {
          from { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
