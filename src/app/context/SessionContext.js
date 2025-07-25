// src/app/context/SessionContext.js
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const SessionContext = createContext(null);

// Helper function to format timestamp
const getTimestamp = () => {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export function SessionProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  // State for the current session data (company, access level, etc.)
  const [sessionData, setSessionData] = useState(null);
  // State for the system log entries
  const [logEntries, setLogEntries] = useState([]);

  // A function to add new entries to the log
  const addLog = useCallback((message) => {
    const newEntry = `[${getTimestamp()}] ${message}`;
    // We keep the last 20 entries to prevent the log from growing indefinitely
    setLogEntries(prev => [...prev, newEntry].slice(-20));
  }, []);

  const value = {
    theme,
    toggleTheme: () => {
      addLog(`SYSTEM: Theme changed to ${theme === 'dark' ? 'LIGHT' : 'DARK'}`);
      setTheme(theme === 'dark' ? 'light' : 'dark');
    },
    sessionData,
    setSessionData, // We'll call this once when the user logs in
    logEntries,
    addLog,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}