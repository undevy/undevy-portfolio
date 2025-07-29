// src/app/components/ui/Accordion.js
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

export default function Accordion({ sections, defaultExpanded = null }) {
  const { theme, addLog } = useSession();
  const [expandedSection, setExpandedSection] = useState(defaultExpanded);
  
  const toggleSection = (sectionId) => {
    const newState = expandedSection === sectionId ? null : sectionId;
    setExpandedSection(newState);
    addLog(`SECTION ${newState ? 'EXPANDED' : 'COLLAPSED'}: ${sectionId}`);
  };
  
  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div
          key={section.id}
          className={`border rounded ${
            theme === 'dark' ? 'border-dark-border' : 'border-light-border'
          }`}
        >
          {/* Accordion Header */}
          <button
            onClick={() => toggleSection(section.id)}
            className={`w-full p-3 flex items-center justify-between transition-colors ${
              theme === 'dark' ? 'hover:bg-dark-hover' : 'hover:bg-light-hover'
            }`}
          >
            <span className={`text-sm ${
              theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
            }`}>
              ${section.title}
            </span>
            {expandedSection === section.id ? (
              <ChevronUp className={`w-4 h-4 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`} />
            )}
          </button>
          
          {/* Accordion Content */}
          {expandedSection === section.id && (
            <div className={`p-3 text-sm border-t ${
              theme === 'dark' ? 'border-dark-border' : 'border-light-border'
            }`}>
              {section.type === 'text' ? (
                <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
                  {section.content}
                </p>
              ) : section.type === 'list' ? (
                <div className="space-y-1">
                  {section.content.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start ${
                        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
                      }`}
                    >
                      <span className={`mr-2 ${
                        theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
                      }`}>
                        [{idx + 1}]
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                // Custom content renderer
                section.content
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}