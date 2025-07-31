// src/app/screens/SideProjects.js
'use client';

import { useSession } from '../context/SessionContext';
import { ExternalLink } from 'lucide-react';

export default function SideProjects() {
  const { sessionData, theme, addLog } = useSession();
  
  const projects = sessionData?.side_projects || [];
  const speaking = sessionData?.public_speaking || [];
  
  const handleExternalLink = (label, url) => {
    addLog(`EXTERNAL LINK: ${label}`);
    window.open(url, '_blank');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED':
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
      case 'IN_PROGRESS':
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
      case 'EXPERIMENTAL':
      default:
        return theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
    }
  };
  
  return (
    <div className="p-4">
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <h2 className="text-2xl mb-2">Side Projects & Initiatives</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          Personal explorations and community contributions
        </p>
      </div>

      <div className={`mb-4 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <h3 className={`text-base mb-3 ${
          theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
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
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                  }`}>
                    ${project.id}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {project.name}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 border rounded ${
                  theme === 'dark' ? 'border-dark-border' : 'border-light-border'
                } ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <p className={`text-xs mb-2 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {project.desc}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {project.tech?.map((tech) => (
                  <span
                    key={tech}
                    className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
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

      <div className={`p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`text-base mb-3 ${
          theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
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
                  ? 'hover:bg-dark-hover text-gray-300'
                  : 'hover:bg-light-hover text-gray-700'
              }`}
            >
              <span className="text-sm">
                <span className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}>
                  [→]
                </span>
                {' '}{item.title}
              </span>
              <ExternalLink className={`w-3 h-3 ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
              }`} />
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-4 p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`text-base mb-2 ${
          theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
        }`}>
          $activity_summary
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
            active_projects:
          </span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            {projects.filter(p => p.status === 'IN_PROGRESS').length}
          </span>
          
          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
            completed:
          </span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            {projects.filter(p => p.status === 'COMPLETED').length}
          </span>
          
          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
            talks_given:
          </span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            {speaking.length}
          </span>
        </div>
      </div>
    </div>
  );
}
