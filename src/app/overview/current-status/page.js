// src/app/overview/current-status/page.js
import TerminalWindow from '@/app/layouts/TerminalWindow'; // Using absolute path

export default function CurrentStatusPage() {
  return (
    <TerminalWindow title="current_status">
      <h1 className="text-xl font-bold">My Current Status</h1>
      <p className="mt-4 text-dark-text-secondary">
        This page will contain information about what I am looking for.
      </p>
    </TerminalWindow>
  );
}