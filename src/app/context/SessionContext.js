// src/app/context/SessionContext.js
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SessionContext = createContext(null);

// Helper function for timestamp formatting
const getTimestamp = () => {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export function SessionProvider({ children }) {
  // ========== SESSION STATE ==========
  const [sessionData, setSessionData] = useState(null);
  
  // ========== NAVIGATION ==========
  const [currentScreen, setCurrentScreen] = useState('Entry');
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [screensVisitedCount, setScreensVisitedCount] = useState(1);
  
  // ========== SELECTED ITEMS ==========
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  // ========== UI STATE ==========
  const [theme, setTheme] = useState('dark');
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState({});
  
  // ========== SYSTEM LOG ==========
  const [logEntries, setLogEntries] = useState([]);
  
  // ========== LOGGING FUNCTIONS ==========
  const addLog = useCallback((message) => {
    const newEntry = `[${getTimestamp()}] ${message}`;
    setLogEntries(prev => [...prev, newEntry].slice(-20));
  }, []);
  
  // ========== NAVIGATION FUNCTIONS ==========
  const navigate = useCallback((screen, addToHistory = true) => {
    // Don't navigate if already on this screen
    if (currentScreen === screen) return;
    
    // Add current screen to history if needed
    if (addToHistory && currentScreen !== 'Entry') {
      setNavigationHistory(prev => [...prev, currentScreen]);
    }
    
    // Navigate to new screen
    setCurrentScreen(screen);
    setScreensVisitedCount(prev => prev + 1);
    addLog(`NAVIGATE: ${currentScreen} → ${screen}`);
    
    // Update hash while preserving query params
    if (typeof window !== 'undefined') {
      if (screen !== 'Entry') {
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = screen;
        window.history.replaceState({}, '', currentUrl.toString());
      } else {
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = '';
        window.history.replaceState({}, '', currentUrl.toString());
      }
    }
    
    // Clear selections when navigating to main screens
    if (['MainHub', 'Entry'].includes(screen)) {
      setSelectedCase(null);
      setSelectedRole(null);
      setSelectedSkill(null);
    }
  }, [currentScreen, addLog]);
  
  const goBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const newHistory = [...navigationHistory];
      const previousScreen = newHistory.pop();
      setNavigationHistory(newHistory);
      
      addLog(`NAVIGATE BACK: ${currentScreen} → ${previousScreen}`);
      setCurrentScreen(previousScreen);
      setScreensVisitedCount(prev => prev + 1);
      
      // Update hash
      if (typeof window !== 'undefined') {
        if (previousScreen !== 'Entry') {
          const currentUrl = new URL(window.location.href);
          currentUrl.hash = previousScreen;
          window.history.replaceState({}, '', currentUrl.toString());
        } else {
          const currentUrl = new URL(window.location.href);
          currentUrl.hash = '';
          window.history.replaceState({}, '', currentUrl.toString());
        }
      }
    } else {
      // No history - go to MainHub
      navigate('MainHub', false);
    }
  }, [navigationHistory, currentScreen, navigate, addLog]);
  
  const goHome = useCallback(() => {
    addLog('NAVIGATE HOME');
    setNavigationHistory([]);
    setCurrentScreen('MainHub');
    setScreensVisitedCount(prev => prev + 1);
    setSelectedCase(null);
    setSelectedRole(null);
    setSelectedSkill(null);
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      currentUrl.hash = 'MainHub';
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, [addLog]);
  
  // ========== HASH ROUTING ==========
  useEffect(() => {
    if (!sessionData || typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash !== currentScreen && sessionData) {
        setCurrentScreen(hash);
        setScreensVisitedCount(prev => prev + 1);
        addLog(`HASH NAVIGATE: ${currentScreen} → ${hash}`);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    const initialHash = window.location.hash.slice(1);
    if (initialHash && initialHash !== currentScreen) {
      setCurrentScreen(initialHash);
      setScreensVisitedCount(prev => prev + 1);
      addLog(`INITIAL HASH: ${initialHash}`);
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sessionData, currentScreen, addLog]);
  
  // ========== UI FUNCTIONS ==========
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    addLog(`THEME CHANGED: ${newTheme.toUpperCase()}`);
  }, [theme, addLog]);
  
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    addLog(`SECTION ${expandedSections[sectionId] ? 'COLLAPSED' : 'EXPANDED'}: ${sectionId}`);
  }, [expandedSections, addLog]);
  
  const setTab = useCallback((screenId, tabId) => {
    setActiveTab(prev => ({
      ...prev,
      [screenId]: tabId
    }));
    addLog(`TAB SELECTED: ${tabId} on ${screenId}`);
  }, [addLog]);
  
  // ========== SESSION FUNCTIONS ==========
  const endSession = useCallback(() => {
  addLog('SESSION TERMINATED');
  setSessionData(null);
  setNavigationHistory([]);
  setCurrentScreen('Entry');
  setSelectedCase(null);
  setSelectedRole(null);
  setSelectedSkill(null);
  setExpandedSections({});
  setActiveTab({});
  setScreensVisitedCount(1);
  if (typeof window !== 'undefined') {
    // Полностью очищаем URL от code и hash
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('code'); // Удаляем параметр code
    currentUrl.hash = ''; // Удаляем hash
    window.history.replaceState({}, '', currentUrl.toString());
  }
}, [addLog]);
  
  // ========== INITIALIZATION ==========
  useEffect(() => {
    addLog('SYSTEM INITIALIZED');
    addLog('PORTFOLIO v2.1.0 LOADED');
  }, [addLog]);
  
  // ========== CONTEXT VALUE ==========
  const value = {
    // Session data
    sessionData,
    setSessionData,
    
    // Navigation
    currentScreen,
    navigationHistory,
    setNavigationHistory,
    navigate,
    goBack,
    goHome,
    
    // Selected items
    selectedCase,
    setSelectedCase,
    selectedRole,
    setSelectedRole,
    selectedSkill,
    setSelectedSkill,
    
    // UI state
    theme,
    toggleTheme,
    expandedSections,
    toggleSection,
    activeTab,
    setTab,
    
    // System log
    logEntries,
    addLog,
    screensVisitedCount,
    
    // Session management
    endSession,
  };
  
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// Hook for using context
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}