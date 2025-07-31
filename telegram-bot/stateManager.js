// telegram-bot/stateManager.js

// Simple in-memory state management for user conversations
const userStates = new Map();

// Possible states for the add_case flow
const ADD_CASE_STATES = {
  WAITING_ID: 'waiting_id',
  WAITING_TITLE: 'waiting_title',
  WAITING_DESC: 'waiting_desc',
  WAITING_METRICS: 'waiting_metrics',
  WAITING_TAGS: 'waiting_tags',
  WAITING_CHALLENGE: 'waiting_challenge',
  WAITING_APPROACH: 'waiting_approach',
  WAITING_SOLUTION: 'waiting_solution',
  WAITING_RESULTS: 'waiting_results',
  WAITING_LEARNINGS: 'waiting_learnings'
};

// Possible states for the edit_case flow
const EDIT_CASE_STATES = {
  WAITING_CASE_ID: 'waiting_case_id_to_edit',
  WAITING_TITLE: 'waiting_title_edit',
  WAITING_DESC: 'waiting_desc_edit',
  WAITING_METRICS: 'waiting_metrics_edit',
  WAITING_TAGS: 'waiting_tags_edit',
  WAITING_CHALLENGE: 'waiting_challenge_edit',
  WAITING_APPROACH: 'waiting_approach_edit',
  WAITING_SOLUTION: 'waiting_solution_edit',
  WAITING_RESULTS: 'waiting_results_edit',
  WAITING_LEARNINGS: 'waiting_learnings_edit'
};

// Initialize user state
function initUserState(userId) {
  userStates.set(userId, {
    command: null,
    currentStep: null,
    data: {},
    startedAt: Date.now()
  });
}

// Get user state
function getUserState(userId) {
  return userStates.get(userId);
}

// Update user state
function updateUserState(userId, updates) {
  const currentState = getUserState(userId) || {};
  userStates.set(userId, {
    ...currentState,
    ...updates
  });
}

// Clear user state
function clearUserState(userId) {
  userStates.delete(userId);
}

// Check if user has active state
function hasActiveState(userId) {
  return userStates.has(userId);
}

// Clean up old states (older than 1 hour)
function cleanupOldStates() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [userId, state] of userStates.entries()) {
    if (state.startedAt < oneHourAgo) {
      userStates.delete(userId);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldStates, 30 * 60 * 1000);

module.exports = {
  ADD_CASE_STATES,
  EDIT_CASE_STATES,
  initUserState,
  getUserState,
  updateUserState,
  clearUserState,
  hasActiveState
};