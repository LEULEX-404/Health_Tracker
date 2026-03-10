import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Logo from '../Common/Logo';
import NavMenu from './NavMenu';
import SearchBar from './SearchBar';
import HeaderControls from './HeaderControls';
import './Header.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`pn-header ${scrolled ? 'pn-header--scrolled glass' : ''}`}>
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
    </header>
  );
}
