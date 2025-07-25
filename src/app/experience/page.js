// src/app/experience/page.js
import TerminalWindow from '../layouts/TerminalWindow';

export default function ExperiencePage() {
  // It now returns ONLY the TerminalWindow. No <main> needed.
  return (
    <TerminalWindow title="experience">
      <h1 className="text-xl font-bold">My Experience</h1>
      <p className="mt-4 text-dark-text-secondary">
        This page will contain the career timeline and detailed roles.
      </p>
    </TerminalWindow>
  );
}