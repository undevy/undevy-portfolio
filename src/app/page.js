// src/app/page.js
import fs from 'fs/promises';
import Navigation from './components/Navigation'; 
async function getValidCodes() {
  const dataFilePath = '/home/undevy/content.json';
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Could not read content file. Serving mock data.', error.message);
    return {
      "LOCAL_TEST": { name: "Local Developer", message: "This is mock data for local development." },
      "WELCOME123": { name: "Special Guest", message: "Welcome! Please select a section to continue." },
      "RECRUITER456": { name: "Hiring Manager", message: "Thank you for your time. Please select a section to continue." }
    };
  }
}

function AccessGate() {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-white">Access Required</h1>
      <p className="mt-4 text-xl text-gray-300">
        Please use the unique URL provided to you.
      </p>
    </div>
  );
}

function MainHub({ user }) {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-white">Welcome, {user.name}!</h1>
      <p className="mt-4 text-xl text-gray-300">
        {user.message}
      </p>
      <Navigation />
    </div>
  );
}

export default async function Home({ searchParams }) {
  const validCodes = await getValidCodes();
  const code = searchParams.code;
  const user = validCodes[code];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
      {user ? <MainHub user={user} /> : <AccessGate />}
    </main>
  );
}