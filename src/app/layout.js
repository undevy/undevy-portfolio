// src/app/layout.js
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import MatomoTracker from "./components/MatomoTracker";
import SystemLog from "./components/SystemLog";
import AnalyticsPanel from "./components/AnalyticsPanel";
import { Suspense } from 'react';
import { SessionProvider } from "./context/SessionContext";
import ThemeManager from "./components/ThemeManager";

// 1. Define the font object correctly at the top level
const robotoMono = Roboto_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-roboto-mono',
});

// 2. Define metadata
export const metadata = {
  title: "Undevy Portfolio",
  description: "Personalized Portfolio for review",
};

// 3. Create the RootLayout component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 
        THE FIX IS HERE: We apply the font variable directly and correctly.
        No more weird tricks or shortcuts.
      */}
      <body className={`${robotoMono.variable} font-mono bg-dark-bg text-dark-text-primary`}>
        <SessionProvider>
          <ThemeManager />
          <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
            {children}
            <AnalyticsPanel />
            <SystemLog />
          </main>
          <Suspense fallback={null}>
            <MatomoTracker />
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}