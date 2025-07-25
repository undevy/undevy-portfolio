// src/app/overview/page.js
import TerminalWindow from '../layouts/TerminalWindow';

export default function OverviewPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <TerminalWindow title="about_me">
        <h1 className="text-xl font-bold">About Me (Overview)</h1>
        <p className="mt-4 text-dark-text-secondary">
          This page will contain the introduction and value proposition.
        </p>
      </TerminalWindow>
    </main>
  );
}