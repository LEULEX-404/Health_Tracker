import { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();
const SIZES = ['small', 'medium', 'large'];

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('pulsanova-fontsize') || 'medium'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontSize);
    localStorage.setItem('pulsanova-fontsize', fontSize);
  }, [fontSize]);

  const changeSize = (size) => { if (SIZES.includes(size)) setFontSize(size); };
  const increaseSize = () => { const i = SIZES.indexOf(fontSize); if (i < 2) setFontSize(SIZES[i + 1]); };
  const decreaseSize = () => { const i = SIZES.indexOf(fontSize); if (i > 0) setFontSize(SIZES[i - 1]); };

  return (
    <FontSizeContext.Provider value={{ fontSize, changeSize, increaseSize, decreaseSize, SIZES }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeContext);
