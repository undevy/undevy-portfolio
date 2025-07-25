// src/app/components/Navigation.js
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="mt-8 flex gap-4">
      <Link href="/overview" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
        About Me
      </Link>
      <Link href="/experience" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
        Experience
      </Link>
    </nav>
  );
}