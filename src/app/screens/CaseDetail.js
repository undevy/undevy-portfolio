// src/app/screens/CaseDetail.js
'use client';

import { useSession } from '../context/SessionContext';

export default function CaseDetail() {
  const { theme } = useSession();
  
  return (
    <div className="p-4 text-center">
      <h2 className={`text-2xl font-bold ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        CaseDetail Screen
      </h2>
      <p className={`mt-2 ${
        theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
      }`}>
        Coming soon...
      </p>
    </div>
  );
}
