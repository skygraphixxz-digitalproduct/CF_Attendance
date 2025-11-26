import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full transition-all duration-300 focus:outline-none hover:bg-slate-200 dark:hover:bg-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border border-slate-200 dark:border-slate-700 group hover:scale-105 active:scale-95"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun className={`w-5 h-5 text-amber-500 absolute top-0 left-0 transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 opacity-0 scale-50' : 'rotate-180 opacity-100 scale-100'}`} />
        <Moon className={`w-5 h-5 text-slate-700 absolute top-0 left-0 transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-180 opacity-0 scale-50'}`} />
      </div>
    </button>
  );
};

export default ThemeToggle;