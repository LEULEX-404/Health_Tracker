import { motion } from 'framer-motion';
import './Preloader.css';

export default function Preloader() {
  return (
    <motion.div
      className="pn-preloader"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.15, 
        filter: "blur(40px)",
        transition: { 
          duration: 1.2, 
          ease: [0.76, 0, 0.24, 1] // Custom quintic-like ease for a smooth dissolve
        } 
      }}
    >
      <div className="pn-preloader__content">
        <div className="pn-preloader__heartbeat-wrapper">
          <svg className="pn-preloader__svg" viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <polyline 
              className="pn-preloader__line" 
              points="0,75 150,75 165,30 190,120 215,10 240,130 255,75 500,75" 
            />
          </svg>
          {/* Life Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="pn-preloader__particle"
              animate={{ 
                x: [0, (i % 2 === 0 ? 40 : -40)], 
                y: [0, -60],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.4,
                ease: "easeOut" 
              }}
            />
          ))}
        </div>
        
        <div className="pn-preloader__brand">
          <span className="pn-preloader__logo-text">
            {"Pulse".split("").map((char, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.8 + (i * 0.05), duration: 0.5 }}
              >
                {char}
              </motion.span>
            ))}
            <span className="pn-preloader__highlight">
              {"Nova".split("").map((char, i) => (
                <motion.span 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(5px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ delay: 1.2 + (i * 0.05), duration: 0.5 }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
