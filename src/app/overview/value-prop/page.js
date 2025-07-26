// src/app/overview/value-prop/page.js
'use client';

import Link from 'next/link';
import TerminalWindow from '@/app/layouts/TerminalWindow';
import { useSession } from '@/app/context/SessionContext';

export default function ValuePropPage() {
  const { theme, addLog } = useSession();

  const advantages = [
    'Technical background + Design expertise',
    'Web3 native (4+ years of focused experience)',
    'Proven impact metrics & data-driven decisions',
    'Deep understanding of complex financial protocols',
    'Expertise in building and scaling Design Systems',
  ];

  const buttonClasses = `mt-6 w-full p-2 border rounded transition-colors text-left ${
    theme === 'dark' ? 'border-dark-border hover:bg-dark-hover' : 'border-light-border hover:bg-light-hover'
  }`;
  
  const listItemClasses = `flex items-center before:content-['>'] before:mr-2 before:text-dark-text-command`;

  return (
    <TerminalWindow title="value_proposition">
      <div className="flex flex-col">
        <ul className="space-y-2 text-base">
          {advantages.map((advantage, index) => (
            <li key={index} className={listItemClasses}>
              {advantage}
            </li>
          ))}
        </ul>

        <Link 
          href="/"
          className={buttonClasses}
          onClick={() => addLog('NAVIGATION: /overview/value-prop -> / (MainHub)')}
        >
          {`<`} Back to Menu
        </Link>
      </div>
    </TerminalWindow>
  );
}