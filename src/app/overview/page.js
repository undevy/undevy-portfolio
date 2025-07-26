// src/app/overview/page.js
'use client';

import Link from 'next/link';
import TerminalWindow from '../layouts/TerminalWindow';
import ProfileDataPanel from '../components/ProfileDataPanel';
import ConfigurationPanel from '../components/ConfigurationPanel';
import { useSession } from '../context/SessionContext';

export default function OverviewPage() {
  const { sessionData, theme, addLog } = useSession();
  
  // Guard against rendering without data. Now it's safer.
  if (!sessionData) {
    return (
      <TerminalWindow title="loading...">
        <p>Initializing session...</p>
      </TerminalWindow>
    );
  }

  // This prevents crashes if `introduction` or `config` are temporarily missing.
  const tone = sessionData?.config?.tone;
  const introductionText = sessionData?.introduction?.[tone] || sessionData?.introduction?.formal;

  // THE FIX IS HERE: We are using the exact same classes as our navigation buttons
  // This ensures perfect alignment and visual consistency.
  const continueButtonClasses = `p-2 w-full text-left border rounded transition-colors ${
    theme === 'dark' ? 'border-dark-border hover:bg-dark-hover' : 'border-light-border hover:bg-light-hover'
  }`;

  return (
    <TerminalWindow title="about_me">
      {/* We use a wrapper div with space-y-4 to control vertical spacing between all panels */}
      <div className="space-y-4 flex flex-col">
        <ProfileDataPanel />
        
        {introductionText && (
          <p className="text-base">{introductionText}</p>
        )}

        <ConfigurationPanel />

        {/* The Link is a direct child of the flex container, making it a distinct block */}
        <Link 
          href="/overview/current-status" 
          className={continueButtonClasses}
          onClick={() => addLog('NAVIGATION: /overview -> /overview/current-status')}
        >
          CONTINUE {'>'}
        </Link>
      </div>
    </TerminalWindow>
  );
}