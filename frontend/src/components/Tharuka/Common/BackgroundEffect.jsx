import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './BackgroundEffect.css';

export default function BackgroundEffect() {
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Create different parallax offsets for each orb
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 300]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles - aggressively reduced for extreme performance
    const particleCount = 35;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const baseColor = isDark ? '0,200,151' : '0,168,118';
      const thresholdSq = 110 * 110;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          // Early exit if horizontal distance alone exceeds threshold
          if (dx * dx > thresholdSq) continue;
          
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < thresholdSq) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Use squared distance for opacity to avoid Math.sqrt
            const alpha = 0.06 * (1 - distSq / thresholdSq);
            ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="pn-bg-effect">
      <canvas ref={canvasRef} className="pn-bg-canvas" />
      <motion.div className="pn-bg-gradient pn-bg-gradient--1" style={{ y: y1 }} />
      <motion.div className="pn-bg-gradient pn-bg-gradient--2" style={{ y: y2 }} />
      <motion.div className="pn-bg-gradient pn-bg-gradient--3" style={{ y: y3 }} />
    </div>
  );
}
