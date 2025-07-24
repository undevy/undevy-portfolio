// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import MatomoTracker from "./components/MatomoTracker"; // Импортируем наш компонент
import { Suspense } from 'react'; // Импортируем Suspense

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Undevy Portfolio",
  description: "Personalized Portfolio for review",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/*
          Suspense is needed because MatomoTracker uses useSearchParams,
          which is a Client Component hook.
        */}
        <Suspense fallback={null}>
          <MatomoTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}