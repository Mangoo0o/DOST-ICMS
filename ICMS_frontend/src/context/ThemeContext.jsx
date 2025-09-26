import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  effectiveTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const getInitial = () => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    return 'system';
  };

  const [theme, setTheme] = useState(getInitial);

  // Determine effective theme when in system mode
  const prefersDarkMedia = useMemo(() => (
    window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener: () => {}, removeEventListener: () => {} }
  ), []);

  const effectiveTheme = theme === 'system' ? (prefersDarkMedia.matches ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme, effectiveTheme]);

  useEffect(() => {
    const handler = () => {
      if (theme === 'system') {
        const root = document.documentElement;
        if (prefersDarkMedia.matches) root.classList.add('dark'); else root.classList.remove('dark');
      }
    };
    prefersDarkMedia.addEventListener?.('change', handler);
    return () => prefersDarkMedia.removeEventListener?.('change', handler);
  }, [theme, prefersDarkMedia]);

  const toggleTheme = () => {
    // Toggle only between light/dark. If currently system, use system's current as base.
    const base = effectiveTheme;
    setTheme(base === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;


