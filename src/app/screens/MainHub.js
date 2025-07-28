// src/app/screens/MainHub.js
'use client';

import { useSession } from '../context/SessionContext';
import { ChevronRight } from 'lucide-react';

export default function MainHub() {
  const { sessionData, theme, navigate, addLog } = useSession();
  
  // Используем меню из sessionData или дефолтное
  const menuItems = sessionData?.menu || [
    { label: 'about_me', screen: 'Introduction', icon: '[USR]', desc: 'Background & approach' },
    { label: 'experience', screen: 'Timeline', icon: '[EXP]', desc: '9 years in product design' },
    { label: 'case_studies', screen: 'CaseList', icon: '[PRJ]', desc: 'Featured projects' },
    { label: 'skills', screen: 'SkillsGrid', icon: '[SKL]', desc: 'Technical expertise' },
    { label: 'side_projects', screen: 'SideProjects', icon: '[LAB]', desc: 'Personal initiatives' },
    { label: 'contact', screen: 'Contact', icon: '[MSG]', desc: 'Get in touch' }
  ];
  
  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h1 className={`text-4xl font-bold mb-2 ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}>
          Welcome, {sessionData?.profile?.greeting_name || 'Guest'}!
        </h1>
        <p className={`${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          Please select a section to continue.
        </p>
      </div>
      
      <div className="space-y-2 max-w-2xl mx-auto">
        {menuItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => {
              addLog(`MENU SELECT: ${item.label}`);
              navigate(item.screen);
            }}
            className={`w-full p-3 border rounded text-left transition-colors ${
              theme === 'dark'
                ? 'border-dark-border hover:bg-dark-hover'
                : 'border-light-border hover:bg-light-hover'
            }`}
          >
            <div className="flex items-start">
              <span className={`mr-3 ${
                theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
              }`}>
                {item.icon}
              </span>
              <div className="flex-1">
                <div className={`${
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}>
                  {item.label}
                </div>
                <div className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  {item.desc}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 mt-1 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
