// src/app/components/SystemLog.js
'use client';

import { useSession } from '../context/SessionContext';
import { useEffect, useRef } from 'react';

export default function SystemLog() {
  const { logEntries, theme } = useSession();
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries]);

  // THE COLOR FIX: Using bg-dark-bg/90 and bg-light-bg/90 to match the main window
  const containerClasses = `w-full max-w-2xl border rounded h-32 overflow-y-auto text-xs p-2 ${
    theme === 'dark' ? 'border-dark-border bg-dark-bg/90' : 'border-light-border bg-light-bg/90'
  }`;
  
  const textClasses = `${
    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
  }`;

  return (
    <div className={containerClasses} ref={logContainerRef}>
      {logEntries.map((entry, index) => (
        <p key={index} className={textClasses}>{entry}</p>
      ))}
    </div>
  );
}