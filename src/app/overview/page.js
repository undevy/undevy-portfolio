// src/app/overview/page.js
import TerminalWindow from '../layouts/TerminalWindow';

export default function OverviewPage() {
  // It now returns ONLY the TerminalWindow. No <main> needed.
  return (
    <TerminalWindow title="about_me">
      <h1 className="text-xl font-bold">About Me (Overview)</h1>
      <p className="mt-4 text-dark-text-secondary">
        This page will contain the introduction and value proposition.
      </p>
    </TerminalWindow>
  );
}