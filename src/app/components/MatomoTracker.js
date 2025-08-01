// src/app/components/MatomoTracker.js
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MatomoTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const MATOMO_URL = 'https://analytics.undevy.com';
    const SITE_ID = '1';
    const accessCode = searchParams.get('code');

    // This makes sure the script is only run in the browser
    if (typeof window === 'undefined') {
      return;
    }

    // Initialize the Matomo tracking array
    var _paq = window._paq = window._paq || [];
    
    // --- CORE TRACKING LOGIC ---
    
    // If a valid access code is present, set it as a custom dimension.
    // Replace '1' with the actual ID of your Custom Dimension if it's different.
    if (accessCode) {
      _paq.push(['setCustomDimension', 1, accessCode]);
    }
    
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    
    // --- SCRIPT INJECTION ---
    
    (function() {
      var u = MATOMO_URL;
      _paq.push(['setTrackerUrl', u + '/matomo.php']);
      _paq.push(['setSiteId', SITE_ID]);
      var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
      g.async = true; g.src = u + '/matomo.js';
      if (s && s.parentNode) {
        s.parentNode.insertBefore(g, s);
      }
    })();
    
  }, [searchParams]); // Rerun effect if search params change

  return null; // This component renders nothing
}