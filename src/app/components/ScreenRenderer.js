// src/app/components/ScreenRenderer.js
'use client';

import { useSession } from '../context/SessionContext';
import TerminalWindow from '../layouts/TerminalWindow';
import dynamic from 'next/dynamic';

// Dynamic imports for optimization
const screens = {
  Entry: dynamic(() => import('../screens/Entry')),
  MainHub: dynamic(() => import('../screens/MainHub')),
  Introduction: dynamic(() => import('../screens/Introduction')),
  Timeline: dynamic(() => import('../screens/Timeline')),
  RoleDetail: dynamic(() => import('../screens/RoleDetail')),
  CaseList: dynamic(() => import('../screens/CaseList')),
  CaseDetail: dynamic(() => import('../screens/CaseDetail')),
  SkillsGrid: dynamic(() => import('../screens/SkillsGrid')),
  SkillDetail: dynamic(() => import('../screens/SkillDetail')),
  SideProjects: dynamic(() => import('../screens/SideProjects')),
  Contact: dynamic(() => import('../screens/Contact')),
};

export default function ScreenRenderer() {
    const { currentScreen, currentDomain } = useSession();
  
  // Get component for current screen
  const ScreenComponent = screens[currentScreen];
  
  // Get window title based on screen
  const getWindowTitle = () => {
    if (currentScreen === 'Entry') return `${currentDomain}_portfolio`;
    if (currentScreen === 'MainHub') return `${currentDomain}_portfolio`;
    
    // Convert CamelCase to snake_case correctly
    return currentScreen.replace(/([A-Z])/g, (match, p1, offset) => 
      offset > 0 ? '_' + p1.toLowerCase() : p1.toLowerCase()
    );
  };
  
  if (!ScreenComponent) {
    return (
      <TerminalWindow title="error">
        <div className="p-4 text-center">
          <h2 className="text-xl text-dark-error">Screen not found: {currentScreen}</h2>
        </div>
      </TerminalWindow>
    );
  }
  
  // Render current screen inside TerminalWindow
  return (
    <TerminalWindow title={getWindowTitle()}>
      <ScreenComponent />
    </TerminalWindow>
  );
}
