import React from 'react';
import { SunIcon, MoonIcon, DesktopIcon } from '@phosphor-icons/react';
import './ThemeToggle.css';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle-group" role="group" aria-label="Seletor de Tema">
      <button
        className={`toggle-option ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Tema Claro"
      >
        <SunIcon size={18} weight={theme === 'light' ? 'fill' : 'regular'} />
      </button>

      <button
        className={`toggle-option ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Tema Escuro"
      >
        <MoonIcon size={18} weight={theme === 'dark' ? 'fill' : 'regular'} />
      </button>

      <button
        className={`toggle-option ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        title="Seguir Sistema"
      >
        <DesktopIcon size={18} weight={theme === 'system' ? 'fill' : 'regular'} />
      </button>
    </div>
  );
};