// src/app/layouts/TerminalWindow.js
'use client';

import { useSession } from '../context/SessionContext';
// Import hooks for navigation
import { useRouter, usePathname } from 'next/navigation';

export default function TerminalWindow({ title, children }) {
  const { theme, toggleTheme } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Show the back button on any page that is NOT the homepage ('/')
  const showBackButton = pathname !== '/';

  const windowClasses = `w-full max-w-4xl border rounded ${
    theme === 'dark' ? 'border-dark-border bg-dark-bg/90' : 'border-light-border bg-light-bg/90'
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
  
  const backButtonClasses = `text-2xl font-bold mr-3 ${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;

  const handleClose = () => {
    // Navigate to the root URL, which will show the AccessGate if the code is removed
    router.push('/');
  };

  return (
    // THE RESPONSIVENESS FIX IS HERE:
    // w-full makes it full-width on mobile.
    // max-w-4xl constrains it on larger screens.
    <div className={windowClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center">
          {/* Back button logic */}
          {showBackButton && (
            <button onClick={() => router.back()} aria-label="Go back" className={backButtonClasses}>
              ←
            </button>
          )}
          <h1 className={titleClasses}>${title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} aria-label="Toggle theme" className={iconClasses}>
            ☼
          </button>
          
          {/* Close button logic */}
          <button onClick={handleClose} aria-label="Close session" className={iconClasses}>
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}