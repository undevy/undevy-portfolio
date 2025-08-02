// src/app/components/AnalyticsPanel.js
'use client';

import { useSession } from '../context/SessionContext';

export default function AnalyticsPanel() {
  const { 
    sessionData, 
    theme, 
    currentScreen, 
    navigationHistory,
    navigate,
    screensVisitedCount,
    setNavigationHistory 
  } = useSession();

  // Don't render if no session data
  if (!sessionData) {
    return null;
  }

  const panelClasses = `w-full max-w-2xl border rounded p-3 text-sm ${
    theme === 'dark' ? 'border-dark-border bg-dark-bg/90' : 'border-light-border bg-light-bg/90'
  }`;
  
  const labelClasses = `${
    theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
  }`;

    const yellowClasses = `${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;
  
  const valueClasses = `${
    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
  }`;
  
  const secondaryClasses = `${
    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
  }`;

  const handlePathClick = (screen, index) => {
    // Update navigation history to only include screens up to the clicked one
    const newHistory = navigationHistory.slice(0, index);
    setNavigationHistory(newHistory);
    navigate(screen, false);
  };

  return (
    <div className={panelClasses}>
      <h2 className={`text-base mb-2 ${yellowClasses}`}>$analytics</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className={labelClasses}>$company:</span>
        <span className={valueClasses}>{sessionData.meta?.company || sessionData.company}</span>

        <span className={labelClasses}>$access_level:</span>
        <span className={valueClasses}>{sessionData.meta?.depth || sessionData.access_level || 'standard'}</span>

        <span className={labelClasses}>$current_screen:</span>
        <span className={valueClasses}>{currentScreen}</span>
        
        <span className={labelClasses}>$screens_visited:</span>
        <span className={valueClasses}>{screensVisitedCount}</span>
      </div>
      
      {/* Navigation Path / Breadcrumbs */}
      <div className={`mt-3 pt-2 border-t ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <div className={`${yellowClasses} text-xs mb-1`}>$navigation_path</div>
        <div className={`text-xs flex items-center flex-wrap`}>
          {navigationHistory.length > 0 ? (
            <>
              {navigationHistory.slice(-3).map((screen, index) => {
                const actualIndex = navigationHistory.indexOf(screen);
                return (
                  <span key={index}>
                    <button
                      onClick={() => handlePathClick(screen, actualIndex)}
                      className={`${secondaryClasses} hover:underline`}
                    >
                      {screen}
                    </button>
                    <span className={`mx-1 ${labelClasses}`}>{'>'}</span>
                  </span>
                );
              })}
              <span className={valueClasses}>{currentScreen}</span>
            </>
          ) : (
            <span className={valueClasses}>{currentScreen}</span>
          )}
        </div>
      </div>
    </div>
  );
}
