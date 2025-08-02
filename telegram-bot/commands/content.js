// telegram-bot/commands/content.js

const { InlineKeyboard, InputFile } = require('grammy');
const { EMOJI } = require('../config/constants');
const { escapeMarkdown, truncateText, parseBackupName } = require('../utils/format');
const { getContent } = require('../services/api');
const { getBackupFiles, loadBackup, findDifferences } = require('../services/backup');
const { findProfilesUsingCase } = require('../utils/validators');
const { withErrorHandling } = require('../handlers/errors');
const stateManager = require('../stateManager');
const path = require('path');

/**
 * Handles /get command
 * Downloads current content.json
 */
const handleGet = withErrorHandling(async (ctx) => {
  await ctx.reply(`${EMOJI.LOADING} Fetching content.json...`);
  
  const result = await getContent();
  const contentStr = JSON.stringify(result.content, null, 2);
  const file = new InputFile(Buffer.from(contentStr, 'utf-8'), 'content.json');
  
  await ctx.replyWithDocument(file, { 
    caption: `📄 Current content.json\n🕒 ${new Date().toLocaleString('ru-RU')}` 
  });
});

/**
 * Handles /list_cases command
 * Shows all available case studies
 */
const handleListCases = withErrorHandling(async (ctx) => {
  await ctx.reply(`${EMOJI.LOADING} Loading case studies...`);
  
  const { content } = await getContent();
  const cases = content.GLOBAL_DATA?.case_studies;
  
  if (!cases || Object.keys(cases).length === 0) {
    return await ctx.reply(`${EMOJI.INFO} No case studies found in content.`);
  }
  
  const caseIds = Object.keys(cases);
  let message = `📋 *Available Case Studies \\(${caseIds.length}\\):*\n\n`;
  
  caseIds.forEach((id, index) => {
    const caseData = cases[id];
    const tags = caseData.tags?.length > 0 
      ? caseData.tags.join(', ') 
      : 'No tags';
    
    message += `${index + 1}\\. *${escapeMarkdown(id)}*\n`;
    message += `   📌 ${escapeMarkdown(caseData.title || 'Untitled')}\n`;
    message += `   📝 ${escapeMarkdown(truncateText(caseData.desc, 50))}\n`;
    message += `   📊 ${escapeMarkdown(caseData.metrics || 'No metrics')}\n`;
    message += `   🏷️ ${escapeMarkdown(tags)}\n\n`;
  });
  
  message += `💡 *Commands:*\n`;
  message += `• /preview \\[case\\_id\\] — View full details\n`;
  message += `• /edit\\_case \\[case\\_id\\] — Edit case\n`;
  message += `• /delete\\_case \\[case\\_id\\] — Delete case`;
  
  await ctx.reply(message, { parse_mode: 'MarkdownV2' });
});

/**
 * Handles /preview command
 * Shows detailed case study information
 */
const handlePreview = withErrorHandling(async (ctx) => {
  const caseId = ctx.message.text.split(' ')[1];
  
  if (!caseId) {
    return await ctx.reply(`${EMOJI.ERROR} Usage: /preview [case_id]`);
  }
  
  await ctx.reply(`${EMOJI.LOADING} Loading case: ${escapeMarkdown(caseId)}...`);
  
  const { content } = await getContent();
  const caseStudy = content.GLOBAL_DATA?.case_studies?.[caseId];
  
  if (!caseStudy) {
    return await ctx.reply(`${EMOJI.ERROR} Case "${escapeMarkdown(caseId)}" not found.`);
  }
  
  const caseDetails = content.GLOBAL_DATA?.case_details?.[caseId];
  
  // Build preview message
  let message = `🔍 *Preview: ${escapeMarkdown(caseStudy.title || 'Untitled')}*\n\n`;
  
  // Basic info
  message += `*📋 Basic Information:*\n`;
  message += `• ID: \`${escapeMarkdown(caseId)}\`\n`;
  message += `• Description: ${escapeMarkdown(caseStudy.desc || 'Not set')}\n`;
  message += `• Metrics: ${escapeMarkdown(caseStudy.metrics || 'Not set')}\n`;
  message += `• Tags: ${escapeMarkdown(caseStudy.tags?.join(', ') || 'No tags')}\n\n`;
  
  // Detailed content
  if (caseDetails) {
    message += `*📖 Detailed Content:*\n\n`;
    
    if (caseDetails.challenge) {
      message += `*Challenge:*\n`;
      message += `${escapeMarkdown(truncateText(caseDetails.challenge, 300))}\n\n`;
    }
    
    if (caseDetails.approach?.length > 0) {
      message += `*Approach \\(${caseDetails.approach.length} steps\\):*\n`;
      const stepsToShow = caseDetails.approach.slice(0, 3);
      stepsToShow.forEach((step, i) => {
        message += `${i + 1}\\. ${escapeMarkdown(truncateText(step, 100))}\n`;
      });
      if (caseDetails.approach.length > 3) {
        message += `\\.\\.\\.and ${caseDetails.approach.length - 3} more steps\n`;
      }
      message += '\n';
    }
    
    if (caseDetails.results?.length > 0) {
      message += `*Results \\(${caseDetails.results.length} items\\):*\n`;
      const resultsToShow = caseDetails.results.slice(0, 3);
      resultsToShow.forEach(result => {
        message += `• ${escapeMarkdown(result)}\n`;
      });
      if (caseDetails.results.length > 3) {
        message += `\\.\\.\\.and ${caseDetails.results.length - 3} more results\n`;
      }
    }
  } else {
    message += `*ℹ️ No detailed content available for this case*`;
  }
  
  await ctx.reply(message, { parse_mode: 'MarkdownV2' });
});

/**
 * Handles /add_case command
 * Starts interactive case creation
 */
const handleAddCase = withErrorHandling(async (ctx) => {
  const userId = ctx.from.id;
  
  // Check for active conversation
  if (stateManager.hasActiveState(userId)) {
    return await ctx.reply(
      `${EMOJI.WARNING} You already have an active session. ` +
      `Please finish it or use /cancel to discard it.`
    );
  }
  
  // Initialize conversation state
  stateManager.initUserState(userId);
  stateManager.updateUserState(userId, {
    command: 'add_case',
    currentStep: stateManager.ADD_CASE_STATES.WAITING_ID,
    data: {
      id: null,
      title: null,
      desc: null,
      metrics: null,
      tags: [],
      challenge: null,
      approach: [],
      solution: null,
      results: [],
      learnings: null
    }
  });
  
  // Send first step
  const message = `${EMOJI.NEW} *New Case Creation*\n\n` +
    `📝 Step 1/10: *Enter a unique case ID*\n\n` +
    `ID requirements:\n` +
    `• Use only Latin letters, numbers, and underscores\n` +
    `• Examples: \`gmx\\_v2\`, \`defi\\_protocol\\_2024\`\n` +
    `• The ID must be unique\n\n` +
    `💡 Tip: Use a short, descriptive project name`;
  
  await ctx.reply(message, { parse_mode: 'MarkdownV2' });
});

/**
 * Handles /edit_case command
 * Starts interactive case editing
 */
const handleEditCase = withErrorHandling(async (ctx) => {
  const userId = ctx.from.id;
  const args = ctx.message.text.split(' ').slice(1);
  const caseId = args[0];
  
  // Check for active conversation
  if (stateManager.hasActiveState(userId)) {
    return await ctx.reply(
      `${EMOJI.WARNING} You already have an active dialog\\. ` +
      `Complete it or send /cancel to abort\\.`,
      { parse_mode: 'MarkdownV2' }
    );
  }
  
  if (caseId) {
    // Case ID provided - start editing directly
    const { content } = await getContent();
    const caseBasic = content.GLOBAL_DATA?.case_studies?.[caseId];
    
    if (!caseBasic) {
      return await ctx.reply(
        `${EMOJI.ERROR} Case with ID "${escapeMarkdown(caseId)}" not found`,
        { parse_mode: 'MarkdownV2' }
      );
    }
    
    // Start editing flow
    // The actual flow will be handled by conversation handler
    ctx.reply(`${EMOJI.EDIT} Starting edit flow for case: ${escapeMarkdown(caseId)}`);

    const caseDetails = content.GLOBAL_DATA?.case_details?.[caseId] || {};

    stateManager.initUserState(userId);
    stateManager.updateUserState(userId, {
    command: 'edit_case',
    currentStep: stateManager.EDIT_CASE_STATES.WAITING_TITLE,
    data: {
      id: caseId,
      title: caseBasic.title || '',
      desc: caseBasic.desc || '',
      metrics: caseBasic.metrics || '',
      tags: caseBasic.tags || [],
      challenge: caseDetails.challenge || '',
      approach: caseDetails.approach || [],
      solution: caseDetails.solution || '',
      results: caseDetails.results || [],
      learnings: caseDetails.learnings || ''
    }
    });

    await ctx.reply(
    `📝 Enter *new title* for case or send /keep to leave unchanged`,
    { parse_mode: 'MarkdownV2' }
    );

  } else {
    // No ID - ask for it
    stateManager.initUserState(userId);
    stateManager.updateUserState(userId, {
      command: 'edit_case',
      currentStep: stateManager.EDIT_CASE_STATES.WAITING_CASE_ID,
      data: {}
    });
    
    await ctx.reply(
      `${EMOJI.EDIT} *Edit Case Study*\n\n` +
      `Enter the case ID you want to edit\\.\n` +
      `Use /list\\_cases to see available cases\\.`,
      { parse_mode: 'MarkdownV2' }
    );
  }
});

/**
 * Handles /delete_case command
 * Shows preview and confirmation before deletion
 */
const handleDeleteCase = withErrorHandling(async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const caseId = args[0];
  
  if (!caseId) {
    return await ctx.reply(
      `${EMOJI.ERROR} Please provide a case ID to delete\n\n` +
      `Usage: \`/delete_case case_id\`\n` +
      `Example: \`/delete_case gmx_v2\`\n\n` +
      `Use /list_cases to see available cases`
    );
  }
  
  // Load case for preview
  const { content } = await getContent();
  const caseBasic = content.GLOBAL_DATA?.case_studies?.[caseId];
  
  if (!caseBasic) {
    return await ctx.reply(
      `${EMOJI.ERROR} Case with ID "${escapeMarkdown(caseId)}" not found`,
      { parse_mode: 'MarkdownV2' }
    );
  }
  
  // Check usage in profiles
  const usedInProfiles = findProfilesUsingCase(content, caseId);
  
  // Build preview message
  let previewMessage = `${EMOJI.DELETE} *Delete Case Preview*\n\n`;
  previewMessage += `⚠️ *You are about to delete:*\n\n`;
  previewMessage += `📋 *Case Information:*\n`;
  previewMessage += `• ID: \`${escapeMarkdown(caseId)}\`\n`;
  previewMessage += `• Title: ${escapeMarkdown(caseBasic.title || 'Untitled')}\n`;
  previewMessage += `• Tags: ${escapeMarkdown(caseBasic.tags?.join(', ') || 'No tags')}\n\n`;
  
  if (usedInProfiles.length > 0) {
    previewMessage += `⚠️ *WARNING: Used in ${usedInProfiles.length} profile\\(s\\):*\n`;
    previewMessage += escapeMarkdown(usedInProfiles.join(', ')) + '\n\n';
    previewMessage += `*Deleting will remove it from these profiles\\!*\n\n`;
  }
  
  previewMessage += `❗ *This action cannot be undone\\!*\n\n`;
  previewMessage += `Are you sure you want to delete this case?`;
  
  // Create confirmation keyboard
  const keyboard = new InlineKeyboard()
    .text(`${EMOJI.ERROR} Yes, DELETE`, `delete_confirm_${caseId}`)
    .text(`${EMOJI.SUCCESS} Cancel`, 'delete_cancel');
  
  await ctx.reply(previewMessage, { 
    parse_mode: 'MarkdownV2',
    reply_markup: keyboard 
  });
});

/**
 * Handles /history command
 * Shows version history
 */
const handleHistory = withErrorHandling(async (ctx) => {
  await ctx.reply(`${EMOJI.LOADING} Loading change history...`);
  
  const backupFiles = await getBackupFiles();
  
  if (backupFiles.length === 0) {
    return await ctx.reply(
      `${EMOJI.INFO} No history found. Backups are created when content changes.`
    );
  }
  
  let historyMessage = `📜 *Change History \\(last 10\\):*\n\n`;
  const recentFiles = backupFiles.slice(0, 10);
  
  recentFiles.forEach((filename, i) => {
    historyMessage += `${i + 1}\\. ${escapeMarkdown(parseBackupName(filename))}\n`;
    historyMessage += `   └ File: \`${escapeMarkdown(filename)}\`\n\n`;
  });
  
  historyMessage += `💡 Use /rollback N to restore version N`;
  
  await ctx.reply(historyMessage, { parse_mode: 'MarkdownV2' });
});

/**
 * Handles /rollback command
 * Restores content from backup
 */
const handleRollback = withErrorHandling(async (ctx) => {
  const versionNumber = parseInt(ctx.message.text.split(' ')[1]);
  
  if (!versionNumber || versionNumber < 1) {
    return await ctx.reply(
      `${EMOJI.ERROR} Usage: /rollback N\n\n` +
      `Where N is the version number from /history (1 = most recent)`
    );
  }
  
  await ctx.reply(`${EMOJI.LOADING} Loading backup #${versionNumber}...`);
  
  const backupFiles = await getBackupFiles();
  
  if (versionNumber > backupFiles.length) {
    return await ctx.reply(
      `${EMOJI.ERROR} Version #${versionNumber} not found. ` +
      `Available: 1-${backupFiles.length}`
    );
  }
  
  const selectedBackup = backupFiles[versionNumber - 1];
  
  // Create confirmation keyboard
  const keyboard = new InlineKeyboard()
    .text(`${EMOJI.SUCCESS} Confirm Rollback`, `rollback_confirm_${versionNumber}`)
    .text(`${EMOJI.ERROR} Cancel`, 'rollback_cancel');
  
  await ctx.reply(
    `⚠️ *Rollback Confirmation*\n\n` +
    `You are about to restore version \\#${versionNumber}:\n` +
    `📅 Date: ${escapeMarkdown(parseBackupName(selectedBackup))}\n` +
    `📄 File: \`${escapeMarkdown(selectedBackup)}\`\n\n` +
    `This will replace the current content\\.json\\. Are you sure?`,
    { parse_mode: 'MarkdownV2', reply_markup: keyboard }
  );
});

/**
 * Handles /diff command
 * Compares content versions
 */
const handleDiff = withErrorHandling(async (ctx) => {
  const args = ctx.message.text.split(' ');
  const version1 = parseInt(args[1]);
  const version2 = parseInt(args[2]);
  
  if (!version1) {
    return await ctx.reply(
      `${EMOJI.ERROR} Usage: /diff N [M]\n\n` +
      `• /diff 1 — compare current with backup #1\n` +
      `• /diff 1 2 — compare backup #1 with #2`
    );
  }
  
  await ctx.reply(`${EMOJI.LOADING} Analyzing differences...`);
  
  // Load content for comparison
  let content1, label1;
  if (version2) {
    // Compare two backups
    const backup1 = await loadBackup(version1);
    content1 = backup1.data;
    label1 = `Backup \\#${version1}`;
  } else {
    // Compare current with backup
    const { content } = await getContent();
    content1 = content;
    label1 = 'Current';
  }
  
  const compareVersion = version2 || version1;
  const backup2 = await loadBackup(compareVersion);
  const content2 = backup2.data;
  const label2 = `Backup \\#${compareVersion}`;
  
  // Find differences
  const differences = findDifferences(content1, content2);
  
  if (differences.length === 0) {
    return await ctx.reply(
      `${EMOJI.SUCCESS} No differences found between ${label1} and ${label2}`
    );
  }
  
  // Format differences message
  let message = `📊 *Differences: ${label1} → ${label2}*\n\n`;
  message += `Found ${differences.length} change\\(s\\):\n\n`;
  
  // Show first 20 differences
  const diffsToShow = differences.slice(0, 20);
  diffsToShow.forEach(diff => {
    const icon = diff.type === 'added' ? '➕' : 
                 diff.type === 'removed' ? '➖' : '✏️';
    const type = diff.type.charAt(0).toUpperCase() + diff.type.slice(1);
    message += `${icon} ${type}: \`${escapeMarkdown(diff.path)}\`\n`;
  });
  
  if (differences.length > 20) {
    message += `\n\\.\\.\\.and ${differences.length - 20} more change\\(s\\)`;
  }
  
  await ctx.reply(message, { parse_mode: 'MarkdownV2' });
});

module.exports = {
  handleGet,
  handleListCases,
  handlePreview,
  handleAddCase,
  handleEditCase,
  handleDeleteCase,
  handleHistory,
  handleRollback,
  handleDiff
};