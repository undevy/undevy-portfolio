// src/app/screens/SkillDetail.js
'use client';

import { useSession } from '../context/SessionContext';

export default function SkillDetail() {
  const { sessionData, theme, navigate, addLog, selectedSkill } = useSession();
  
  // Если нет выбранного навыка, показываем заглушку
  if (!selectedSkill) {
    return (
      <div className="p-4 text-center">
        <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
          No skill selected. Please go back to Skills Grid.
        </p>
        <button
          onClick={() => navigate('SkillsGrid')}
          className={`mt-4 px-4 py-2 border rounded ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
              : 'border-light-border hover:bg-light-hover text-light-text-primary'
          }`}
        >
          Back to Skills
        </button>
      </div>
    );
  }
  
  // Получаем детальные данные о навыке
  const skillDetails = sessionData?.skill_details?.[selectedSkill.name] || {};
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h2 className="text-2xl font-bold mb-2">{selectedSkill.name}</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          {selectedSkill.desc}
        </p>
      </div>
      
      {/* Skill Level Indicator */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-xs mb-1 ${
              theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
            }`}>
              $proficiency_level
            </div>
            <div className={`text-lg font-bold ${
              selectedSkill.level === 'EXPERT' 
                ? (theme === 'dark' ? 'text-dark-success' : 'text-light-success')
                : selectedSkill.level === 'ADVANCED'
                ? (theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary')
                : (theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary')
            }`}>
              {selectedSkill.level}
            </div>
          </div>
          
          {/* Visual Level Indicator */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-4 h-4 border ${
                  theme === 'dark' ? 'border-dark-border' : 'border-light-border'
                } ${
                  (selectedSkill.level === 'EXPERT' && level <= 5) ||
                  (selectedSkill.level === 'ADVANCED' && level <= 4) ||
                  (selectedSkill.level === 'INTERMEDIATE' && level <= 3)
                    ? (theme === 'dark' ? 'bg-dark-success' : 'bg-light-success')
                    : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Skill Overview */}
      <div className={`p-3 border rounded mb-3 ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $skill_overview
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}>
          {skillDetails.description || 'No description available.'}
        </p>
      </div>
      
      {/* Implementations/Examples */}
      {skillDetails.examples && skillDetails.examples.length > 0 && (
        <div className={`p-3 border rounded mb-3 ${
          theme === 'dark' ? 'border-dark-border' : 'border-light-border'
        }`}>
          <h3 className={`font-bold text-base mb-2 ${
            theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
          }`}>
            $implementations
          </h3>
          <div className="space-y-1">
            {skillDetails.examples.map((example, idx) => (
              <div
                key={idx}
                className={`text-sm flex items-start ${
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                }`}
              >
                <span className={`mr-2 ${
                  theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
                }`}>
                  [{idx + 1}]
                </span>
                <span>{example}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tools & Technologies */}
      {skillDetails.tools && skillDetails.tools.length > 0 && (
        <div className={`p-3 border rounded mb-3 ${
          theme === 'dark' ? 'border-dark-border' : 'border-light-border'
        }`}>
          <h3 className={`font-bold text-base mb-2 ${
            theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
          }`}>
            $related_tools
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillDetails.tools.map((tool) => (
              <span
                key={tool}
                className={`px-2 py-1 border rounded text-xs ${
                  theme === 'dark'
                    ? 'border-dark-border text-dark-text-primary'
                    : 'border-light-border text-light-text-primary'
                }`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Business Impact */}
      {skillDetails.impact && (
        <div className={`p-3 border rounded mb-3 ${
          theme === 'dark' ? 'border-dark-border' : 'border-light-border'
        }`}>
          <h3 className={`font-bold text-base mb-2 ${
            theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
          }`}>
            $business_impact
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-dark-success' : 'text-light-success'
          }`}>
            {skillDetails.impact}
          </p>
        </div>
      )}
      
      {/* Navigation Button */}
      <button
        onClick={() => {
          addLog('RETURN TO SKILLS GRID');
          navigate('SkillsGrid');
        }}
        className={`w-full p-2 border rounded flex items-center justify-center transition-colors ${
          theme === 'dark'
            ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
            : 'border-light-border hover:bg-light-hover text-light-text-primary'
        }`}
      >
        BACK TO SKILLS
      </button>
    </div>
  );
}