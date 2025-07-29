// src/app/screens/Contact.js
'use client';

import { useSession } from '../context/SessionContext';
import { Mail, Globe, Calendar, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const { sessionData, theme, addLog } = useSession();
  const [emailCopied, setEmailCopied] = useState(false);
  
  const contactData = sessionData?.contact || {};
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactData.email);
    setEmailCopied(true);
    addLog(`EMAIL COPIED: ${contactData.email}`);
    
    // Сбросим статус через 2 секунды
    setTimeout(() => setEmailCopied(false), 2000);
  };
  
  const handleExternalLink = (label, url) => {
    addLog(`EXTERNAL LINK: ${label}`);
    window.open(url, '_blank');
  };
  
  const handleScheduleCall = () => {
    addLog('CALENDAR: Schedule request initiated');
    if (contactData.calendar_link) {
      window.open(contactData.calendar_link, '_blank');
    }
  };
  
  return (
    <div className="p-4">
      <div className={`mb-4 ${
        theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'
      }`}>
        <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
        }`}>
          Ready to collaborate on your next project
        </p>
      </div>
      
      {/* Contact Methods */}
      <div className="space-y-2 mb-4">
        {/* Email */}
        <button
          onClick={handleCopyEmail}
          className={`w-full p-3 border rounded flex items-center justify-between transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover'
              : 'border-light-border hover:bg-light-hover'
          }`}
        >
          <div className="flex items-center">
            <Mail className={`w-5 h-5 mr-3 ${
              theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
            }`} />
            <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
              {contactData.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className={`w-4 h-4 ${
              theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
            }`} />
            <span className={`text-xs ${
              emailCopied 
                ? (theme === 'dark' ? 'text-dark-success' : 'text-light-success')
                : (theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary')
            }`}>
              {emailCopied ? 'COPIED!' : 'CLICK TO COPY'}
            </span>
          </div>
        </button>
        
        {/* Website */}
        <button
          onClick={() => handleExternalLink('Portfolio website', contactData.website)}
          className={`w-full p-3 border rounded flex items-center justify-between transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover'
              : 'border-light-border hover:bg-light-hover'
          }`}
        >
          <div className="flex items-center">
            <Globe className={`w-5 h-5 mr-3 ${
              theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
            }`} />
            <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
              {contactData.website?.replace('https://', '')}
            </span>
          </div>
          <ExternalLink className={`w-4 h-4 ${
            theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'
          }`} />
        </button>
        
        {/* Schedule Call */}
        <button
          onClick={handleScheduleCall}
          className={`w-full p-3 border rounded flex items-center transition-colors ${
            theme === 'dark'
              ? 'border-dark-border hover:bg-dark-hover'
              : 'border-light-border hover:bg-light-hover'
          }`}
        >
          <Calendar className={`w-5 h-5 mr-3 ${
            theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
          }`} />
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            Schedule a Call
          </span>
        </button>
      </div>
      
      {/* Availability Status */}
      <div className={`p-3 border rounded ${
        theme === 'dark' ? 'border-dark-border' : 'border-light-border'
      }`}>
        <h3 className={`font-bold text-base mb-2 ${
          theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
        }`}>
          $availability_status
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $location:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {contactData.location}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $work_type:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {contactData.availability?.work_type}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $target_comp:
          </span>
          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary'}>
            {contactData.availability?.target_comp}
          </span>
          
          <span className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary'}>
            $start_date:
          </span>
          <span className={theme === 'dark' ? 'text-dark-success' : 'text-light-success'}>
            {contactData.availability?.status}
          </span>
        </div>
      </div>
      
      {/* Social Links (опционально) */}
      {contactData.social_links && (
        <div className={`mt-3 p-3 border rounded ${
          theme === 'dark' ? 'border-dark-border' : 'border-light-border'
        }`}>
          <h3 className={`font-bold text-base mb-2 ${
            theme === 'dark' ? 'text-dark-text-command' : 'text-light-text-command'
          }`}>
            $social_links
          </h3>
          <div className="flex gap-2">
            {Object.entries(contactData.social_links).map(([platform, url]) => (
              <button
                key={platform}
                onClick={() => handleExternalLink(platform, url)}
                className={`px-2 py-1 border rounded text-xs transition-colors ${
                  theme === 'dark'
                    ? 'border-dark-border hover:bg-dark-hover text-dark-text-primary'
                    : 'border-light-border hover:bg-light-hover text-light-text-primary'
                }`}
              >
                [{platform}]
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}