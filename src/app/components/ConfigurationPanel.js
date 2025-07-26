// src/app/components/ConfigurationPanel.js
'use client';

import { useSession } from '../context/SessionContext';

export default function ConfigurationPanel() {
  const { sessionData, theme } = useSession();

  if (!sessionData?.config) return null;

  const { timeline, depth, tone } = sessionData.config;

  const panelClasses = `border rounded p-3 text-sm ${
    theme === 'dark' ? 'border-dark-border' : 'border-light-border'
  }`;
  
  const labelClasses = `text-dark-text-command`;

  return (
    <div className={panelClasses}>
      <h2 className={`font-bold text-base mb-2 ${labelClasses}`}>$configuration</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className={labelClasses}>$timeline:</span>
        <span>{timeline}</span>
        <span className={labelClasses}>$depth:</span>
        <span>{depth}</span>
        <span className={labelClasses}>$tone:</span>
        <span>{tone}</span>
      </div>
    </div>
  );
}