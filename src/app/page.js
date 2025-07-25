// src/app/page.js
import fs from 'fs/promises';
// THE FIX IS HERE: Corrected the import path
import TerminalWindow from './layouts/TerminalWindow'; 
import Navigation from './components/Navigation';

async function getValidCodes() {
  const dataFilePath = '/home/undevy/content.json';
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Could not read content file. Serving mock data.', error.message);
    return {
      "LOCAL_TEST": {
        "company": "Local Dev Env",
        "access_level": "god_mode",
        "greeting_name": "Local Developer",
        "config": {
          "timeline": "all",
          "depth": "full",
          "tone": "casual"
        }
      }
    };
  }
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
    <TerminalWindow title="main_hub">
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

export default async function Home({ searchParams }) {
  const validCodes = await getValidCodes();
  const code = searchParams.code;
  const user = validCodes[code];

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8">
      {user ? <MainHub user={user} /> : <AccessGate />}
    </main>
  );
}