// src/app/layout.js
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import MatomoTracker from "./components/MatomoTracker";
import { Suspense } from 'react';
import { SessionProvider } from "./context/SessionContext";
import ThemeManager from "./components/ThemeManager"; // Import our new manager

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
      {/* The default classes here are just a fallback for when JS is disabled */}
      <body className={`${robotoMono.variable} font-mono bg-dark-bg text-dark-text-primary`}>
        <SessionProvider>
          {/* ThemeManager now sits inside the provider and controls the body classes */}
          <ThemeManager />
          <Suspense fallback={null}>
            <MatomoTracker />
          </Suspense>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}