import { motion } from "framer-motion";
import { memo } from "react";

/**
 * TextReveal component for high-performance masked text animations.
 * Uses GPU-accelerated translateY for smooth, zero-latency motion.
 */
const TextReveal = memo(({ children, delay = 0, className = "", display = "block", width = "100%" }) => {
  return (
    <div 
      className={`pn-text-reveal ${className}`} 
      style={{ 
        overflow: "hidden", 
        display: display,
        width: width,
        position: 'relative'
      }}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </div>
  );
});

export default TextReveal;
