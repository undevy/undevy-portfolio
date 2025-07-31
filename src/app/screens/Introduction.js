// src/app/screens/Introduction.js
'use client';

import { useSession } from '../context/SessionContext';
import { ChevronRight } from 'lucide-react';

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
    <div className="p-4">
      {/* Profile Summary Panel */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $profile_data
        </h3>
        <div className="flex flex-wrap gap-x-2 text-sm">
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {profile.summary?.title}
          </span>
          <span className={theme === 'dark' ? 'text-dark-border' : 'text-light-border'}>|</span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {profile.summary?.specialization}
          </span>
          <span className={theme === 'dark' ? 'text-dark-border' : 'text-light-border'}>|</span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {profile.summary?.background}
          </span>
        </div>
      </div>

      {/* Introduction Text */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $about_me
        </h3>
        <p className={`text-sm leading-relaxed ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}>
          {introText}
        </p>
      </div>

      {/* Core Attributes */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $core_attributes
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {profile.attributes?.map((attr, index) => (
            <div key={index} className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
              <span className={theme === 'dark' ? 'text-dark-success' : 'text-light-success'}>
                [√]
              </span>{' '}
              {attr}
            </div>
          ))}
        </div>
      </div>

      {/* Current Status */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $current_status
        </h3>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $seeking:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {profile.status?.seeking}
          </span>

          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $location:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {profile.status?.location}
          </span>

          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $availability:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {profile.status?.availability}
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleNavigate('Timeline', 'experience timeline')}
          className={`flex-1 p-2 border rounded flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          VIEW EXPERIENCE
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={() => handleNavigate('Contact', 'contact info')}
          className={`flex-1 p-2 border rounded flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          GET IN TOUCH
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
