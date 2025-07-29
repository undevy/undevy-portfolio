// src/app/screens/CaseList.js
'use client';

import { useSession } from '../context/SessionContext';
import { ChevronRight } from 'lucide-react';

export default function CaseList() {
  const { sessionData, theme, navigate, addLog, setSelectedCase } = useSession();
  
  // Получаем отфильтрованные кейсы из sessionData
  const cases = sessionData?.case_studies || {};
  const caseIds = Object.keys(cases);
  const totalCasesCount = 7; // Общее количество всех возможных кейсов
  
  const handleCaseClick = (caseId, caseData) => {
    setSelectedCase({ id: caseId, ...caseData });
    addLog(`CASE SELECTED: ${caseData.title}`);
    navigate('CaseDetail');
  };
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h2 className="text-2xl font-bold mb-2">Case Studies</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          Selected projects demonstrating impact and process
        </p>
      </div>
      
      {/* Loading Indicator */}
      <div className={`mb-3 p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <div className={`text-xs mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $loading_cases
        </div>
        <div className={`text-xs ${
          theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
        }`}>
          <div className="flex items-center gap-2">
            <span>[</span>
            {/* Заполненные квадраты для загруженных кейсов */}
            {Array.from({ length: caseIds.length }, (_, i) => (
              <span key={`loaded-${i}`} className={theme === 'dark' ? 'text-dark-success' : 'text-light-success'}>
                ■
              </span>
            ))}
            {/* Пустые квадраты для остальных */}
            {Array.from({ length: totalCasesCount - caseIds.length }, (_, i) => (
              <span key={`empty-${i}`} className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
                □
              </span>
            ))}
            <span>]</span>
            <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
              {caseIds.length}/{totalCasesCount} loaded for {sessionData?.meta?.company || sessionData?.company}
            </span>
          </div>
        </div>
      </div>
      
      {/* Cases List */}
      <div className="space-y-2">
        {caseIds.map((caseId) => {
          const caseData = cases[caseId];
          return (
            <button
              key={caseId}
              onClick={() => handleCaseClick(caseId, caseData)}
              className={`w-full p-3 border rounded text-left transition-colors ${
                theme === 'dark'
                  ? 'border-dark-border hover:bg-dark-hover'
                  : 'border-light-border hover:bg-light-hover'
              }`}
            >
              {/* Case ID */}
              <div className={`text-sm mb-1 ${
                theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
              }`}>
                ${caseId}
              </div>
              
              {/* Case Title */}
              <div className={`mb-1 ${
                theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
              }`}>
                {caseData.title}
              </div>
              
              {/* Case Description */}
              <div className={`text-xs mb-2 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
              }`}>
                {caseData.desc}
              </div>
              
              {/* Metrics */}
              <div className={`text-xs mb-2 ${
                theme === 'dark' ? 'text-dark-success' : 'text-light-success'
              }`}>
                {caseData.metrics}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {caseData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 border rounded text-xs ${
                      theme === 'dark'
                        ? 'border-dark-border text-dark-text-secondary'
                        : 'border-light-border text-light-text-secondary'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Summary Stats */}
      <div className={`mt-4 p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $impact_summary
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            projects_shown:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {caseIds.length}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            industries:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {new Set(caseIds.flatMap(id => cases[id].tags || [])).size}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            focus:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {sessionData?.meta?.emphasis?.[0] || 'diverse'}
          </span>
        </div>
      </div>
    </div>
  );
}