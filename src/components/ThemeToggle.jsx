import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', variant = 'compact' }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer border ${
          isLight 
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm' 
            : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-cyan-500/40 shadow-sm'
        } ${className}`}
        title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
        aria-label="Toggle theme"
      >
        {isLight ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
        isLight
          ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-300 shadow-sm'
          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-cyan-500/40'
      } ${className}`}
      title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Sun className="w-4 h-4 text-amber-500 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-cyan-400 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
