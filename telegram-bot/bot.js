// bot.js

// 1. Import required modules
const fs = require('fs');
const path = require('path');

// 2. Load environment variables
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
} else {
  require('dotenv').config();
}

// 3. Import necessary modules
const fsp = require('fs').promises;

// 4. Import Grammy and other necessary modules
const { Bot, InlineKeyboard, GrammyError, HttpError, InputFile } = require('grammy');

// 5. Import custom state manager
const stateManager = require('./stateManager');

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

// --- Command Handlers ---
async function handleAddCaseInput(ctx) {
  const userId = ctx.from.id;
  const state = stateManager.getUserState(userId);

  if (!state || state.command !== 'add_case') return false;

  const userInput = ctx.message.text;
  const isSkip = userInput === '/skip';

  try {
    switch (state.currentStep) {
      case stateManager.ADD_CASE_STATES.WAITING_ID:
        if (isSkip) {
          return await ctx.reply(
            escapeMarkdownV2('❌ Case ID is required and cannot be skipped.'),
            { parse_mode: 'MarkdownV2' }
          );
        }

        // Validate ID format
        if (!/^[a-z0-9_]+$/.test(userInput)) {
          return await ctx.reply(
            escapeMarkdownV2('❌ Invalid ID format. Use only lowercase Latin letters, numbers, and underscores.'),
            { parse_mode: 'MarkdownV2' }
          );
        }

        // Check if ID already exists
        const { content } = await callAPI('GET');
        if (content.GLOBAL_DATA?.case_studies?.[userInput]) {
          return await ctx.reply(
            `${escapeMarkdownV2('❌ A case with ID "')}\
${escapeMarkdownV2(userInput)}${escapeMarkdownV2('" already exists.')}`,
            { parse_mode: 'MarkdownV2' }
          );
        }

        // Save ID and move to next step
        state.data.id = userInput;
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_TITLE;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ID saved: ')}\`${escapeMarkdownV2(userInput)}\`

${escapeMarkdownV2('📝 Step 2/10: *Enter the project title*')}

${escapeMarkdownV2('Example: GMX V2 Trading Interface')}
${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_TITLE:
        state.data.title = isSkip ? null : userInput;
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_DESC;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : 'Title saved')}

${escapeMarkdownV2('📝 Step 3/10: *Enter a short description*')}

${escapeMarkdownV2('Example: Redesigned derivatives trading interface for better UX')}
${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_DESC:
        state.data.desc = isSkip ? null : userInput;
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_METRICS;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : 'Description saved')}

${escapeMarkdownV2('📝 Step 4/10: *Enter a key metric*')}

${escapeMarkdownV2('Example: +300% daily volume, 2x conversion rate')}
${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_METRICS:
        state.data.metrics = isSkip ? null : userInput;
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_TAGS;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : 'Metric saved')}

${escapeMarkdownV2('📝 Step 5/10: *Enter tags (comma-separated)*')}

${escapeMarkdownV2('Example: DeFi, Web3, Trading, UX Design')}
${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_TAGS:
        if (!isSkip) {
          state.data.tags = userInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        } else {
          state.data.tags = [];
        }
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_CHALLENGE;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : `Saved ${state.data.tags.length} tag(s)`)}

${escapeMarkdownV2('📝 Step 6/10: *Describe the challenge*')}

${escapeMarkdownV2('What problem did this project address? What made it tricky?')}
${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_CHALLENGE:
        state.data.challenge = isSkip ? null : userInput;
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_APPROACH;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : 'Challenge saved')}

${escapeMarkdownV2('📝 Step 7/10: *Describe the approach*')}

${escapeMarkdownV2('Enter each step on a new line:')}

${escapeMarkdownV2('Example:')}
${escapeMarkdownV2('User research')}
${escapeMarkdownV2('Competitor analysis')}
${escapeMarkdownV2('Prototyping')}
${escapeMarkdownV2('A/B testing')}

${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_APPROACH:
        if (!isSkip) {
          state.data.approach = userInput
            .split('\n')
            .map(step => step.trim())
            .filter(step => step);
        } else {
          state.data.approach = [];
        }
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_SOLUTION;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : `Saved ${state.data.approach.length} step(s)`)}

${escapeMarkdownV2('📝 Step 8/10: *Describe the solution*')}

${escapeMarkdownV2('What exactly was implemented?')}
${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_SOLUTION:
        state.data.solution = isSkip ? null : userInput;
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_RESULTS;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : 'Solution saved')}

${escapeMarkdownV2('📝 Step 9/10: *Enter results*')}

${escapeMarkdownV2('Each result on a new line:')}

${escapeMarkdownV2('Example:')}
${escapeMarkdownV2('Conversion rate increased by 45%')}
${escapeMarkdownV2('Task time reduced from 10 to 3 minutes')}
${escapeMarkdownV2('DAU grew by 200%')}

${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_RESULTS:
        if (!isSkip) {
          state.data.results = userInput
            .split('\n')
            .map(result => result.trim())
            .filter(result => result);
        } else {
          state.data.results = [];
        }
        state.currentStep = stateManager.ADD_CASE_STATES.WAITING_LEARNINGS;
        stateManager.updateUserState(userId, state);

        await ctx.reply(
          `${escapeMarkdownV2('✅ ')}${escapeMarkdownV2(isSkip ? 'Skipped' : `Saved ${state.data.results.length} result(s)`)}

${escapeMarkdownV2('📝 Step 10/10: *Key takeaways*')}

${escapeMarkdownV2('What did you learn from this project?')}
${escapeMarkdownV2('(Send /skip to skip this step)')}`,
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case stateManager.ADD_CASE_STATES.WAITING_LEARNINGS:
        state.data.learnings = isSkip ? null : userInput;

        // All data collected, now save it
        await saveNewCase(ctx, state.data);

        // Clear user state
        stateManager.clearUserState(userId);
        break;
    }

    return true;
  } catch (error) {
    console.error('Input handling error:', error);
    await ctx.reply(
      `${escapeMarkdownV2('❌ Error: ')}${escapeMarkdownV2(error.message)}`,
      { parse_mode: 'MarkdownV2' }
    );
    return true;
  }
}

async function saveNewCase(ctx, caseData) {
  try {
    // Get current content from the API
    const { content } = await callAPI('GET');
    
    // Prepare the basic case info for case_studies
    const basicCaseInfo = {
      title: caseData.title || 'Untitled Case',
      desc: caseData.desc || '',
      metrics: caseData.metrics || '',
      tags: caseData.tags.length > 0 ? caseData.tags : []
    };
    
    // Prepare the detailed case info for case_details
    const detailedCaseInfo = {
      challenge: caseData.challenge || '',
      approach: caseData.approach.length > 0 ? caseData.approach : [],
      solution: caseData.solution || '',
      results: caseData.results.length > 0 ? caseData.results : [],
      learnings: caseData.learnings || ''
    };
    
    // Initialize case_studies and case_details if not present
    if (!content.GLOBAL_DATA.case_studies) {
      content.GLOBAL_DATA.case_studies = {};
    }
    if (!content.GLOBAL_DATA.case_details) {
      content.GLOBAL_DATA.case_details = {};
    }
    
    // Save the new case data
    content.GLOBAL_DATA.case_studies[caseData.id] = basicCaseInfo;
    content.GLOBAL_DATA.case_details[caseData.id] = detailedCaseInfo;
    
    // Save updated content to the API
    const result = await callAPI('PUT', content);
    
    // Create a summary message
    let summaryMessage = `✅ *Case successfully created\\!*\n\n`;
    summaryMessage += `📋 *Summary:*\n`;
    summaryMessage += `• ID: \`${escapeMarkdownV2(caseData.id)}\`\n`;
    summaryMessage += `• Title: ${escapeMarkdownV2(caseData.title || 'Not specified')}\n`;
    summaryMessage += `• Tags: ${caseData.tags.length > 0 ? escapeMarkdownV2(caseData.tags.join(', ')) : 'Not specified'}\n`;
    summaryMessage += `• Approach steps: ${caseData.approach.length}\n`;
    summaryMessage += `• Results: ${caseData.results.length}\n\n`;
    summaryMessage += `📁 Backup created: \`${escapeMarkdownV2(path.basename(result.backup || 'no-backup'))}\`\n\n`;
    summaryMessage += `💡 Use /preview ${escapeMarkdownV2(caseData.id)} to view the case`;

    await ctx.reply(summaryMessage, { parse_mode: 'MarkdownV2' });
    
  } catch (error) {
    console.error('Save case error:', error);
    await ctx.reply(
      `❌ Error while saving: ${escapeMarkdownV2(error.message)}\n\n` +
      `Your data is safe\\! Please try again or contact the administrator\\.`,
      { parse_mode: 'MarkdownV2' }
    );
  }
}

async function handleEditCaseInput(ctx) {
  const userId = ctx.from.id;
  const state = stateManager.getUserState(userId);
  
  if (!state || state.command !== 'edit_case') return false;
  
  const userInput = ctx.message.text;
  const isKeep = userInput === '/keep';
  
  try {
    switch (state.currentStep) {
      case stateManager.EDIT_CASE_STATES.WAITING_CASE_ID:
        // Check if case exists
        const { content } = await callAPI('GET');
        const caseBasic = content.GLOBAL_DATA?.case_studies?.[userInput];
        const caseDetails = content.GLOBAL_DATA?.case_details?.[userInput];
        
        if (!caseBasic) {
          return await ctx.reply(`❌ Case with ID "${escapeMarkdownV2(userInput)}" not found`);
        }
        
        // Start editing flow
        await startEditingCase(ctx, userId, userInput, caseBasic, caseDetails);
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_TITLE:
        if (!isKeep) {
          state.data.title = userInput;
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_DESC;
        stateManager.updateUserState(userId, state);
        
        const currentDesc = state.data.desc || 'Not set';
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 2/9: *Description*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(currentDesc)}\n\`\`\`\n\n` +
          `Enter new description or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_DESC:
        if (!isKeep) {
          state.data.desc = userInput;
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_METRICS;
        stateManager.updateUserState(userId, state);
        
        const currentMetrics = state.data.metrics || 'Not set';
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 3/9: *Metrics*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(currentMetrics)}\n\`\`\`\n\n` +
          `Enter new metrics or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_METRICS:
        if (!isKeep) {
          state.data.metrics = userInput;
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_TAGS;
        stateManager.updateUserState(userId, state);
        
        const currentTags = state.data.tags.length > 0 ? state.data.tags.join(', ') : 'Not set';
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 4/9: *Tags \\(comma separated\\)*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(currentTags)}\n\`\`\`\n\n` +
          `Enter new tags or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_TAGS:
        if (!isKeep) {
          state.data.tags = userInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_CHALLENGE;
        stateManager.updateUserState(userId, state);
        
        const currentChallenge = state.data.challenge || 'Not set';
        const challengePreview = currentChallenge.length > 200 
          ? currentChallenge.substring(0, 200) + '...' 
          : currentChallenge;
        
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 5/9: *Challenge*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(challengePreview)}\n\`\`\`\n\n` +
          `Enter new challenge description or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_CHALLENGE:
        if (!isKeep) {
          state.data.challenge = userInput;
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_APPROACH;
        stateManager.updateUserState(userId, state);
        
        const currentApproach = state.data.approach.length > 0 
          ? state.data.approach.map((step, i) => `${i + 1}. ${step}`).join('\n') 
          : 'Not set';
        const approachPreview = currentApproach.length > 300 
          ? currentApproach.substring(0, 300) + '...' 
          : currentApproach;
          
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 6/9: *Approach \\(each step on new line\\)*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(approachPreview)}\n\`\`\`\n\n` +
          `Enter new approach steps or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_APPROACH:
        if (!isKeep) {
          state.data.approach = userInput.split('\n').map(step => step.trim()).filter(step => step);
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_SOLUTION;
        stateManager.updateUserState(userId, state);
        
        const currentSolution = state.data.solution || 'Not set';
        const solutionPreview = currentSolution.length > 200 
          ? currentSolution.substring(0, 200) + '...' 
          : currentSolution;
          
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 7/9: *Solution*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(solutionPreview)}\n\`\`\`\n\n` +
          `Enter new solution description or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_SOLUTION:
        if (!isKeep) {
          state.data.solution = userInput;
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_RESULTS;
        stateManager.updateUserState(userId, state);
        
        const currentResults = state.data.results.length > 0 
          ? state.data.results.map((result, i) => `${i + 1}. ${result}`).join('\n') 
          : 'Not set';
        const resultsPreview = currentResults.length > 300 
          ? currentResults.substring(0, 300) + '...' 
          : currentResults;
          
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 8/9: *Results \\(each result on new line\\)*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(resultsPreview)}\n\`\`\`\n\n` +
          `Enter new results or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_RESULTS:
        if (!isKeep) {
          state.data.results = userInput.split('\n').map(result => result.trim()).filter(result => result);
        }
        state.currentStep = stateManager.EDIT_CASE_STATES.WAITING_LEARNINGS;
        stateManager.updateUserState(userId, state);
        
        const currentLearnings = state.data.learnings || 'Not set';
        const learningsPreview = currentLearnings.length > 200 
          ? currentLearnings.substring(0, 200) + '...' 
          : currentLearnings;
          
        await ctx.reply(
          `✅ ${isKeep ? 'Kept current value' : 'Updated'}\n\n` +
          `Step 9/9: *Key Learnings*\n\n` +
          `Current value:\n\`\`\`\n${escapeMarkdownV2(learningsPreview)}\n\`\`\`\n\n` +
          `Enter new learnings or send /keep to keep current value:`,
          { parse_mode: 'MarkdownV2' }
        );
        break;
        
      case stateManager.EDIT_CASE_STATES.WAITING_LEARNINGS:
        if (!isKeep) {
          state.data.learnings = userInput;
        }
        
        // All data collected, now save it
        await saveEditedCase(ctx, state.data, state.originalData);
        
        // Clear user state
        stateManager.clearUserState(userId);
        break;
    }
    
    return true;
  } catch (error) {
    console.error('Edit input handling error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
    return true;
  }
}

async function saveEditedCase(ctx, newData, originalData) {
  try {
    // Get current content
    const { content } = await callAPI('GET');
    
    // Validation: at least title should be present
    if (!newData.title && !originalData.basic.title) {
      throw new Error('Case must have at least a title');
    }

    // Update the basic case info
    content.GLOBAL_DATA.case_studies[newData.id] = {
      title: newData.title || originalData.basic.title || 'Untitled Case',
      desc: newData.desc || originalData.basic.desc || '',
      metrics: newData.metrics || originalData.basic.metrics || '',
      tags: newData.tags.length > 0 ? newData.tags : (originalData.basic.tags || [])
    };
    
    // Update the detailed case info
    content.GLOBAL_DATA.case_details[newData.id] = {
      challenge: newData.challenge || originalData.details.challenge || '',
      approach: newData.approach.length > 0 ? newData.approach : (originalData.details.approach || []),
      solution: newData.solution || originalData.details.solution || '',
      results: newData.results.length > 0 ? newData.results : (originalData.details.results || []),
      learnings: newData.learnings || originalData.details.learnings || ''
    };
    
    // Save updated content
    const result = await callAPI('PUT', content);
    
    // Compare what changed
    const changes = [];
    
    // Check basic fields
    if (newData.title !== originalData.basic.title) changes.push('Title');
    if (newData.desc !== originalData.basic.desc) changes.push('Description');
    if (newData.metrics !== originalData.basic.metrics) changes.push('Metrics');
    if (JSON.stringify(newData.tags) !== JSON.stringify(originalData.basic.tags || [])) changes.push('Tags');
    
    // Check detail fields
    if (newData.challenge !== (originalData.details.challenge || '')) changes.push('Challenge');
    if (JSON.stringify(newData.approach) !== JSON.stringify(originalData.details.approach || [])) changes.push('Approach');
    if (newData.solution !== (originalData.details.solution || '')) changes.push('Solution');
    if (JSON.stringify(newData.results) !== JSON.stringify(originalData.details.results || [])) changes.push('Results');
    if (newData.learnings !== (originalData.details.learnings || '')) changes.push('Learnings');
    
    // Create summary message
    let summaryMessage = `✅ *Case successfully updated\\!*\n\n`;
    summaryMessage += `📋 *Summary:*\n`;
    summaryMessage += `• Case ID: \`${escapeMarkdownV2(newData.id)}\`\n`;
    summaryMessage += `• Fields changed: ${changes.length > 0 ? escapeMarkdownV2(changes.join(', ')) : 'None'}\n\n`;
    
    if (changes.length === 0) {
      summaryMessage += `ℹ️ No changes were made to the case\\.\n\n`;
    }
    
    summaryMessage += `📁 Backup created: \`${escapeMarkdownV2(path.basename(result.backup || 'no-backup'))}\`\n\n`;
    summaryMessage += `💡 Use /preview ${escapeMarkdownV2(newData.id)} to view the updated case`;
    
    await ctx.reply(summaryMessage, { parse_mode: 'MarkdownV2' });
    
  } catch (error) {
    console.error('Save edited case error:', error);
    await ctx.reply(
      `❌ Error saving changes: ${escapeMarkdownV2(error.message)}\n\n` +
      `Your edits were not lost\\! Try again or contact administrator\\.`,
      { parse_mode: 'MarkdownV2' }
    );
  }
}

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
\\- /add\\_case — Create new case study \\(interactive\\)
\\- /edit\\_case \\[id\\] — Edit existing case study \\(interactive\\)
\\- /delete\\_case \\[id\\] — Delete case study with preview
\\- /cancel — Cancel active dialog
\\- /skip — Skip optional field during input

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

bot.command('add_case', async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if the user already has an active conversation
    if (stateManager.hasActiveState(userId)) {
      return await ctx.reply(
        '⚠️ You already have an active session. Please finish it or type /cancel to discard it.',
        { parse_mode: 'MarkdownV2' }
      );
    }
    
    // Initialize state for new case creation
    stateManager.initUserState(userId);
    stateManager.updateUserState(userId, {
      command: 'add_case',
      currentStep: stateManager.ADD_CASE_STATES.WAITING_ID,
      data: {
        // Basic case info
        id: null,
        title: null,
        desc: null,
        metrics: null,
        tags: [],
        // Detailed case info
        challenge: null,
        approach: [],
        solution: null,
        results: [],
        learnings: null
      }
    });
    
    // Send first step instructions
    const message = `🆕 *New Case Creation*

📝 Step 1/10: *Enter a unique case ID*

ID requirements:
• Use only Latin letters, numbers, and underscores
• Examples: \`gmx_v2\`, \`defi_protocol_2024\`
• The ID must be unique

💡 Tip: Use a short project name with a version or year`;

    await ctx.reply(message, { parse_mode: 'MarkdownV2' });
    
  } catch (error) {
    console.error('Add Case Error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.command('cancel', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!stateManager.hasActiveState(userId)) {
    return await ctx.reply('❌ You don’t have any active sessions.');
  }
  
  stateManager.clearUserState(userId);
  await ctx.reply('✅ Session cancelled. All entered data has been deleted.', { parse_mode: 'MarkdownV2' });
});

bot.command('edit_case', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ').slice(1);
    const caseId = args[0];
    
    // Check if user already has an active conversation
    if (stateManager.hasActiveState(userId)) {
      return await ctx.reply(
        '⚠️ You already have an active dialog\\. Complete it or send /cancel to abort\\.',
        { parse_mode: 'MarkdownV2' }
      );
    }
    
    if (caseId) {
      // Case ID provided directly - load it
      const { content } = await callAPI('GET');
      const caseBasic = content.GLOBAL_DATA?.case_studies?.[caseId];
      const caseDetails = content.GLOBAL_DATA?.case_details?.[caseId];
      
      if (!caseBasic) {
        return await ctx.reply(`❌ Case with ID "${escapeMarkdownV2(caseId)}" not found`);
      }
      
      // Start editing flow
      await startEditingCase(ctx, userId, caseId, caseBasic, caseDetails);
    } else {
      // No ID provided - ask for it
      stateManager.initUserState(userId);
      stateManager.updateUserState(userId, {
        command: 'edit_case',
        currentStep: stateManager.EDIT_CASE_STATES.WAITING_CASE_ID,
        data: {}
      });
      
      await ctx.reply(
        '✏️ *Edit Case Study*\n\n' +
        'Enter the case ID you want to edit\\.\n' +
        'Use /list\\_cases to see available cases\\.',
        { parse_mode: 'MarkdownV2' }
      );
    }
  } catch (error) {
    console.error('Edit Case Error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

async function startEditingCase(ctx, userId, caseId, caseBasic, caseDetails) {
  // Initialize state with existing data
  stateManager.initUserState(userId);
  stateManager.updateUserState(userId, {
    command: 'edit_case',
    currentStep: stateManager.EDIT_CASE_STATES.WAITING_TITLE,
    data: {
      id: caseId,
      title: caseBasic.title || null,
      desc: caseBasic.desc || null,
      metrics: caseBasic.metrics || null,
      tags: caseBasic.tags || [],
      challenge: caseDetails?.challenge || null,
      approach: caseDetails?.approach || [],
      solution: caseDetails?.solution || null,
      results: caseDetails?.results || [],
      learnings: caseDetails?.learnings || null
    },
    originalData: {
      basic: { ...caseBasic },
      details: caseDetails ? { ...caseDetails } : {}
    }
  });
  
  // Start with first field
  const currentValue = caseBasic.title || 'Not set';
  await ctx.reply(
    `📝 *Editing case: ${escapeMarkdownV2(caseId)}*\n\n` +
    `Step 1/9: *Title*\n\n` +
    `Current value:\n\`\`\`\n${escapeMarkdownV2(currentValue)}\n\`\`\`\n\n` +
    `Enter new title or send /keep to keep current value:`,
    { parse_mode: 'MarkdownV2' }
  );
}

bot.command('delete_case', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ').slice(1);
    const caseId = args[0];
    
    if (!caseId) {
      return await ctx.reply(
        '❌ Please provide a case ID to delete\n\n' +
        'Usage: `/delete_case case_id`\n' +
        'Example: `/delete_case gmx_v2`\n\n' +
        'Use /list_cases to see available cases'
      );
    }
    
    // Load the case to show preview
    const { content } = await callAPI('GET');
    const caseBasic = content.GLOBAL_DATA?.case_studies?.[caseId];
    const caseDetails = content.GLOBAL_DATA?.case_details?.[caseId];
    
    if (!caseBasic) {
      return await ctx.reply(`❌ Case with ID "${escapeMarkdownV2(caseId)}" not found`);
    }
    
    // Check if this case is used in any profiles
    const usedInProfiles = [];
    for (const [profileId, profile] of Object.entries(content)) {
      if (profileId !== 'GLOBAL_DATA' && profile.meta?.cases?.includes(caseId)) {
        usedInProfiles.push(profileId);
      }
    }
    
    // Create detailed preview message
    let previewMessage = `🗑️ *Delete Case Preview*\n\n`;
    previewMessage += `⚠️ *You are about to delete:*\n\n`;
    
    // Basic info
    previewMessage += `📋 *Basic Information:*\n`;
    previewMessage += `• ID: \`${escapeMarkdownV2(caseId)}\`\n`;
    previewMessage += `• Title: ${escapeMarkdownV2(caseBasic.title || 'Not set')}\n`;
    previewMessage += `• Description: ${escapeMarkdownV2(caseBasic.desc || 'Not set')}\n`;
    previewMessage += `• Metrics: ${escapeMarkdownV2(caseBasic.metrics || 'Not set')}\n`;
    previewMessage += `• Tags: ${caseBasic.tags?.length > 0 ? escapeMarkdownV2(caseBasic.tags.join(', ')) : 'None'}\n\n`;
    
    // Detailed info summary
    if (caseDetails) {
      previewMessage += `📖 *Detailed Content:*\n`;
      previewMessage += `• Challenge: ${caseDetails.challenge ? 'Set' : 'Not set'}\n`;
      previewMessage += `• Approach steps: ${caseDetails.approach?.length || 0}\n`;
      previewMessage += `• Solution: ${caseDetails.solution ? 'Set' : 'Not set'}\n`;
      previewMessage += `• Results: ${caseDetails.results?.length || 0}\n`;
      previewMessage += `• Learnings: ${caseDetails.learnings ? 'Set' : 'Not set'}\n\n`;
    }
    
    // Warning if used in profiles
    if (usedInProfiles.length > 0) {
      previewMessage += `⚠️ *WARNING: This case is currently used in ${usedInProfiles.length} profile\\(s\\):*\n`;
      previewMessage += escapeMarkdownV2(usedInProfiles.join(', ')) + '\n\n';
      previewMessage += `*Deleting this case will remove it from these profiles\\!*\n\n`;
    }
    
    previewMessage += `❗ *This action cannot be undone\\!*\n\n`;
    previewMessage += `Are you sure you want to delete this case?`;
    
    // Create confirmation keyboard
    const keyboard = new InlineKeyboard()
      .text('❌ Yes, DELETE', `delete_confirm_${caseId}`)
      .text('✅ Cancel', 'delete_cancel');
    
    await ctx.reply(previewMessage, { 
      parse_mode: 'MarkdownV2',
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Delete Case Error:', error);
    await ctx.reply(`❌ Error: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.callbackQuery(/^delete_confirm_(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const caseId = ctx.match[1];
  
  try {
    await ctx.editMessageText('⏳ Deleting case...');
    
    // Get current content
    const { content } = await callAPI('GET');
    
    // Check if case still exists
    if (!content.GLOBAL_DATA?.case_studies?.[caseId]) {
      return await ctx.editMessageText('❌ Case no longer exists');
    }
    
    // Delete from case_studies
    delete content.GLOBAL_DATA.case_studies[caseId];
    
    // Delete from case_details if exists
    if (content.GLOBAL_DATA.case_details?.[caseId]) {
      delete content.GLOBAL_DATA.case_details[caseId];
    }
    
    // Remove from all profiles that use this case
    let profilesUpdated = 0;
    for (const [profileId, profile] of Object.entries(content)) {
      if (profileId !== 'GLOBAL_DATA' && profile.meta?.cases?.includes(caseId)) {
        profile.meta.cases = profile.meta.cases.filter(id => id !== caseId);
        profilesUpdated++;
      }
    }
    
    // Save updated content
    const result = await callAPI('PUT', content);
    
    // Success message
    let successMessage = `✅ *Case successfully deleted\\!*\n\n`;
    successMessage += `• Case ID: \`${escapeMarkdownV2(caseId)}\`\n`;
    successMessage += `• Backup created: \`${escapeMarkdownV2(path.basename(result.backup || 'no-backup'))}\`\n`;
    
    if (profilesUpdated > 0) {
      successMessage += `• Removed from ${profilesUpdated} profile\\(s\\)\n`;
    }
    
    successMessage += `\n💡 The case has been permanently deleted\\. Use /rollback if you need to restore it\\.`;
    
    await ctx.editMessageText(successMessage, { parse_mode: 'MarkdownV2' });
    
  } catch (error) {
    console.error('Delete Confirm Error:', error);
    await ctx.editMessageText(`❌ Failed to delete: ${escapeMarkdownV2(error.message)}`);
  }
});

bot.callbackQuery('delete_cancel', async (ctx) => {
  await ctx.answerCallbackQuery('Deletion cancelled');
  await ctx.editMessageText('✅ Deletion cancelled\\. The case was not deleted\\.', { parse_mode: 'MarkdownV2' });
});

bot.command('skip', async (ctx) => {
  const userId = ctx.from.id;
  const state = stateManager.getUserState(userId);
  
  if (!state || !state.command) {
    return await ctx.reply('❌ The /skip command only works during content creation or editing.');
  }
  
  // This will be handled by the message handler
  // We'll process it as a special case there
  ctx.message.text = '/skip';
  await handleAddCaseInput(ctx);
});

bot.command('keep', async (ctx) => {
  const userId = ctx.from.id;
  const state = stateManager.getUserState(userId);
  
  if (!state || state.command !== 'edit_case') {
    return await ctx.reply('❌ Command /keep only works during case editing');
  }
  
  // Process as special input
  ctx.message.text = '/keep';
  await handleEditCaseInput(ctx);
});

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
bot.on('message:text', async (ctx) => {
  // First check if this is part of an active conversation
  let handled = await handleAddCaseInput(ctx);
  
  if (!handled) {
    handled = await handleEditCaseInput(ctx);
  }
  
  if (!handled && ctx.message.text.startsWith('/')) {
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