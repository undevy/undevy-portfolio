// src/app/screens/Timeline.js
'use client';

import { useSession } from '../context/SessionContext';
import { ChevronRight } from 'lucide-react';

export default function Timeline() {
  const { sessionData, theme, navigate, addLog, setSelectedRole } = useSession();
  
  // Check if there are any roles available
  const roles = sessionData?.experience || [];
  const timeline = sessionData?.meta?.timeline || 'scenario_a';
  
  const handleRoleClick = (role) => {
    setSelectedRole(role);
    addLog(`ROLE SELECTED: ${role.company}`);
    navigate('RoleDetail');
  };

  // Calculate total years of experience
  const totalYears = roles.reduce((acc, role) => {
    const years = parseInt(role.duration) || 0;
    return acc + years;
  }, 0);
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h2 className="text-2xl font-bold mb-2">Experience Timeline</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          {totalYears}+ years in product design • {roles.length} companies
        </p>
      </div>
      
      {/* Timeline Type Indicator */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <div className={`text-xs mb-1 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $timeline_view
        </div>
        <div className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}>
          {timeline === 'scenario_b' ? 'Consolidated Experience' : 'Complete Timeline'}
        </div>
      </div>
      
      {/* Career Nodes */}
      <div className={`border rounded p-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-3 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $career_nodes
        </h3>
        
        <div className="space-y-2">
          {roles.map((role, index) => (
            <button
              key={`${role.id}-${index}`}
              onClick={() => handleRoleClick(role)}
              className={`w-full p-3 border rounded text-left transition-colors ${
                theme === 'dark'
                  ? 'border-dark-border hover:bg-dark-hover'
                  : 'border-light-border hover:bg-light-hover'
              }`}
            >
              <div className="flex items-start">
                {/* Index */}
                <span className={`mr-3 ${
                  theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
                }`}>
                  [{String(index + 1).padStart(2, '0')}]
                </span>
                
                {/* Role Info */}
                <div className="flex-1">
                  {/* Company Name */}
                  <div className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
                    {role.company}
                  </div>
                  
                  {/* Role Title */}
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    {role.role}
                  </div>
                  
                  {/* Period and Duration */}
                  <div className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                  }`}>
                    {role.period} • {role.duration}
                  </div>
                  
                  {/* Highlight */}
                  <div className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                  }`}>
                    {role.highlight}
                  </div>
                </div>
                
                {/* Arrow */}
                <ChevronRight className={`w-4 h-4 mt-1 ml-2 ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            addLog('NAVIGATE: case studies');
            navigate('CaseList');
          }}
          className={`flex-1 p-2 border rounded flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          VIEW PROJECTS
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
        
        <button
          onClick={() => {
            addLog('NAVIGATE: skills matrix');
            navigate('SkillsGrid');
          }}
          className={`flex-1 p-2 border rounded flex items-center justify-center transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          VIEW SKILLS
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}