// src/app/overview/current-status/page.js
'use client'; // We need client component for hooks and interaction

import Link from 'next/link';
import TerminalWindow from '@/app/layouts/TerminalWindow'; // Using absolute path for clarity
import { useSession } from '@/app/context/SessionContext';

export default function CurrentStatusPage() {
  const { theme, addLog } = useSession();

  const buttonClasses = `mt-6 w-full p-2 border rounded transition-colors text-left ${
    theme === 'dark' ? 'border-dark-border hover:bg-dark-hover' : 'border-light-border hover:bg-light-hover'
  }`;

  return (
    <TerminalWindow title="current_status">
      <div className="flex flex-col">
        <p className="text-base">
          Currently seeking a challenging remote Product Designer role within a forward-thinking Web3 company where I can leverage my unique blend of technical expertise and design-driven product strategy.
        </p>

        <Link 
          href="/overview/value-prop"
          className={buttonClasses}
          onClick={() => addLog('NAVIGATION: /overview/current-status -> /overview/value-prop')}
        >
          Why Me? {'>'}
        </Link>
      </div>
    </TerminalWindow>
  );
}