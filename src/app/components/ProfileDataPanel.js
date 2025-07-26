// src/app/components/ProfileDataPanel.js
'use client';

import { useSession } from '../context/SessionContext';

export default function ProfileDataPanel() {
  const { sessionData, theme } = useSession();

  if (!sessionData?.profile_data) return null;

  const { title, specialization, background } = sessionData.profile_data;

  const panelClasses = `border rounded p-3 text-sm ${
    theme === 'dark' ? 'border-dark-border' : 'border-light-border'
  }`;
  
  const separator = <span className={theme === 'dark' ? 'text-dark-border' : 'text-light-border'}>|</span>;

  return (
    <div className={panelClasses}>
      <h2 className="font-bold text-base mb-2 text-dark-text-command">$profile_data</h2>
      <div className="flex flex-wrap gap-x-2">
        <span>{title}</span>
        {separator}
        <span>{specialization}</span>
        {separator}
        <span>{background}</span>
      </div>
    </div>
  );
}