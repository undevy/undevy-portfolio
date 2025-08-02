// src/app/layouts/TerminalWindow.js
'use client';

import { useSession } from '../context/SessionContext';
import { Sun, X, ArrowLeft } from 'lucide-react';

export default function TerminalWindow({ title, children }) {
   const { 
    theme, 
    toggleTheme, 
    goBack, 
    endSession, 
    currentScreen,
    navigationHistory,
    currentDomain 
  } = useSession();

  // Show back button if we have navigation history AND we're not on Entry screen
  const showBackButton = navigationHistory.length > 0 && currentScreen !== 'Entry';

  const windowClasses = `w-full max-w-2xl border rounded ${
    theme === 'dark' ? 'border-dark-border bg-dark-bg/90' : 'border-light-border bg-light-bg/90'
  }`;
  
  const headerClasses = `flex items-center justify-between p-4 border-b ${
    theme === 'dark' ? 'border-dark-border' : 'border-light-border'
  }`;
  
  const titleClasses = `font-normal text-lg ${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;
  
  const iconClasses = `text-xl cursor-pointer mx-2 ${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;
  
  const backButtonClasses = `text-xl cursor-pointer ml-2 ${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;

  const handleClose = () => {
    if (currentScreen === 'Entry') {
      return;
    }
    endSession();
  };

  return (
    <div className={windowClasses}>
      <div className={headerClasses}>
        <div className="flex items-center">
          {showBackButton && (
            <button onClick={goBack} aria-label="Go back" className={backButtonClasses}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className={`${titleClasses} ml-4`}>${title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} aria-label="Toggle theme" className={iconClasses}>
            <Sun size={20} />
          </button>
          {currentScreen !== 'Entry' && (
            <button onClick={handleClose} aria-label="Close session" className={iconClasses}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
