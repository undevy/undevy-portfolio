// telegram-bot/bot.js

// Load environment variables
const fs = require('fs');
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
} else {
  require('dotenv').config();
}

// Import Grammy
const { Bot } = require('grammy');

// Import our modules
const { TOKEN, ADMIN_USER_ID } = require('./config/constants');
const authMiddleware = require('./middleware/auth');
const { setupErrorHandler } = require('./handlers/errors');
const { setupCallbackHandlers } = require('./handlers/callbacks');
const { handleConversation } = require('./handlers/conversations');
const { registerCommands, analytics } = require('./commands');
const AnalyticsMonitor = require('./analytics');

// Validate configuration
if (!TOKEN) {
  console.error('[BOT] Missing TELEGRAM_BOT_TOKEN! Please check your .env file');
  process.exit(1);
}

// Initialize bot
const bot = new Bot(TOKEN);
console.log('[BOT] Bot instance created');

// Initialize analytics monitor
const analyticsMonitor = new AnalyticsMonitor(bot, ADMIN_USER_ID);
analytics.setAnalyticsMonitor(analyticsMonitor);
console.log('[BOT] Analytics monitor initialized');

// Setup middleware
bot.use(authMiddleware);
console.log('[BOT] Auth middleware attached');

// Setup error handling
setupErrorHandler(bot);
console.log('[BOT] Error handler configured');

// Register all commands
registerCommands(bot);
console.log('[BOT] Commands registered');

// Setup callback handlers
setupCallbackHandlers(bot);
console.log('[BOT] Callback handlers configured');

// Handle text messages (for conversations)
bot.on('message:text', async (ctx) => {
  // First try to handle as part of conversation
  const handled = await handleConversation(ctx);
  
  // If not part of conversation and starts with /, it's unknown command
  if (!handled && ctx.message.text.startsWith('/')) {
    await ctx.reply('❓ Unknown command. Use /help to see available commands.');
  }
});

// Start bot
bot.start({
  onStart: () => {
    console.log('[BOT] ✅ Bot started successfully!');
    console.log('[BOT] Waiting for messages...');
    
    // Start analytics monitoring
    analyticsMonitor.start();
    console.log('[BOT] Analytics monitoring started');
  },
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('[BOT] Received SIGINT, shutting down gracefully...');
  analyticsMonitor.stop();
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('[BOT] Received SIGTERM, shutting down gracefully...');
  analyticsMonitor.stop();
  bot.stop('SIGTERM');
});

console.log('[BOT] Bot initialization complete');