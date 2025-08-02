// telegram-bot/analytics.js

const { ANALYTICS_CHECK_INTERVAL, EMOJI } = require('./config/constants');
const { escapeMarkdown } = require('./utils/format');
const { getContent } = require('./services/api');
const {
  getRecentVisits,
  extractAccessCode,
  extractVisitedPages,
} = require('./services/matomo');

class AnalyticsMonitor {
  constructor(bot, adminUserId) {
    this.bot = bot;
    this.adminUserId = adminUserId;
    this.lastCheckTime = new Date(Date.now() - 60 * 60 * 1000); 
    this.isRunning = false;
    this.checkTimer = null;

    console.log('[ANALYTICS] Monitor initialized');
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.checkTimer = setInterval(() => this.checkVisits(), ANALYTICS_CHECK_INTERVAL);
    console.log('[ANALYTICS] Monitor started');
  }

  stop() {
    if (!this.isRunning) return;

    clearInterval(this.checkTimer);
    this.isRunning = false;
    console.log('[ANALYTICS] Monitor stopped');
  }

  async checkVisits() {
    try {
      const since = this.lastCheckTime.toISOString();
      const now = new Date();
      const visits = await getRecentVisits(since, now.toISOString());

      console.log('[ANALYTICS] Visits since', since, '->', visits.length);

      this.lastCheckTime = now;

      if (!visits || visits.length === 0) return;

      for (const visit of visits) {
        const accessCode = extractAccessCode(visit);
        const visitedPages = extractVisitedPages(visit);

        console.log('[ANALYTICS] Visit:', visit);
        console.log('[ANALYTICS] Access code:', accessCode);
        console.log('[ANALYTICS] Pages:', visitedPages);

        if (!accessCode || visitedPages.length === 0) continue;

        const content = await getContent(accessCode);
        if (!content) continue;

        const companyName = content.name || 'Unknown';

        const pagesList = visitedPages
          .map((page) => `• ${escapeMarkdown(page)}`)
          .join('\n');

        const message = [
          `${EMOJI.chart} *New Visit*`,
          `Company: *${escapeMarkdown(companyName)}*`,
          `Access Code: \`${accessCode}\``,
          '',
          `Visited Pages:\n${pagesList}`,
        ].join('\n');

        await this.bot.api.sendMessage(this.adminUserId, message, {
          parse_mode: 'MarkdownV2',
        });

        console.log(`[ANALYTICS] Notified admin about visit from ${companyName}`);
      }
    } catch (error) {
      console.error('[ANALYTICS] Error checking visits:', error);
    }
  }
}

module.exports = AnalyticsMonitor;
