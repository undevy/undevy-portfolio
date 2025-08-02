// telegram-bot/commands/system.js

const { EMOJI } = require('../config/constants');
const { escapeMarkdown, formatFileSize, formatDate } = require('../utils/format');
const { getContent } = require('../services/api');
const { withErrorHandling } = require('../handlers/errors');
const stateManager = require('../stateManager');

/**
 * Handles /start and /help commands
 * Shows welcome message and available commands
 */

const handleStart = withErrorHandling(async (ctx) => {
  const welcomeMessage = `
🤖 *Portfolio Content Manager*

Available commands:

*Content Viewing:*
\\- /status — Check system status
\\- /get — Download current content\\.json
\\- /list\\_cases — List available case studies
\\- /preview \\[case\\_id\\] — View case study details

*Content Management:*
\\- /add\\_case — Create new case study \\(interactive\\)
\\- /edit\\_case \\[id\\] — Edit existing case study
\\- /delete\\_case \\[id\\] — Delete case study

*Version Control:*
\\- /history — View last 10 versions
\\- /rollback N — Restore version N
\\- /diff N \\[M\\] — Compare versions

*Analytics:*
\\- /analytics — Force check for new visits
\\- /recent\\_visits — Show last 5 visits
\\- /analytics\\_stop — Stop monitoring
\\- /analytics\\_start — Start monitoring

*Utility:*
\\- /cancel — Cancel active dialog
\\- /skip — Skip optional field
\\- /keep — Keep existing value \\(edit mode\\)
`;

  await ctx.reply(welcomeMessage, { parse_mode: 'MarkdownV2' });
});

/**
 * Handles /status command
 * Shows system status and statistics
 */
const handleStatus = withErrorHandling(async (ctx) => {
  await ctx.reply(`${EMOJI.LOADING} Checking status...`);
  
  const result = await getContent();
  
  // Count profiles
  const profileCount = Object.keys(result.content)
    .filter(key => key === key.toUpperCase() && key !== 'GLOBAL_DATA')
    .length;
  
  // Count case studies
  const caseCount = Object.keys(result.content.GLOBAL_DATA?.case_studies || {}).length;
  
  // Format status message
  const statusMessage = `
${EMOJI.SUCCESS} *System Status*

📊 *Content Statistics:*
\\- Profiles: ${escapeMarkdown(profileCount.toString())}
\\- Case studies: ${escapeMarkdown(caseCount.toString())}
\\- File size: ${escapeMarkdown(formatFileSize(result.stats.fileSize))}
\\- Last modified: ${escapeMarkdown(formatDate(result.stats.lastModified))}

🔗 *System Info:*
\\- Bot version: 2\\.0\\.0 \\(Modular\\)
\\- API status: Connected
\\- Server time: ${escapeMarkdown(formatDate(result.timestamp))}

💡 Use /list\\_cases to see all available cases
`;
  
  await ctx.reply(statusMessage, { parse_mode: 'MarkdownV2' });
});

/**
 * Handles /cancel command
 * Cancels any active conversation
 */
const handleCancel = withErrorHandling(async (ctx) => {
  const userId = ctx.from.id;
  
  if (!stateManager.hasActiveState(userId)) {
    return await ctx.reply(`${EMOJI.ERROR} You don't have any active sessions.`);
  }
  
  // Get state info before clearing
  const state = stateManager.getUserState(userId);
  const command = state.command;
  
  // Clear state
  stateManager.clearUserState(userId);
  
  await ctx.reply(
    `${EMOJI.SUCCESS} ${escapeMarkdown(command)} session cancelled\\. All entered data has been deleted\\.`,
    { parse_mode: 'MarkdownV2' }
  );
});

/**
 * Handles /skip command
 * Works only in active conversations
 */
const handleSkip = withErrorHandling(async (ctx) => {
  const userId = ctx.from.id;
  const state = stateManager.getUserState(userId);
  
  if (!state || !state.command) {
    return await ctx.reply(
      `${EMOJI.ERROR} The /skip command only works during content creation or editing.`
    );
  }
  
  // Forward to conversation handler with special /skip text
  ctx.message.text = '/skip';
  // This will be handled by conversation handler
});

/**
 * Handles /keep command  
 * Works only during edit conversations
 */
const handleKeep = withErrorHandling(async (ctx) => {
  const userId = ctx.from.id;
  const state = stateManager.getUserState(userId);
  
  if (!state || state.command !== 'edit_case') {
    return await ctx.reply(
      `${EMOJI.ERROR} The /keep command only works during case editing.`
    );
  }
  
  // Forward to conversation handler
  ctx.message.text = '/keep';
  // This will be handled by conversation handler
});

module.exports = {
  handleStart,
  handleStatus,
  handleCancel,
  handleSkip,
  handleKeep
};