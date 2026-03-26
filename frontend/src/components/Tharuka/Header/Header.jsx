import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Logo from '../Common/Logo';
import NavMenu from './NavMenu';
import SearchBar from './SearchBar';
import HeaderControls from './HeaderControls';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerVariants = {
    hidden: { y: -80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.header
      className={`pn-header ${scrolled ? 'pn-header--scrolled glass' : ''}`}
      variants={prefersReducedMotion ? {} : headerVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
    >
      <div className="container pn-header__inner">
        {/* Logo — always visible */}
        <Logo />

        {/* Nav — always visible */}
        <NavMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Right side: search expands here, then controls */}
        <div className="pn-header__right">
          <SearchBar onOpen={setSearchOpen} />
          {/* Controls hidden while search is open to give search room */}
          {!searchOpen && <HeaderControls />}
          {!searchOpen && (
            <button
              className="pn-header__hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
