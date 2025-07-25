// src/app/page.js
'use client';

// THE FIX PART 1: Import Suspense
import { useEffect, useState, Suspense } from 'react'; 
import { useSearchParams } from 'next/navigation';
import TerminalWindow from './layouts/TerminalWindow';
import Navigation from './components/Navigation';
import { useSession } from './context/SessionContext';

// This component uses useSearchParams, so it MUST be rendered inside a Suspense boundary
function AppContent() {
  const searchParams = useSearchParams();
  const { sessionData, setSessionData, addLog } = useSession();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      if (sessionData) {
        addLog(`SYSTEM: Session terminated.`);
        setSessionData(null);
      }
      return;
    }

    if (sessionData && sessionData.code === code) {
      return;
    }

    const validateCode = async () => {
      try {
        const response = await fetch(`/api/session?code=${code}`);
        if (response.ok) {
          const userData = await response.json();
          const newSessionData = { ...userData, code }; 
          setSessionData(newSessionData);
          addLog(`SYSTEM: Access granted. Session initialized for ${userData.company}.`);
        } else {
          addLog(`ERROR: Invalid access code provided: ${code}`);
          setSessionData(null);
        }
      } catch (error) {
        addLog(`ERROR: Failed to connect to session validator. ${error.message}`);
        setSessionData(null);
      }
    };

    validateCode();
  }, [searchParams, sessionData, setSessionData, addLog]);

  return sessionData ? <MainHub user={sessionData} /> : <AccessGate />;
}

function AccessGate() {
  return (
    <TerminalWindow title="enter_access_code">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Access Required</h1>
        <p className="mt-4 text-dark-text-secondary">
          Please use the unique URL provided to you.
        </p>
      </div>
    </TerminalWindow>
  );
}

function MainHub({ user }) {
  return (
    // THE TITLE FIX IS HERE
    <TerminalWindow title="undevy_portfolio">
      <div className="text-center flex flex-col items-center">
        <h1 className="text-4xl font-bold">Welcome, {user.greeting_name}!</h1>
        <p className="mt-2 text-dark-text-secondary">
          Please select a section to continue.
        </p>
        <Navigation />
      </div>
    </TerminalWindow>
  );
}

// The main component that fetches data and controls the view
// The main page component now wraps AppContent in Suspense
export default function Home() {
  return (
    // THE FIX PART 2: Wrap the component that uses client-side hooks in Suspense
    // The fallback can be null because we show the AccessGate by default.
    <Suspense fallback={null}>
      <AppContent />
    </Suspense>
  );
}


// Re-pasting unchanged components for completeness
function AccessGate_FULL() {
  return (
    <TerminalWindow title="enter_access_code">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Access Required</h1>
        <p className="mt-4 text-dark-text-secondary">Please use the unique URL provided to you.</p>
      </div>
    </TerminalWindow>
  );
}
Object.assign(AccessGate, AccessGate_FULL);

function MainHub_FULL({ user }) {
  return (
    <TerminalWindow title="undevy_portfolio">
      <div className="text-center flex flex-col items-center">
        <h1 className="text-4xl font-bold">Welcome, {user.greeting_name}!</h1>
        <p className="mt-2 text-dark-text-secondary">Please select a section to continue.</p>
        <Navigation />
      </div>
    </TerminalWindow>
  );
}
Object.assign(MainHub, MainHub_FULL);