// src/app/layouts/TerminalWindow.js
'use client'; // This component now needs to be a client component for hooks and interaction.

import { useSession } from '../context/SessionContext';

export default function TerminalWindow({ title, children }) {
  // Listen to our "radio station" to get the current theme and the toggle function
  const { theme, toggleTheme } = useSession();

  // Dynamically set classes based on the current theme
  const windowClasses = `w-full max-w-4xl border rounded ${
    theme === 'dark' ? 'border-dark-border bg-dark-bg/50' : 'border-light-border bg-light-bg/50'
  }`;
  
  const headerClasses = `flex items-center justify-between p-2 border-b ${
    theme === 'dark' ? 'border-dark-border' : 'border-light-border'
  }`;
  
  const titleClasses = `font-bold text-lg ${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;
  
  const iconClasses = `text-xl cursor-pointer ${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;

  return (
    <div className={windowClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <h1 className={titleClasses}>${title}</h1>
        <div className="flex items-center gap-3">
          {/* THEME SWITCHER BUTTON */}
          <button onClick={toggleTheme} aria-label="Toggle theme" className={iconClasses}>
            ☼
          </button>
          
          <span className={iconClasses}>
            ×
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}