import { useState, useEffect } from 'react';
import './ThemeSwitcher.css';

const THEMES = ['amber', 'green', 'blue', 'purple', 'white'];
const THEME_LABELS = {
  amber: 'AMBER',
  green: 'GREEN',
  blue: 'BLUE ICE',
  purple: 'PURPLE HAZE',
  white: 'WHITE'
};

const normalizeTheme = (value) => (THEMES.includes(value) ? value : 'amber');
const getNextTheme = (current) => {
  const index = THEMES.indexOf(current);
  return THEMES[(index + 1) % THEMES.length];
};

const syncTheme = (value) => {
  document.documentElement.setAttribute('data-theme', value);
  localStorage.setItem('crt-theme', value);
};

const applyTheme = (nextTheme, setTheme) => {
  const normalized = normalizeTheme(nextTheme);
  setTheme(normalized);
  syncTheme(normalized);
  return normalized;
};

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or default to 'amber'
    return normalizeTheme(localStorage.getItem('crt-theme'));
  });

  useEffect(() => {
    syncTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => getNextTheme(prev));
  };

  const nextTheme = getNextTheme(theme);

  return (
    <button 
      className="theme-switcher" 
      onClick={toggleTheme}
      title={`Switch to ${THEME_LABELS[nextTheme]} theme`}
    >
      <span className="theme-indicator" />
      {THEME_LABELS[theme]}
    </button>
  );
};

export default ThemeSwitcher;

// Hook for programmatic theme control
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return normalizeTheme(localStorage.getItem('crt-theme'));
  });

  const toggleTheme = () => {
    const nextTheme = getNextTheme(theme);
    return applyTheme(nextTheme, setTheme);
  };

  return { theme, toggleTheme };
};
