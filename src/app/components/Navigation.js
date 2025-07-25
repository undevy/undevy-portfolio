// src/app/components/Navigation.js
'use client'; // This is now a client component

import Link from 'next/link';
import { useSession } from '../context/SessionContext';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  // THE LOGIC FIX: Get addLog function from our context
  const { addLog, theme } = useSession();
  const pathname = usePathname();

  const handleNavClick = (destination) => {
    addLog(`NAVIGATION: ${pathname} -> ${destination}`);
  };

  const buttonClasses = `p-2 w-full text-left border rounded transition-colors ${
    theme === 'dark' ? 'border-dark-border hover:bg-dark-hover' : 'border-light-border hover:bg-light-hover'
  }`;
  
  const commandText = theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command';

  return (
    <nav className="mt-8 flex flex-col gap-3 w-full max-w-md">
      <Link href="/overview" className={buttonClasses} onClick={() => handleNavClick('/overview')}>
        <span className={commandText}>[USR]</span> about_me {'>'}
      </Link>
      <Link href="/experience" className={buttonClasses} onClick={() => handleNavClick('/experience')}>
        <span className={commandText}>[EXP]</span> experience {'>'}
      </Link>
    </nav>
  );
}