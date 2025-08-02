// telegram-bot/utils/validators.js

/**
 * Validates case ID format
 * @param {string} id - Case ID to validate
 * @returns {boolean} - True if valid
 */
function isValidCaseId(id) {
  return /^[a-z0-9_]+$/.test(id);
}

/**
 * Validates that required fields are present
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - { valid: boolean, missing: Array }
 */
function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field]);
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Validates array input (for tags, approach steps, etc)
 * @param {string} input - Comma or newline separated input
 * @param {string} separator - Separator to use
 * @returns {Array} - Cleaned array
 */
function parseArrayInput(input, separator = ',') {
  if (!input) return [];
  
  return input
    .split(separator)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Checks if a case already exists
 * @param {Object} content - Full content object
 * @param {string} caseId - Case ID to check
 * @returns {boolean} - True if exists
 */
function caseExists(content, caseId) {
  return !!(content.GLOBAL_DATA?.case_studies?.[caseId]);
}

/**
 * Finds which profiles use a specific case
 * @param {Object} content - Full content object
 * @param {string} caseId - Case ID to check
 * @returns {Array} - Array of profile IDs
 */
function findProfilesUsingCase(content, caseId) {
  const profiles = [];
  
  for (const [profileId, profile] of Object.entries(content)) {
    if (profileId !== 'GLOBAL_DATA' && profile.meta?.cases?.includes(caseId)) {
      profiles.push(profileId);
    }
  }
  
  return profiles;
}

module.exports = {
  isValidCaseId,
  validateRequiredFields,
  parseArrayInput,
  caseExists,
  findProfilesUsingCase
};