import { useState, useEffect } from 'react';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or default to 'amber'
    return localStorage.getItem('crt-theme') || 'amber';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crt-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'amber' ? 'green' : 'amber');
  };

  return (
    <button 
      className="theme-switcher" 
      onClick={toggleTheme}
      title={`Switch to ${theme === 'amber' ? 'green' : 'amber'} theme`}
    >
      <span className="theme-indicator" />
      {theme === 'amber' ? 'AMBER' : 'GREEN'}
    </button>
  );
};

export default ThemeSwitcher;

// Hook for programmatic theme control
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('crt-theme') || 'amber';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'amber' ? 'green' : 'amber';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('crt-theme', newTheme);
    return newTheme;
  };

  return { theme, toggleTheme };
};
