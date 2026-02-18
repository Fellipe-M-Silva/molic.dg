import React, { useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { type Theme } from '../types/theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('@molic-studio/theme');
    return (savedTheme as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('@molic-studio/theme') as Theme | null;
    const effectiveTheme = savedTheme || 'system';
    const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (effectiveTheme === 'dark') return 'dark';
    if (effectiveTheme === 'light') return 'light';
    return systemDarkQuery.matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('@molic-studio/theme', theme);

    const root = window.document.documentElement;
    const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isSystemDark = systemDarkQuery.matches;
      root.classList.remove('light', 'dark');

      if (theme === 'dark') {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else if (theme === 'light') {
        root.classList.add('light');
        setResolvedTheme('light');
      } else {
        const effectiveTheme = isSystemDark ? 'dark' : 'light';
        root.classList.add(effectiveTheme);
        setResolvedTheme(effectiveTheme);
      }
    };

    applyTheme();

    if (theme === 'system') {
      systemDarkQuery.addEventListener('change', applyTheme);
    }

    return () => systemDarkQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  // Monitorar mudanças de localStorage (ex: localStorage.clear())
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem('@molic-studio/theme');
      const newTheme = (savedTheme as Theme) || 'system';
      setThemeState(newTheme);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};