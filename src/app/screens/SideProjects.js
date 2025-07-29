// src/app/screens/SideProjects.js
'use client';

import { useSession } from '../context/SessionContext';
import { ExternalLink } from 'lucide-react';

export default function SideProjects() {
  const { sessionData, theme, addLog } = useSession();
  
  // Получаем данные из sessionData
  const projects = sessionData?.side_projects || [];
  const speaking = sessionData?.public_speaking || [];
  
  const handleExternalLink = (label, url) => {
    addLog(`EXTERNAL LINK: ${label}`);
    window.open(url, '_blank');
  };
  
  // Определяем цвет статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED':
        return theme === 'dark' ? 'text-dark-success' : 'text-light-success';
      case 'IN_PROGRESS':
        return theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary';
      case 'EXPERIMENTAL':
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
        <h2 className="text-2xl font-bold mb-2">Side Projects & Initiatives</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          Personal explorations and community contributions
        </p>
      </div>
      
      {/* Projects Section */}
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h3 className={`font-bold text-base mb-3 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $personal_projects
        </h3>
        
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-3 border rounded ${
                theme === 'dark' ? 'border-dark-border' : 'border-light-border'
              }`}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  {/* Project ID */}
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
                  }`}>
                    ${project.id}
                  </div>
                  {/* Project Name */}
                  <div className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
                    {project.name}
                  </div>
                </div>
                {/* Status Badge */}
                <span className={`text-xs px-2 py-1 border rounded ${
                  theme === 'dark' ? 'border-dark-border' : 'border-light-border'
                } ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              {/* Project Description */}
              <p className={`text-xs mb-2 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                {project.desc}
              </p>
              
              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1">
                {project.tech?.map((tech) => (
                  <span
                    key={tech}
                    className={`text-xs ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                    }`}
                  >
                    [{tech}]
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Public Speaking Section */}
      <div className={`p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-3 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $public_speaking
        </h3>
        
        <div className="space-y-2">
          {speaking.map((item, index) => (
            <button
              key={index}
              onClick={() => handleExternalLink(item.title, item.url)}
              className={`w-full text-left p-2 rounded transition-colors flex items-center justify-between ${
                theme === 'dark'
                  ? 'hover:bg-dark-hover text-dark-text-primary'
                  : 'hover:bg-light-hover text-light-text-primary'
              }`}
            >
              <span className="text-sm">
                <span className={theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'}>
                  [→]
                </span>
                {' '}{item.title}
              </span>
              <ExternalLink className={`w-3 h-3 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`} />
            </button>
          ))}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className={`mt-4 p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $activity_summary
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            active_projects:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {projects.filter(p => p.status === 'IN_PROGRESS').length}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            completed:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {projects.filter(p => p.status === 'COMPLETED').length}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            talks_given:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {speaking.length}
          </span>
        </div>
      </div>
    </div>
  );
}