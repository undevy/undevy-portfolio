// src/app/screens/RoleDetail.js
'use client';

import { useSession } from '../context/SessionContext';
import Accordion from '../components/ui/Accordion';
import { ChevronRight } from 'lucide-react';

export default function RoleDetail() {
  const { sessionData, theme, navigate, addLog, selectedRole } = useSession();
  
  // Если нет выбранной роли, показываем заглушку
  if (!selectedRole) {
    return (
      <div className="p-4 text-center">
        <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
          No role selected. Please go back to Timeline.
        </p>
        <button
          onClick={() => navigate('Timeline')}
          className={`mt-4 px-4 py-2 border rounded ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          Back to Timeline
        </button>
      </div>
    );
  }
  
  // Получаем детальные данные о роли
  const roleDetails = sessionData?.role_details?.[selectedRole.id] || {};
  
  // Подготавливаем секции для аккордеона
  const sections = [
    {
      id: 'summary',
      title: 'quick_summary',
      type: 'text',
      content: roleDetails.summary || 'No summary available.'
    },
    {
      id: 'responsibilities',
      title: 'key_responsibilities',
      type: 'list',
      content: roleDetails.responsibilities || []
    },
    {
      id: 'achievements',
      title: 'main_achievements',
      type: 'list',
      content: roleDetails.achievements || []
    },
    {
      id: 'tech',
      title: 'tech_stack',
      type: 'custom',
      content: (
        <div className="flex flex-wrap gap-2">
          {(roleDetails.tech || []).map((tech) => (
            <span
              key={tech}
              className={`px-2 py-1 border rounded text-xs ${
                theme === 'dark'
                  ? 'border-dark-border text-dark-text-primary'
                  : 'border-light-border text-light-text-primary'
              }`}
            >
              {tech}
            </span>
          ))}
        </div>
      )
    }
  ];
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h2 className="text-2xl font-bold mb-2">{selectedRole.company}</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          Role details and achievements
        </p>
      </div>
      
      {/* Role Info Panel */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $role_info
        </h3>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $position:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {selectedRole.role}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $period:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {selectedRole.period}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $duration:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {selectedRole.duration}
          </span>
        </div>
      </div>
      
      {/* Accordion Sections */}
      <Accordion sections={sections} defaultExpanded="summary" />
      
      {/* Navigation Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            addLog('RETURN TO TIMELINE');
            navigate('Timeline');
          }}
          className={`flex-1 p-2 border rounded flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          BACK TO TIMELINE
        </button>
        
        <button
          onClick={() => {
            addLog('VIEW CASE STUDIES');
            navigate('CaseList');
          }}
          className={`flex-1 p-2 border rounded flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          VIEW CASES
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}