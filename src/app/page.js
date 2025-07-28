// src/app/page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from './context/SessionContext';
import ScreenRenderer from './components/ScreenRenderer';

function AppContent() {
  const searchParams = useSearchParams();
  const { sessionData, setSessionData, navigate, addLog, endSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // If already authenticated, just show the app
    if (sessionData) {
      setIsLoading(false);
      setIsAuthenticated(true);
      return;
    }
    
    const code = searchParams.get('code');
    
    const authenticateWithCode = async (accessCode) => {
      try {
        const response = await fetch(`/api/session?code=${accessCode}`);
        if (response.ok) {
          const userData = await response.json();
          const enrichedData = {
            ...userData,
            meta: {
              ...userData.meta,
              code: accessCode
            }
          };
          setSessionData(enrichedData);
          addLog(`ACCESS GRANTED: ${userData.meta?.company || 'Unknown Company'}`);
          setIsAuthenticated(true);
          navigate('MainHub', false);
        } else {
          addLog(`ACCESS DENIED: Invalid code ${accessCode}`);
          setIsAuthenticated(false);
        }
      } catch (error) {
        addLog(`ERROR: Failed to authenticate`);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    
    if (code && !isAuthenticated) {
      // Authenticate only if we have a code and haven't authenticated yet
      authenticateWithCode(code);
    } else {
      // No code in URL - show entry screen
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, [searchParams, sessionData, setSessionData, navigate, addLog, isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center p-8">
        <div className="text-dark-text-primary">AUTHENTICATING...</div>
      </div>
    );
  }
  
  return <ScreenRenderer />;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AppContent />
    </Suspense>
  );
}
