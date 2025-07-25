// src/app/components/AnalyticsPanel.js
'use client';

import { useSession } from '../context/SessionContext';
import { usePathname } from 'next/navigation';

export default function AnalyticsPanel() {
  const { sessionData, theme } = useSession();
  const pathname = usePathname();

  // If there's no session data, don't render anything.
  // This is important because this component now lives at the top level.
  if (!sessionData) {
    return null;
  }

  // THE FIX IS HERE: Added responsive width classes to match other top-level panels
  const panelClasses = `w-full max-w-2xl border rounded p-3 text-sm ${
    theme === 'dark' ? 'border-dark-border bg-dark-bg/90' : 'border-light-border bg-light-bg/90'
  }`;
  
  const labelClasses = `${
    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
  }`;

  return (
    <div className={panelClasses}>
      <h2 className={`font-bold text-base mb-2 ${labelClasses}`}>$analytics</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className={labelClasses}>$company:</span>
        <span>{sessionData.company}</span>

        <span className={labelClasses}>$access_level:</span>
        <span>{sessionData.access_level}</span>

        <span className={labelClasses}>$current_screen:</span>
        <span>{pathname === '/' ? 'MainHub' : pathname.replace('/', '')}</span>
      </div>
    </div>
  );
}