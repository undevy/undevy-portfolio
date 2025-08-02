// telegram-bot/handlers/callbacks.js

const { InlineKeyboard } = require('grammy');
const { EMOJI } = require('../config/constants');
const { escapeMarkdown } = require('../utils/format');
const { getContent, updateContent } = require('../services/api');
const { loadBackup } = require('../services/backup');
const { findProfilesUsingCase } = require('../utils/validators');
const path = require('path');

/**
 * Sets up all callback query handlers
 * @param {Bot} bot - Grammy bot instance
 */
function setupCallbackHandlers(bot) {
  // Rollback confirmation
  bot.callbackQuery(/^rollback_confirm_(\d+)$/, handleRollbackConfirm);
  bot.callbackQuery('rollback_cancel', handleRollbackCancel);
  
  // Delete case confirmation
  bot.callbackQuery(/^delete_confirm_(.+)$/, handleDeleteConfirm);
  bot.callbackQuery('delete_cancel', handleDeleteCancel);
  
  // Generic test menu actions
  bot.callbackQuery('action_status', handleActionStatus);
  bot.callbackQuery('action_get', handleActionGet);
  bot.callbackQuery('action_history', handleActionHistory);
  bot.callbackQuery('action_help', handleActionHelp);
}

/**
 * Handles rollback confirmation
 */
async function handleRollbackConfirm(ctx) {
  await ctx.answerCallbackQuery();
  const versionNumber = parseInt(ctx.match[1]);
  
  try {
    await ctx.editMessageText(`${EMOJI.LOADING} Performing rollback...`);
    
    // Load backup
    const backup = await loadBackup(versionNumber);
    
    // Update content
    const result = await updateContent(backup.data);
    
    await ctx.editMessageText(
      `${EMOJI.SUCCESS} *Rollback Successful\\!*\n\n` +
      `Restored version \\#${versionNumber}\n` +
      `New backup created: \`${escapeMarkdown(path.basename(result.backup || 'unknown'))}\`\n\n` +
      `Use /status to verify\\.`,
      { parse_mode: 'MarkdownV2' }
    );
  } catch (error) {
    console.error('[CALLBACK] Rollback error:', error);
    await ctx.editMessageText(
      `${EMOJI.ERROR} Rollback failed: ${escapeMarkdown(error.message)}`,
      { parse_mode: 'MarkdownV2' }
    );
  }
}

/**
 * Handles rollback cancellation
 */
async function handleRollbackCancel(ctx) {
  await ctx.answerCallbackQuery('Rollback cancelled');
  await ctx.editMessageText(`${EMOJI.INFO} Rollback cancelled. No changes were made.`);
}

/**
 * Handles delete case confirmation
 */
async function handleDeleteConfirm(ctx) {
  await ctx.answerCallbackQuery();
  const caseId = ctx.match[1];
  
  try {
    await ctx.editMessageText(`${EMOJI.LOADING} Deleting case...`);
    
    // Get current content
    const { content } = await getContent();
    
    // Verify case still exists
    if (!content.GLOBAL_DATA?.case_studies?.[caseId]) {
      return await ctx.editMessageText(`${EMOJI.ERROR} Case no longer exists`);
    }
    
    // Delete from case_studies
    delete content.GLOBAL_DATA.case_studies[caseId];
    
    // Delete from case_details if exists
    if (content.GLOBAL_DATA.case_details?.[caseId]) {
      delete content.GLOBAL_DATA.case_details[caseId];
    }
    
    // Remove from all profiles
    let profilesUpdated = 0;
    for (const [profileId, profile] of Object.entries(content)) {
      if (profileId !== 'GLOBAL_DATA' && profile.meta?.cases?.includes(caseId)) {
        profile.meta.cases = profile.meta.cases.filter(id => id !== caseId);
        profilesUpdated++;
      }
    }
    
    // Save changes
    const result = await updateContent(content);
    
    // Success message
    await ctx.editMessageText(
      `${EMOJI.SUCCESS} *Case successfully deleted\\!*\n\n` +
      `• Case ID: \`${escapeMarkdown(caseId)}\`\n` +
      `• Backup created: \`${escapeMarkdown(path.basename(result.backup || 'unknown'))}\`\n` +
      `${profilesUpdated > 0 ? `• Removed from ${profilesUpdated} profile\\(s\\)\n` : ''}\n` +
      `💡 Use /rollback if you need to restore it\\.`,
      { parse_mode: 'MarkdownV2' }
    );
    
  } catch (error) {
    console.error('[CALLBACK] Delete error:', error);
    await ctx.editMessageText(
      `${EMOJI.ERROR} Failed to delete: ${escapeMarkdown(error.message)}`,
      { parse_mode: 'MarkdownV2' }
    );
  }
}

/**
 * Handles delete cancellation
 */
async function handleDeleteCancel(ctx) {
  await ctx.answerCallbackQuery('Deletion cancelled');
  await ctx.editMessageText(
    `${EMOJI.SUCCESS} Deletion cancelled\\. The case was not deleted\\.`,
    { parse_mode: 'MarkdownV2' }
  );
}

/**
 * Test menu handlers
 */
async function handleActionStatus(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.deleteMessage();
  // The actual command logic will be imported from commands/system.js
  await ctx.reply(`${EMOJI.INFO} Status command would execute here`);
}

async function handleActionGet(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.deleteMessage();
  await ctx.reply(`${EMOJI.INFO} Get command would execute here`);
}

async function handleActionHistory(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.deleteMessage();
  await ctx.reply(`${EMOJI.INFO} History command would execute here`);
}

async function handleActionHelp(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.deleteMessage();
  await ctx.reply(`${EMOJI.INFO} Help command would execute here`);
}

module.exports = {
  setupCallbackHandlers
};