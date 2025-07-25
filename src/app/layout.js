// src/app/layout.js
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import MatomoTracker from "./components/MatomoTracker";
import { Suspense } from 'react';
import { SessionProvider } from "./context/SessionContext"; // Import our new provider

const robotoMono = Roboto_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export const metadata = {
  title: "Undevy Portfolio",
  description: "Personalized Portfolio for review",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${robotoMono.variable} font-mono bg-dark-bg text-dark-text-primary`}>
        {/*
          Now, our entire application is wrapped in the SessionProvider.
          Every component inside can access the shared state (like the current theme).
        */}
        <SessionProvider>
          <Suspense fallback={null}>
            <MatomoTracker />
          </Suspense>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}