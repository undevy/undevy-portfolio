// telegram-bot/commands/index.js

// Import all command modules
const systemCommands = require('./system');
const contentCommands = require('./content');
const analyticsCommands = require('./analytics');

/**
 * Registers all bot commands
 * @param {Bot} bot - Grammy bot instance
 */
function registerCommands(bot) {
  // System commands
  bot.command(['start', 'help'], systemCommands.handleStart);
  bot.command('status', systemCommands.handleStatus);
  bot.command('cancel', systemCommands.handleCancel);
  bot.command('skip', systemCommands.handleSkip);
  bot.command('keep', systemCommands.handleKeep);
  
  // Content viewing commands
  bot.command('get', contentCommands.handleGet);
  bot.command('list_cases', contentCommands.handleListCases);
  bot.command('preview', contentCommands.handlePreview);
  
  // Content management commands
  bot.command('add_case', contentCommands.handleAddCase);
  bot.command('edit_case', contentCommands.handleEditCase);
  bot.command('delete_case', contentCommands.handleDeleteCase);
  
  // Version control commands
  bot.command('history', contentCommands.handleHistory);
  bot.command('rollback', contentCommands.handleRollback);
  bot.command('diff', contentCommands.handleDiff);
  
  // Analytics commands
  bot.command('analytics', analyticsCommands.handleAnalytics);
  bot.command('analytics_stop', analyticsCommands.handleAnalyticsStop);
  bot.command('analytics_start', analyticsCommands.handleAnalyticsStart);
  bot.command('recent_visits', analyticsCommands.handleRecentVisits);
  bot.command('test_matomo', analyticsCommands.handleTestMatomo);
  bot.command('debug_visits', analyticsCommands.handleDebugVisits);
  
  console.log('[COMMANDS] All commands registered successfully');
}

/**
 * Export all command handlers for testing or direct access
 */
module.exports = {
  registerCommands,
  system: systemCommands,
  content: contentCommands,
  analytics: analyticsCommands
};