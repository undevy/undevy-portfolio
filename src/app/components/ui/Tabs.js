// src/app/components/ui/Tabs.js
'use client';

import { useState } from 'react';
import { useSession } from '../../context/SessionContext';

export default function Tabs({ tabs, defaultTab = null }) {
  const { theme, addLog } = useSession();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  
  const handleTabClick = (tabId, tabLabel) => {
    setActiveTab(tabId);
    addLog(`TAB SELECTED: ${tabLabel}`);
  };
  
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  
  return (
    <div>
      {/* Tab Headers */}
      <div className={`flex border-b ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.label)}
            className={`flex-1 py-2 px-4 text-sm transition-colors ${
              activeTab === tab.id
                ? (theme === 'dark' 
                    ? 'bg-dark-active text-white' 
                    : 'bg-light-active text-light-text-primary')
                : (theme === 'dark'
                    ? 'text-dark-text-primary hover:bg-dark-hover'
                    : 'text-light-text-primary hover:bg-light-hover')
            } ${
              activeTab === tab.id ? '' : 'border-b-2 border-transparent'
            }`}
          >
            ${tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className={`p-3 border-l border-r border-b rounded-b ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        {activeTabData && (
          <div>
            {/* Tab Title */}
            <div className={`mb-2 ${
              theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
            }`}>
              ${activeTabData.title || activeTabData.label}
            </div>
            
            {/* Tab Content */}
            {activeTabData.type === 'text' ? (
              <p className={`text-sm leading-relaxed ${
                theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {activeTabData.content}
              </p>
            ) : activeTabData.type === 'list' ? (
              <div className="space-y-1">
                {activeTabData.content.map((item, idx) => (
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
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : activeTabData.type === 'custom' ? (
              activeTabData.content
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}