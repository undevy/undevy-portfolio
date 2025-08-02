// telegram-bot/handlers/conversations.js

const stateManager = require('../stateManager');
const { EMOJI } = require('../config/constants');
const { escapeMarkdown, truncateText } = require('../utils/format');
const { isValidCaseId, parseArrayInput, caseExists } = require('../utils/validators');
const { getContent, updateContent } = require('../services/api');
const { createBackup } = require('../services/backup');

/**
 * Main conversation handler - routes messages to appropriate handlers
 * @param {Context} ctx - Bot context
 * @returns {boolean} - True if message was handled
 */
async function handleConversation(ctx) {
  const userId = ctx.from.id;
  const state = stateManager.getUserState(userId);
  if (!state || !state.command) return false;

  switch (state.command) {
    case 'add_case':
      return handleAddCaseConversation(ctx, state);
    case 'edit_case':
      return handleEditCaseConversation(ctx, state);
    default:
      return false;
  }
}

async function handleAddCaseConversation(ctx, state) {
  const userId = ctx.from.id;
  const input = ctx.message.text;
  const isSkip = input === '/skip';

  try {
    switch (state.currentStep) {
      case stateManager.ADD_CASE_STATES.WAITING_ID:
        return await handleCaseIdInput(ctx, state, input, isSkip);
      case stateManager.ADD_CASE_STATES.WAITING_TITLE:
        return await handleGenericStep(ctx, state, 'title', stateManager.ADD_CASE_STATES.WAITING_DESC, isSkip, 'Step 3/10: *Enter a short description*');
      case stateManager.ADD_CASE_STATES.WAITING_DESC:
        return await handleGenericStep(ctx, state, 'desc', stateManager.ADD_CASE_STATES.WAITING_METRICS, isSkip, 'Step 4/10: *Enter metrics* (optional)');
      case stateManager.ADD_CASE_STATES.WAITING_METRICS:
        return await handleGenericStep(ctx, state, 'metrics', stateManager.ADD_CASE_STATES.WAITING_TAGS, isSkip, 'Step 5/10: *Enter tags (comma-separated)*');
      case stateManager.ADD_CASE_STATES.WAITING_TAGS:
        state.data.tags = isSkip ? [] : parseArrayInput(input);
        return await promptNext(ctx, state, stateManager.ADD_CASE_STATES.WAITING_CHALLENGE, 'Step 6/10: *Describe the challenge*');
      case stateManager.ADD_CASE_STATES.WAITING_CHALLENGE:
        return await handleGenericStep(ctx, state, 'challenge', stateManager.ADD_CASE_STATES.WAITING_APPROACH, isSkip, 'Step 7/10: *Describe your approach*');
      case stateManager.ADD_CASE_STATES.WAITING_APPROACH:
        state.data.approach = isSkip ? [] : parseArrayInput(input);
        return await promptNext(ctx, state, stateManager.ADD_CASE_STATES.WAITING_SOLUTION, 'Step 8/10: *Describe your solution*');
      case stateManager.ADD_CASE_STATES.WAITING_SOLUTION:
        return await handleGenericStep(ctx, state, 'solution', stateManager.ADD_CASE_STATES.WAITING_RESULTS, isSkip, 'Step 9/10: *List key results*');
      case stateManager.ADD_CASE_STATES.WAITING_RESULTS:
        state.data.results = isSkip ? [] : parseArrayInput(input);
        return await promptNext(ctx, state, stateManager.ADD_CASE_STATES.WAITING_LEARNINGS, 'Step 10/10: *Describe your learnings*');
      case stateManager.ADD_CASE_STATES.WAITING_LEARNINGS:
        state.data.learnings = isSkip ? null : input;
        await saveCaseData(ctx, state.data);
        stateManager.clearUserState(userId);
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('[CONVERSATION] Error in add_case:', error);
    await ctx.reply(`${EMOJI.ERROR} Error: ${escapeMarkdown(error.message)}`, { parse_mode: 'MarkdownV2' });
    return true;
  }
}

async function handleEditCaseConversation(ctx, state) {
  const userId = ctx.from.id;
  const input = ctx.message.text;
  const isKeep = input === '/keep';

  try {
    switch (state.currentStep) {
      case stateManager.EDIT_CASE_STATES.WAITING_TITLE:
        if (!isKeep) state.data.title = input;
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_DESC, 'Enter new *description* or /keep to leave unchanged');
      case stateManager.EDIT_CASE_STATES.WAITING_DESC:
        if (!isKeep) state.data.desc = input;
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_METRICS, 'Enter new *metrics* or /keep');
      case stateManager.EDIT_CASE_STATES.WAITING_METRICS:
        if (!isKeep) state.data.metrics = input;
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_TAGS, 'Enter new *tags* (comma-separated) or /keep');
      case stateManager.EDIT_CASE_STATES.WAITING_TAGS:
        if (!isKeep) state.data.tags = parseArrayInput(input);
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_CHALLENGE, 'Enter new *challenge* or /keep');
      case stateManager.EDIT_CASE_STATES.WAITING_CHALLENGE:
        if (!isKeep) state.data.challenge = input;
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_APPROACH, 'Enter new *approach* (comma-separated) or /keep');
      case stateManager.EDIT_CASE_STATES.WAITING_APPROACH:
        if (!isKeep) state.data.approach = parseArrayInput(input);
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_SOLUTION, 'Enter new *solution* or /keep');
      case stateManager.EDIT_CASE_STATES.WAITING_SOLUTION:
        if (!isKeep) state.data.solution = input;
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_RESULTS, 'Enter new *results* (comma-separated) or /keep');
      case stateManager.EDIT_CASE_STATES.WAITING_RESULTS:
        if (!isKeep) state.data.results = parseArrayInput(input);
        return await promptNextEdit(ctx, state, stateManager.EDIT_CASE_STATES.WAITING_LEARNINGS, 'Enter new *learnings* or /keep');
      case stateManager.EDIT_CASE_STATES.WAITING_LEARNINGS:
        if (!isKeep) state.data.learnings = input;
        await updateExistingCase(ctx, state.data);
        stateManager.clearUserState(userId);
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('[CONVERSATION] Error in edit_case:', error);
    await ctx.reply(`${EMOJI.ERROR} Error: ${escapeMarkdown(error.message)}`, { parse_mode: 'MarkdownV2' });
    return true;
  }
}

// === helpers ===

async function handleCaseIdInput(ctx, state, input, isSkip) {
  const userId = ctx.from.id;

  if (isSkip) {
    await ctx.reply(`${EMOJI.ERROR} Case ID is required and cannot be skipped`, { parse_mode: 'MarkdownV2' });
    return true;
  }

  if (!isValidCaseId(input)) {
    await ctx.reply(`${EMOJI.ERROR} Invalid ID format. Use only lowercase Latin letters, numbers, and underscores.`, { parse_mode: 'MarkdownV2' });
    return true;
  }

  const { content } = await getContent();
  if (caseExists(content, input)) {
    await ctx.reply(`${EMOJI.ERROR} Case with ID "${escapeMarkdown(input)}" already exists.`, { parse_mode: 'MarkdownV2' });
    return true;
  }

  state.data.id = input;
  state.currentStep = stateManager.ADD_CASE_STATES.WAITING_TITLE;
  stateManager.updateUserState(userId, state);

  await ctx.reply(`${EMOJI.SUCCESS} ID saved: \`${escapeMarkdown(input)}\`\n\n📝 Step 2/10: *Enter the project title*\n(Use /skip to skip)`, { parse_mode: 'MarkdownV2' });
  return true;
}

async function handleGenericStep(ctx, state, key, nextStep, isSkip, nextPrompt) {
  const userId = ctx.from.id;
  state.data[key] = isSkip ? null : ctx.message.text;
  state.currentStep = nextStep;
  stateManager.updateUserState(userId, state);

  await ctx.reply(`${EMOJI.SUCCESS} ${isSkip ? 'Skipped' : 'Saved'}\n\n${nextPrompt}\n(Use /skip to skip)`, { parse_mode: 'MarkdownV2' });
  return true;
}

async function promptNext(ctx, state, nextStep, message) {
  const userId = ctx.from.id;
  state.currentStep = nextStep;
  stateManager.updateUserState(userId, state);

  await ctx.reply(`${message}\n(Use /skip to skip)`, { parse_mode: 'MarkdownV2' });
  return true;
}

async function promptNextEdit(ctx, state, nextStep, message) {
  const userId = ctx.from.id;
  state.currentStep = nextStep;
  stateManager.updateUserState(userId, state);

  await ctx.reply(`📝 ${message}`, { parse_mode: 'MarkdownV2' });
  return true;
}

async function saveCaseData(ctx, data) {
  const { content } = await getContent();
  await createBackup(JSON.stringify(content, null, 2));

  content.GLOBAL_DATA.case_studies = content.GLOBAL_DATA.case_studies || {};
  content.GLOBAL_DATA.case_details = content.GLOBAL_DATA.case_details || {};

  content.GLOBAL_DATA.case_studies[data.id] = {
    title: data.title || '',
    desc: data.desc || '',
    metrics: data.metrics || '',
    tags: data.tags || [],
  };

  content.GLOBAL_DATA.case_details[data.id] = {
    challenge: data.challenge || '',
    approach: data.approach || [],
    solution: data.solution || '',
    results: data.results || [],
    learnings: data.learnings || '',
  };

  await updateContent(content);

  await ctx.reply(
    `${EMOJI.SUCCESS} *Case successfully created!*\n\n` +
    `📋 *Summary:*\n• ID: \`${escapeMarkdown(data.id)}\`\n• Title: ${escapeMarkdown(data.title || 'Not specified')}`,
    { parse_mode: 'MarkdownV2' }
  );
}

async function updateExistingCase(ctx, data) {
  const { content } = await getContent();
  await createBackup(JSON.stringify(content, null, 2));

  const id = data.id;

  content.GLOBAL_DATA.case_studies[id] = {
    title: data.title,
    desc: data.desc,
    metrics: data.metrics,
    tags: data.tags,
  };

  content.GLOBAL_DATA.case_details[id] = {
    challenge: data.challenge,
    approach: data.approach,
    solution: data.solution,
    results: data.results,
    learnings: data.learnings,
  };

  await updateContent(content);

  await ctx.reply(`${EMOJI.SUCCESS} *Case "${escapeMarkdown(id)}" successfully updated!*`, { parse_mode: 'MarkdownV2' });
}

module.exports = {
  handleConversation
};
