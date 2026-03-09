import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import './ScrollToTop.css';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      className={`pn-scroll-top ${visible ? 'pn-scroll-top--visible' : ''}`}
      onClick={scrollUp}
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
