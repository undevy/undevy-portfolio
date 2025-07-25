// src/app/context/SessionContext.js
'use client'; // This is a client-side component because it uses state and context.

import { createContext, useContext, useState } from 'react';

// 1. Create the context itself
const SessionContext = createContext(null);

// 2. Create the Provider component
// This component will wrap our entire application and "provide" the state.
export function SessionProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // Default theme is 'dark'

  // This is the "broadcast" signal. We'll add more to it later.
  const value = {
    theme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// 3. Create a custom hook for easy access
// Instead of importing useContext and SessionContext everywhere,
// we'll just use this simple hook.
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}