// src/app/screens/Timeline.js
'use client';

import { useSession } from '../context/SessionContext';
import { ChevronRight, FolderGit2, Settings2 } from 'lucide-react';

export default function Timeline() {
  const { sessionData, theme, navigate, addLog, setSelectedRole } = useSession();

  const roles = sessionData?.experience || [];

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    addLog(`ROLE SELECTED: ${role.company}`);
    navigate('RoleDetail');
  };

  return (
    <div className="p-4">
      {/* Experience Items */}
      <div className="space-y-3">
        {roles.map((role, index) => (
          <button
            key={`${role.id}-${index}`}
            onClick={() => handleRoleClick(role)}
            className={`w-full p-4 rounded border flex text-left transition-colors font-mono ${
              theme === 'dark'
                ? 'border-green-700 bg-black hover:bg-green-900/10 text-green-300'
                : 'border-gray-400 hover:bg-gray-100 text-gray-800'
            }`}
          >
            <div className="flex items-start w-full">
              {/* Index */}
              <span className={`mr-4 ${
                theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
              }`}>
                [{String(index + 1).padStart(2, '0')}]
              </span>

              {/* Info */}
              <div className="flex-1">
                <div className={`text-lg font-normal ${
                  theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
                }`}>
                  {role.company}
                </div>
                <div className={`text-sm opacity-80 ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                }`}>
                  {role.role}
                </div>
                <div className={`text-xs mt-1 opacity-60 ${
                  theme === 'dark' ? 'text-dark-text-tertiary' : 'text-light-text-tertiary'
                }`}>
                  {role.period} • {role.duration}
                </div>
                <div className="text-xs mt-1">{role.highlight}</div>
              </div>

              {/* Chevron */}
              <ChevronRight className="w-4 h-4 mt-1 ml-2 opacity-60" />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Buttons */}
      <div className="mt-5 flex gap-3">
        <button
          onClick={() => {
            addLog('NAVIGATE: case studies');
            navigate('CaseList');
          }}
          className={`flex-1 p-3 border rounded flex items-center justify-center gap-2 transition-colors font-mono ${
            theme === 'dark'
              ? 'border-green-700 bg-black hover:bg-green-900/10 text-green-300'
              : 'border-gray-400 hover:bg-gray-100 text-gray-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          VIEW PROJECTS
        </button>

        <button
          onClick={() => {
            addLog('NAVIGATE: skills matrix');
            navigate('SkillsGrid');
          }}
          className={`flex-1 p-3 border rounded flex items-center justify-center gap-2 transition-colors font-mono ${
            theme === 'dark'
              ? 'border-green-700 bg-black hover:bg-green-900/10 text-green-300'
              : 'border-gray-400 hover:bg-gray-100 text-gray-800'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          VIEW SKILLS
        </button>
      </div>
    </div>
  );
}
