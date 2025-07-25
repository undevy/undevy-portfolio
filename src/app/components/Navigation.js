// src/app/components/Navigation.js
import Link from 'next/link';

export default function Navigation() {
  const buttonClasses = "p-2 w-full text-left border border-dark-border hover:bg-dark-hover transition-colors rounded";

  return (
    <nav className="mt-8 flex flex-col gap-3 w-full max-w-md">
      <Link href="/overview" className={buttonClasses}>
        <span className="text-dark-text-command">[USR]</span> about_me {">"}
      </Link>
      <Link href="/experience" className={buttonClasses}>
        <span className="text-dark-text-command">[EXP]</span> experience {">"}
      </Link>
    </nav>
  );
}