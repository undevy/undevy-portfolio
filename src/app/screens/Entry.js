// src/app/screens/Entry.js
'use client';

import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useRouter } from 'next/navigation';

export default function Entry() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, addLog } = useSession();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!code.trim()) {
      addLog('ERROR: No access code provided');
      return;
    }

    setIsLoading(true);
    addLog(`AUTHENTICATING: ${code}`);
    router.push(`/?code=${code}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  const handleGetCode = () => {
    addLog('EXTERNAL LINK: Telegram @undevy');
    window.open('https://t.me/undevy', '_blank');
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyPress={handleKeyPress}
        className={`w-full p-3 mb-3 rounded font-mono text-lg tracking-wider ${
          theme === 'dark' 
            ? 'bg-dark-input-bg text-dark-text-primary border-dark-border' 
            : 'bg-light-input-bg text-light-text-primary border-light-border'
        } border`}
        placeholder="ENTER ACCESS CODE"
        autoFocus
        disabled={isLoading}
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full p-3 mb-2 border rounded font-bold transition-colors ${
          theme === 'dark'
            ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
            : 'border-light-border hover:bg-light-hover text-light-text-primary'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
      </button>

      <button
        onClick={handleGetCode}
        className={`w-full p-3 border rounded font-bold transition-colors ${
          theme === 'dark'
            ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
            : 'border-light-border hover:bg-light-hover text-light-text-primary'
        }`}
      >
        GET CODE
      </button>
    </div>
  );
}
