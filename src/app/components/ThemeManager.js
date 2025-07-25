// src/app/components/ThemeManager.js
'use client';

import { useEffect } from 'react';
import { useSession } from '../context/SessionContext';

// This component has no visual output. Its only job is to manage body classes.
export default function ThemeManager() {
  const { theme } = useSession();

  useEffect(() => {
    // This effect runs whenever the `theme` variable changes.
    const body = document.body;
    
    // Define classes for both themes
    const darkThemeClasses = ['bg-dark-bg', 'text-dark-text-primary'];
    const lightThemeClasses = ['bg-light-bg', 'text-light-text-primary'];

    if (theme === 'light') {
      body.classList.remove(...darkThemeClasses);
      body.classList.add(...lightThemeClasses);
    } else {
      body.classList.remove(...lightThemeClasses);
      body.classList.add(...darkThemeClasses);
    }
  }, [theme]); // The dependency array ensures this runs only when `theme` changes.

  return null; // Render nothing
}