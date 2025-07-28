// src/app/screens/Introduction.js
'use client';

import { useSession } from '../context/SessionContext';

export default function Introduction() {
  const { sessionData, theme, navigate, addLog } = useSession();
  
  const introText = sessionData?.introduction?.[sessionData?.meta?.tone] || 
                   sessionData?.introduction?.formal ||
                   "Welcome to my portfolio!";
  
  return (
    <div className="p-4">
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h2 className="text-2xl font-bold mb-4">About Me</h2>
        <p className="leading-relaxed">{introText}</p>
      </div>
      
      <button
        onClick={() => {
          addLog('NAVIGATE: Timeline');
          navigate('Timeline');
        }}
        className={`mt-4 p-2 border rounded ${
          theme === 'dark'
            ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
            : 'border-light-border hover:bg-light-hover text-light-text-primary'
        }`}
      >
        View Experience →
      </button>
    </div>
  );
}
