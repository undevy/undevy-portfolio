// src/app/screens/Introduction.js
'use client';

import { useSession } from '../context/SessionContext';
import { ChevronRight, UserCheck, Mail } from 'lucide-react';

export default function Introduction() {
  const { sessionData, theme, navigate, addLog } = useSession();

  const profile = sessionData?.profile || {};
  const introText =
    sessionData?.introduction?.[sessionData?.meta?.tone] ||
    sessionData?.introduction?.formal ||
    'Welcome to my portfolio!';

  const handleNavigate = (screen, label) => {
    addLog(`NAVIGATE: ${label}`);
    navigate(screen);
  };

return (
  <div className="p-4 font-mono">
    {/* Profile Summary */}
    <div className={`p-4 rounded border mb-4 ${
      theme === 'dark'
        ? 'border-green-700 bg-black text-green-300'
        : 'border-gray-400 bg-white text-gray-800'
    }`}>
      <h3 className="mb-2 text-green-400">$profile_data</h3>
      <div className="flex flex-wrap gap-x-2 text-sm">
        <span>{profile.summary?.title}</span>
        <span className="opacity-50">|</span>
        <span>{profile.summary?.specialization}</span>
        <span className="opacity-50">|</span>
        <span>{profile.summary?.background}</span>
      </div>
    </div>

    {/* About Me */}
    <div className={`p-4 rounded border mb-4 ${
      theme === 'dark'
        ? 'border-green-700 bg-black text-green-300'
        : 'border-gray-400 bg-white text-gray-800'
    }`}>
      <h3 className="mb-2 text-green-400">$about_me</h3>
      <p className="text-sm leading-relaxed opacity-90">{introText}</p>
    </div>

    {/* Core Attributes */}
    <div className={`p-4 rounded border mb-4 ${
      theme === 'dark'
        ? 'border-green-700 bg-black text-green-300'
        : 'border-gray-400 bg-white text-gray-800'
    }`}>
      <h3 className="mb-2 text-green-400">$core_attributes</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {profile.attributes?.map((attr, index) => (
          <div key={index}>
            <span className="text-yellow-400">[√]</span> {attr}
          </div>
        ))}
      </div>
    </div>

    {/* Current Status */}
    <div className={`p-4 rounded border mb-4 ${
      theme === 'dark'
        ? 'border-green-700 bg-black text-green-300'
        : 'border-gray-400 bg-white text-gray-800'
    }`}>
      <h3 className="mb-2 text-green-400">$current_status</h3>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <span className="text-green-400">$seeking:</span>
        <span>{profile.status?.seeking}</span>

        <span className="text-green-400">$location:</span>
        <span>{profile.status?.location}</span>

        <span className="text-green-400">$availability:</span>
        <span>{profile.status?.availability}</span>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="flex gap-3">
      <button
        onClick={() => handleNavigate('Timeline', 'experience timeline')}
        className={`flex-1 p-3 border rounded flex items-center justify-center gap-2 transition-colors ${
          theme === 'dark'
            ? 'border-green-700 bg-black hover:bg-green-900/10 text-green-300'
            : 'border-gray-400 hover:bg-gray-100 text-gray-800'
        }`}
      >
        <UserCheck className="w-4 h-4" />
        VIEW EXPERIENCE
      </button>

      <button
        onClick={() => handleNavigate('Contact', 'contact info')}
        className={`flex-1 p-3 border rounded flex items-center justify-center gap-2 transition-colors ${
          theme === 'dark'
            ? 'border-green-700 bg-black hover:bg-green-900/10 text-green-300'
            : 'border-gray-400 hover:bg-gray-100 text-gray-800'
        }`}
      >
        <Mail className="w-4 h-4" />
        GET IN TOUCH
      </button>
    </div>
  </div>
);
}
