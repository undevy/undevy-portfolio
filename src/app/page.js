// src/app/page.js

// This is a placeholder for our "database" of valid access codes.
// Later, we can move this to a file or a real database.
const validCodes = {
  "WELCOME123": {
    name: "Special Guest",
    message: "You've gained access to the main hub. Welcome!",
  },
  "RECRUITER456": {
    name: "Hiring Manager",
    message: "Thank you for taking a look at my profile. Here are my featured projects.",
  },
};

// This component represents the "Access Denied" or login view.
function AccessGate() {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-white">Access Required</h1>
      <p className="mt-4 text-xl text-gray-300">
        Please use the unique URL provided to you.
      </p>
      {/* In the future, we can add an input form here. */}
    </div>
  );
}

// This component represents the main content shown to a logged-in user.
// It receives personalized data based on the access code.
function MainHub({ user }) {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-white">Welcome, {user.name}!</h1>
      <p className="mt-4 text-xl text-gray-300">
        {user.message}
      </p>
    </div>
  );
}


// This is our main page component.
// It's a Server Component, so it runs on the server!
export default function Home({ searchParams }) {
  const code = searchParams.code;
  const user = validCodes[code];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
      {/* 
        Here's the core logic:
        If the `user` object exists (meaning the code was valid), show the MainHub.
        Otherwise, show the AccessGate.
      */}
      {user ? <MainHub user={user} /> : <AccessGate />}
    </main>
  );
}