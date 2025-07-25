// src/app/layouts/TerminalWindow.js
'use client';

import { useSession } from '../context/SessionContext';
import { useRouter, usePathname } from 'next/navigation';
import AnalyticsPanel from '../components/AnalyticsPanel'; // Import the new panel

export default function TerminalWindow({ title, children }) {
  const { theme, toggleTheme, addLog } = useSession(); // Get addLog
  const router = useRouter();
  const pathname = usePathname();

  const showBackButton = pathname !== '/';

  const windowClasses = `w-full max-w-2xl border rounded ${
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
    addLog(`NAVIGATION: Session closed from ${pathname}`);
    router.push('/');
  };

  const handleBack = () => {
    // THE LOGGING FIX IS HERE
    addLog(`NAVIGATION: Back from ${pathname}`);
    router.back();
  }

  return (
    <div className={windowClasses}>
      <div className={headerClasses}>
        <div className="flex items-center">
          {showBackButton && <button onClick={handleBack} aria-label="Go back" className={backButtonClasses}>←</button>}
          <h1 className={titleClasses}>${title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} aria-label="Toggle theme" className={iconClasses}>☼</button>
          <button onClick={handleClose} aria-label="Close session" className={iconClasses}>×</button>
        </div>
      </div>
      {/* THE FIX: No AnalyticsPanel here anymore. Just the children. */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}