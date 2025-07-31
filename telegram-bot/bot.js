// bot.js
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { Bot, InlineKeyboard, GrammyError, HttpError, InputFile } = require('grammy');

// --- Configuration ---
const token = process.env.TELEGRAM_BOT_TOKEN;
const apiUrl = process.env.API_URL;
const apiToken = process.env.API_TOKEN;
const adminUserId = process.env.ADMIN_USER_ID;
const backupDir = process.env.BACKUP_DIR || '/home/undevy/content-backups';

if (!token || !apiUrl || !apiToken) {
  console.error('Missing required environment variables! Please check your .env file');
  process.exit(1);
}

const bot = new Bot(token);

// --- Helper Functions ---

/**
 * Escapes text for Telegram's MarkdownV2 format.
 * @param {string | number | null | undefined} text The text to escape.
 * @returns {string} The escaped text.
 */
function escapeMarkdownV2(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Calls the content management API.
 * @param {string} method - HTTP method (GET, PUT, PATCH).
 * @param {object|null} data - Data to send in the request body.
 * @returns {Promise<object>} - The JSON response from the API.
 */
async function callAPI(method, data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  try {
    const response = await fetch(apiUrl, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    if (method === 'PUT' || method === 'PATCH') {
      console.log(`[${new Date().toISOString()}] CONTENT MODIFIED via ${method}. Backup: ${result.backup}`);
    }
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Gets a sorted list of backup filenames from the backup directory.
 * @returns {Promise<string[]>} - A sorted array of backup filenames, newest first.
 */
async function getBackupFiles() {
  try {
    const files = await fs.readdir(backupDir);
    return files
      .filter(f => f.startsWith('content-') && f.endsWith('.json'))
      .sort()
      .reverse();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

/**
 * Parses a backup filename to extract a readable date string.
 * @param {string} filename - The backup filename.
 * @returns {string} - A human-readable date string.
 */
function parseBackupName(filename) {
  const rawTimestamp = filename.replace('content-', '').replace('.json', '');
  const normalized = rawTimestamp.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, '$1T$2:$3:$4.$5Z');
  return new Date(normalized).toLocaleString('en-US');
}

// --- Middleware ---
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  const userId = ctx.from.id;
  const isAuthorized = !adminUserId || String(userId) === String(adminUserId);

  if (!isAuthorized) {
    console.log(`🚫 Unauthorized access attempt by User ID: ${userId}`);
    return ctx.reply('❌ Unauthorized. This bot is private.');
  }

  const action = ctx.message?.text || ctx.callbackQuery?.data || 'unknown';
  console.log(`✅ Authorized action by @${ctx.from.username} (${userId}): ${action}`);
  return next();
});

// --- Bot Commands ---
bot.command(['start', 'help'], async (ctx) => {
  const welcomeMessage = `
🤖 *Portfolio Content Manager*

Available commands:
\\- /status — Check system status
\\- /get — Download current content\\.json
\\- /history — View change history \\(last 10 versions\\)
\\- /rollback N — Restore version N from history
\\- /diff N \\[M\\] — Compare versions
\\- /list\\_cases — List available case studies
\\- /preview \\[case\\_id\\] — View case study details
\\- /edit\\_case \\[case\\_id\\] — Edit case study \\(coming soon\\)
\\- /delete\\_case \\[case\\_id\\] — Delete case study \\(coming soon\\)

_This bot is private and only accessible to authorized users\\._

_Version: 1\\.4\\.0 \\(Stable\\)_
`;
  await ctx.reply(welcomeMessage, { parse_mode: 'MarkdownV2' });
});

bot.command('status', async (ctx) => {
  try {
    await ctx.reply('⏳ Checking status...');
    const result = await callAPI('GET');
    const statusMessage = `
✅ *System Status*

📊 *Stats:*
\\- Profiles: ${escapeMarkdownV2(result.stats.profilesCount)}
\\- File size: ${escapeMarkdownV2((result.stats.fileSize / 1024).toFixed(1))} KB
\\- Last modified: ${escapeMarkdownV2(new Date(result.stats.lastModified).toLocaleString('ru-RU'))}

🔗 API URL: \`${escapeMarkdownV2(apiUrl)}\`
⏰ Server time: ${escapeMarkdownV2(new Date(result.timestamp).toLocaleString('ru-RU'))}
`;
    await ctx.reply(statusMessage, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.command('get', async (ctx) => {
  try {
    await ctx.reply('⏳ Fetching content.json...');
    const result = await callAPI('GET');
    const contentStr = JSON.stringify(result.content, null, 2);
    const file = new InputFile(Buffer.from(contentStr, 'utf-8'), 'content.json');
    await ctx.replyWithDocument(file, { caption: '📄 Current content.json' });
  } catch (error) {
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.command('history', async (ctx) => {
  try {
    await ctx.reply('⏳ Loading change history...');
    const backupFiles = await getBackupFiles();
    if (backupFiles.length === 0) {
      return await ctx.reply('📭 No history found. Backups are created when content changes.');
    }
    let historyMessage = '📜 *Change History \\(last 10\\):*\n\n';
    const recentFiles = backupFiles.slice(0, 10);
    recentFiles.forEach((filename, i) => {
      historyMessage += `${i + 1}\\. ${escapeMarkdownV2(parseBackupName(filename))}\n`;
      historyMessage += `   └ File: \`${escapeMarkdownV2(filename)}\`\n\n`;
    });
    await ctx.reply(historyMessage, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('History Error:', error);
    await ctx.reply(`❌ Error loading history: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.command('rollback', async (ctx) => {
  try {
    const versionNumber = parseInt(ctx.message.text.split(' ')[1]);
    if (!versionNumber || versionNumber < 1) {
      return await ctx.reply('❌ Usage: /rollback N\n\nWhere N is the version number from /history \\(1 = most recent\\)');
    }
    await ctx.reply(`⏳ Loading backup #${versionNumber}...`);
    const backupFiles = await getBackupFiles();
    if (versionNumber > backupFiles.length) {
      return await ctx.reply(`❌ Version \\#${versionNumber} not found\\. Available: 1\\-${backupFiles.length}`);
    }
    const selectedBackup = backupFiles[versionNumber - 1];
    const keyboard = new InlineKeyboard()
      .text('✅ Confirm Rollback', `rollback_confirm_${versionNumber}`)
      .text('❌ Cancel', 'rollback_cancel');
    await ctx.reply(
      `⚠️ *Rollback Confirmation*\n\nYou are about to restore version \\#${versionNumber}:\n📅 Date: ${escapeMarkdownV2(parseBackupName(selectedBackup))}\n📄 File: \`${escapeMarkdownV2(selectedBackup)}\`\n\nThis will replace the current content\\.json\\. Are you sure?`,
      { parse_mode: 'MarkdownV2', reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Rollback Error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.callbackQuery(/^rollback_confirm_(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const versionNumber = parseInt(ctx.match[1]);
  try {
    await ctx.editMessageText('⏳ Performing rollback...');
    const backupFiles = await getBackupFiles();
    const selectedBackup = backupFiles[versionNumber - 1];
    const backupPath = path.join(backupDir, selectedBackup);
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const backupData = JSON.parse(backupContent);
    const result = await callAPI('PUT', backupData);
    await ctx.editMessageText(
      `✅ *Rollback Successful\\!*\n\nRestored version \\#${versionNumber}\nNew backup created: \`${escapeMarkdownV2(result.backup)}\`\n\nUse /status to verify\\.`,
      { parse_mode: 'MarkdownV2' }
    );
  } catch (error) {
    console.error('Rollback Confirm Error:', error);
    await ctx.editMessageText(`❌ Rollback failed: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.callbackQuery('rollback_cancel', async (ctx) => {
  await ctx.answerCallbackQuery('Rollback cancelled');
  await ctx.editMessageText('❌ Rollback cancelled. No changes were made.');
});

bot.command('diff', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ');
    const version1 = parseInt(args[1]);
    const version2 = parseInt(args[2]);
    if (!version1) {
      return await ctx.reply('❌ Usage: /diff N \\[M\\]\n\n• /diff 1 — compare current with backup \\#1\n• /diff 1 2 — compare backup \\#1 with \\#2');
    }
    await ctx.reply('⏳ Analyzing differences...');
    const backupFiles = await getBackupFiles();
    function findDifferences(obj1, obj2, path = '') {
      const diffs = [];
      const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];
        if (val1 === undefined) diffs.push(`➕ Added: \`${escapeMarkdownV2(currentPath)}\``);
        else if (val2 === undefined) diffs.push(`➖ Removed: \`${escapeMarkdownV2(currentPath)}\``);
        else if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null && !Array.isArray(val1)) {
          diffs.push(...findDifferences(val1, val2, currentPath));
        } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          diffs.push(`✏️ Changed: \`${escapeMarkdownV2(currentPath)}\``);
        }
      }
      return diffs;
    }
    let content1, label1;
    if (version2) {
      if (version1 > backupFiles.length || version1 < 1) return await ctx.reply(`❌ Version \\#${version1} not found`);
      content1 = JSON.parse(await fs.readFile(path.join(backupDir, backupFiles[version1 - 1]), 'utf-8'));
      label1 = `Backup \\#${version1}`;
    } else {
      content1 = (await callAPI('GET')).content;
      label1 = 'Current';
    }
    const compareVersion = version2 || version1;
    if (compareVersion > backupFiles.length || compareVersion < 1) return await ctx.reply(`❌ Version \\#${compareVersion} not found`);
    const content2 = JSON.parse(await fs.readFile(path.join(backupDir, backupFiles[compareVersion - 1]), 'utf-8'));
    const label2 = `Backup \\#${compareVersion}`;
    const differences = findDifferences(content1, content2);
    if (differences.length === 0) {
      return await ctx.reply(`✅ No differences found between ${label1} and ${label2}`);
    }
    let message = `📊 *Differences: ${label1} → ${label2}*\n\nFound ${differences.length} change\\(s\\):\n\n`;
    message += differences.slice(0, 20).join('\n');
    if (differences.length > 20) {
      message += `\n\n\\.\\.\\. and ${differences.length - 20} more change\\(s\\)`;
    }
    await ctx.reply(message, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('Diff Error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.command('list_cases', async (ctx) => {
  try {
    await ctx.reply('⏳ Loading case studies...');
    const { content } = await callAPI('GET');
    const cases = content.GLOBAL_DATA?.case_studies;
    if (!cases) return await ctx.reply('❌ No case studies found in GLOBAL\\_DATA');
    const caseIds = Object.keys(cases);
    let message = `📋 *Available Case Studies \\(${caseIds.length}\\):*\n\n`;
    caseIds.forEach((id, index) => {
      const d = cases[id];
      message += `${index + 1}\\. *${escapeMarkdownV2(id)}*\n   📌 ${escapeMarkdownV2(d.title)}\n   📝 ${escapeMarkdownV2(d.desc)}\n   📊 ${escapeMarkdownV2(d.metrics)}\n   🏷️ ${escapeMarkdownV2(d.tags.join(', '))}\n\n`;
    });
    message += `💡 Usage:\n• /preview \\[case\\_id\\]\n• /edit\\_case \\[case\\_id\\]`;
    await ctx.reply(message, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('List Cases Error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.command('preview', async (ctx) => {
  try {
    const caseId = ctx.message.text.split(' ')[1];
    if (!caseId) return await ctx.reply('❌ Usage: /preview \\[case\\_id\\]');
    await ctx.reply(`⏳ Loading case: ${escapeMarkdownV2(caseId)}...`);
    const { content } = await callAPI('GET');
    const caseStudy = content.GLOBAL_DATA?.case_studies?.[caseId];
    if (!caseStudy) return await ctx.reply(`❌ Case "${escapeMarkdownV2(caseId)}" not found.`);
    const caseDetails = content.GLOBAL_DATA?.case_details?.[caseId];
    let message = `🔍 *Preview: ${escapeMarkdownV2(caseStudy.title)}*\n\n*📋 Basic Info:*\n• ID: \`${escapeMarkdownV2(caseId)}\`\n• Description: ${escapeMarkdownV2(caseStudy.desc)}\n• Metrics: ${escapeMarkdownV2(caseStudy.metrics)}\n• Tags: ${escapeMarkdownV2(caseStudy.tags.join(', '))}\n\n`;
    if (caseDetails) {
      message += `*📖 Detailed Content:*\n\n`;
      if (caseDetails.challenge) message += `*Challenge:*\n${escapeMarkdownV2(caseDetails.challenge.substring(0, 200))}\\.\\.\\.\n\n`;
      if (Array.isArray(caseDetails.approach) && caseDetails.approach.length > 0) message += `*Approach \\(${caseDetails.approach.length} steps\\):*\n${caseDetails.approach.slice(0, 3).map((s, i) => `${i + 1}\\. ${escapeMarkdownV2(s.substring(0, 100))}\\.\\.\\.`).join('\n')}${caseDetails.approach.length > 3 ? `\n\\.\\.\\.and ${caseDetails.approach.length - 3} more` : ''}\n\n`;
      if (Array.isArray(caseDetails.results) && caseDetails.results.length > 0) message += `*Results \\(${caseDetails.results.length} items\\):*\n${caseDetails.results.slice(0, 2).map(r => `• ${escapeMarkdownV2(r)}`).join('\n')}${caseDetails.results.length > 2 ? `\n\\.\\.\\.and ${caseDetails.results.length - 2} more` : ''}`;
    } else {
      message += `*ℹ️ No detailed content available for this case*`;
    }
    await ctx.reply(message, { parse_mode: 'MarkdownV2' });
  } catch (error) {
    console.error('Preview Error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.command(['edit_case', 'delete_case'], (ctx) => ctx.reply('🚧 This feature is coming soon\\!'));

bot.command('test', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('📊 Status', 'action_status')
      .text('📄 Get JSON', 'action_get')
      .row()
      .text('📜 History', 'action_history')
      .text('❓ Help', 'action_help');
    await ctx.reply('Choose an action:', { reply_markup: keyboard });
});

bot.callbackQuery('action_status', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
    await bot.commandCallbacks.status(ctx);
});

bot.callbackQuery('action_get', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
    await bot.commandCallbacks.get(ctx);
});

bot.callbackQuery('action_history', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
    await bot.commandCallbacks.history(ctx);
});

bot.callbackQuery('action_help', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
    await bot.commandCallbacks.help(ctx);
});

// --- Fallbacks & Error Handling ---
bot.on('message:text', (ctx) => {
  if (ctx.message.text.startsWith('/')) {
    ctx.reply('❓ Unknown command. Use /help to see the list of commands.');
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err.error);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// --- Startup ---
bot.start({
  onStart: () => console.log('Bot started successfully! Waiting for messages...'),
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));