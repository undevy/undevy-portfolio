// src/app/screens/SkillsGrid.js
'use client';

import { useSession } from '../context/SessionContext';

export default function SkillsGrid() {
  const { sessionData, theme, navigate, addLog, setSelectedSkill } = useSession();
  
  // Получаем навыки из sessionData
  const skills = sessionData?.skills || [];
  
  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    addLog(`SKILL SELECTED: ${skill.name}`);
    navigate('SkillDetail');
  };
  
  // Функция для определения цвета уровня навыка
  const getLevelColor = (level) => {
    switch(level) {
      case 'EXPERT':
        return theme === 'dark' ? 'text-dark-success' : 'text-light-success';
      case 'ADVANCED':
        return theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary';
      case 'INTERMEDIATE':
        return theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary';
      default:
        return theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary';
    }
  };
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h2 className="text-2xl font-bold mb-2">Technical Skills</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          Click on any skill to see details and examples
        </p>
      </div>
      
      {/* Skills Grid */}
      <div className="grid grid-cols-2 gap-2">
        {skills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => handleSkillClick(skill)}
            className={`p-3 border rounded text-left transition-colors ${
              theme === 'dark'
                ? 'border-dark-border hover:bg-dark-hover'
                : 'border-light-border hover:bg-light-hover'
            }`}
          >
            {/* Skill ID */}
            <div className={`text-xs mb-1 ${
              theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
            }`}>
              ${skill.id}
            </div>
            
            {/* Skill Name */}
            <div className={`text-sm mb-1 ${
              theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              {skill.name}
            </div>
            
            {/* Skill Description */}
            <div className={`text-xs mb-2 ${
              theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`}>
              {skill.desc}
            </div>
            
            {/* Skill Level */}
            <div className={`text-xs ${getLevelColor(skill.level)}`}>
              [{skill.level}]
            </div>
          </button>
        ))}
      </div>
      
      {/* Summary Panel */}
      <div className={`mt-4 p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $skill_summary
        </h3>
        <div className="grid grid-cols-3 gap-x-4 text-sm">
          <div>
            <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
              expert:
            </span>
            <span className={`ml-2 ${theme === 'dark' ? 'text-dark-success' : 'text-light-success'}`}>
              {skills.filter(s => s.level === 'EXPERT').length}
            </span>
          </div>
          <div>
            <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
              advanced:
            </span>
            <span className={`ml-2 ${theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
              {skills.filter(s => s.level === 'ADVANCED').length}
            </span>
          </div>
          <div>
            <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
              intermediate:
            </span>
            <span className={`ml-2 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
              {skills.filter(s => s.level === 'INTERMEDIATE').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}