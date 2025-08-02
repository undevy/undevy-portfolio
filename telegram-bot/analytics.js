// telegram-bot/analytics.js

const fetch = require('node-fetch');

// Configuration from environment
const MATOMO_URL = 'https://analytics.undevy.com';
const SITE_ID = '1';
const TOKEN = process.env.MATOMO_TOKEN;
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

class AnalyticsMonitor {
  constructor(bot, adminUserId) {
    this.bot = bot;
    this.adminUserId = adminUserId;
    // Start checking from 1 hour ago on first run
    this.lastCheckTime = new Date(Date.now() - 60 * 60 * 1000);
    this.isRunning = false;
    this.checkTimer = null;
    
    console.log('[Analytics] Monitor initialized. Will check visits from:', this.lastCheckTime.toISOString());
  }

  /**
   * Start monitoring for new visits
   */
  start() {
    if (this.isRunning) {
      console.log('[Analytics] Monitor already running');
      return;
    }

    console.log('[Analytics] Starting monitor...');
    this.isRunning = true;
    
    // Do first check immediately
    this.checkForNewVisits();
    
    // Then check every 5 minutes
    this.checkTimer = setInterval(() => {
      this.checkForNewVisits();
    }, CHECK_INTERVAL);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.isRunning = false;
    console.log('[Analytics] Monitor stopped');
  }

  /**
   * Check Matomo for new visits since last check
   */
  async checkForNewVisits() {
    try {
      console.log('[Analytics] Checking for new visits...');
      console.log('[Analytics] Last check was at:', this.lastCheckTime.toISOString());
      
      // Build API URL
      const url = new URL(`${MATOMO_URL}/index.php`);
      url.searchParams.append('module', 'API');
      url.searchParams.append('method', 'Live.getLastVisitsDetails');
      url.searchParams.append('idSite', SITE_ID);
      url.searchParams.append('period', 'day');
      url.searchParams.append('date', 'today');
      url.searchParams.append('format', 'json');
      url.searchParams.append('token_auth', TOKEN);
      url.searchParams.append('filter_limit', '50'); // Get last 50 visits
      
      console.log('[Analytics] Fetching from:', url.toString());
      
      // Fetch data from Matomo
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Matomo API error: ${response.status}`);
      }
      
      const visits = await response.json();
      console.log('[Analytics] Total visits returned:', visits.length);
      
      // Debug: show first visit if exists
      if (visits.length > 0) {
        const firstVisitTime = new Date(visits[0].serverTimestamp * 1000);
        console.log('[Analytics] First visit time:', firstVisitTime.toISOString());
        console.log('[Analytics] Custom dimensions:', visits[0].customDimensions);
      }
      
      // Filter visits that happened after our last check
      const newVisits = visits.filter(visit => {
        // Use serverTimestamp which is a Unix timestamp
        const visitTime = new Date(visit.serverTimestamp * 1000); // Convert seconds to milliseconds
        const isNew = visitTime > this.lastCheckTime;
        
        if (!isNew && visits.indexOf(visit) < 3) {
          console.log(`[Analytics] Skipping old visit from ${visit.serverDate} ${visit.serverTimePretty} (${visitTime.toISOString()})`);
        }
        
        return isNew;
      });
      
      console.log(`[Analytics] Found ${newVisits.length} new visits`);
      
      // Process each new visit
      for (const visit of newVisits) {
        await this.processVisit(visit);
      }
      
      // Update last check time
      this.lastCheckTime = new Date();
      console.log('[Analytics] Updated last check time to:', this.lastCheckTime.toISOString());
      
    } catch (error) {
      console.error('[Analytics] Error checking visits:', error);
      
      // Notify admin about the error
      await this.sendMessage(
        `⚠️ Analytics Error\\!\n\n` +
        `Failed to check Matomo: ${this.escapeMarkdown(error.message)}`
      );
    }
  }

  /**
   * Process a single visit and send notification
   */
  async processVisit(visit) {
    try {
      // Extract access code from custom dimensions
      let accessCode = null;
      let company = null;
      
      // Matomo stores custom dimensions in the customDimensions object
      if (visit.customDimensions && visit.customDimensions['1']) {
        accessCode = visit.customDimensions['1'];
      }
      
      // Try to get company name from our content
      if (accessCode) {
        try {
          console.log('[Analytics] Fetching company name for code:', accessCode);
          const contentResponse = await fetch(`${process.env.API_URL}`, {
            headers: {
              'Authorization': `Bearer ${process.env.API_TOKEN}`
            }
          });
          
          if (contentResponse.ok) {
            const { content } = await contentResponse.json();
            if (content[accessCode]) {
              company = content[accessCode].meta?.company;
              console.log('[Analytics] Found company:', company);
            } else {
              console.log('[Analytics] Code not found in content');
            }
          } else {
            console.log('[Analytics] API response not OK:', contentResponse.status);
          }
        } catch (err) {
          console.error('[Analytics] Could not fetch company name:', err);
        }
      }
      
      // Extract visited pages
      const pages = visit.actionDetails
        .filter(action => action.type === 'action' && action.url)
        .map(action => {
          const url = action.url;
          // First try to get from hash
          const hashMatch = url.match(/#([^&?\s]+)/);
          if (hashMatch && hashMatch[1]) {
            return hashMatch[1];
          }
          // If no hash, check if it's the main page
          if (url.includes('?code=') && !url.includes('#')) {
            return 'Entry';
          }
          // Default to page title if available
          return action.pageTitle || 'Unknown';
        })
        .filter((page, index, self) => {
          // Remove consecutive duplicates
          return index === 0 || page !== self[index - 1];
        });
      
      // Build notification message
      let message = '';
      
      if (accessCode) {
        // Visit with access code
        message = `🎯 *New authenticated visit\\!*\n\n`;
        message += `📌 Code: \`${this.escapeMarkdown(accessCode)}\`\n`;
        if (company) {
          message += `🏢 Company: ${this.escapeMarkdown(company)}\n`;
        }
      } else {
        // Visit without access code
        message = `👤 *New anonymous visit*\n\n`;
      }
      
      // Add visit details
      message += `🕐 Time: ${this.escapeMarkdown(visit.serverTimePretty)}\n`;
      message += `📍 Location: ${this.escapeMarkdown(visit.country || 'Unknown')}, ${this.escapeMarkdown(visit.city || 'Unknown')}\n`;
      message += `📱 Device: ${this.escapeMarkdown(visit.deviceType)} \\(${this.escapeMarkdown(visit.browserName)}\\)\n`;
      
      // Add pages visited
      if (pages.length > 0) {
        message += `📄 Pages: ${pages.map(p => this.escapeMarkdown(p)).join(' → ')}\n`;
      }
      
      // Add visit duration if available
      if (visit.visitDurationPretty) {
        message += `⏱️ Duration: ${this.escapeMarkdown(visit.visitDurationPretty)}\n`;
      }
      
      // Add special emoji for bounce visits
      if (visit.visitCount === '1' && pages.length <= 1) {
        message += `\n⚡ \\(First time visitor, bounced\\)`;
      }
      
      // Send notification
      await this.sendMessage(message);
      
    } catch (error) {
      console.error('[Analytics] Error processing visit:', error);
    }
  }

  /**
   * Send message to admin
   */
  async sendMessage(text) {
    try {
      await this.bot.api.sendMessage(this.adminUserId, text, {
        parse_mode: 'MarkdownV2'
      });
    } catch (error) {
      console.error('[Analytics] Error sending message:', error);
    }
  }

  /**
   * Escape text for MarkdownV2
   */
  escapeMarkdown(text) {
    if (!text) return '';
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }
}

module.exports = AnalyticsMonitor;