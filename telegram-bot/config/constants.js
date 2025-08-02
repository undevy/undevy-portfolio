// telegram-bot/config/constants.js

module.exports = {
  // Environment variables
  TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  API_URL: process.env.API_URL,
  API_TOKEN: process.env.API_TOKEN,
  ADMIN_USER_ID: process.env.ADMIN_USER_ID,
  MATOMO_TOKEN: process.env.MATOMO_TOKEN,
  
  // Paths and directories
  BACKUP_DIR: process.env.BACKUP_DIR,
  
  // Analytics
  MATOMO_URL: process.env.MATOMO_URL,
  MATOMO_SITE_ID: '1',
  ANALYTICS_CHECK_INTERVAL: 5 * 60 * 1000,
  
  // Bot settings
  MAX_MESSAGE_LENGTH: 4096,
  BACKUP_RETENTION: 10,
  
  // Emojis for bot responses
  EMOJI: {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    LOADING: '⏳',
    NEW: '🆕',
    EDIT: '✏️',
    DELETE: '🗑️',
    ANALYTICS: '📊',
    VISIT: '🎯',
    ANONYMOUS: '👤'
  }
};