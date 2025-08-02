// telegram-bot/services/api.js

const { API_URL, API_TOKEN } = require('../config/constants');

/**
 * Makes a request to the API with the specified method and data.
 * @param {string} method - The HTTP method to use (GET, POST, etc.).
 * @param {Object} [data=null] - The data to send with the request.
 * @returns {Promise<Object>} - The JSON response from the API.
 */
async function callAPI(method, data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(API_URL, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    
    if (method === 'PUT' || method === 'PATCH') {
      console.log(`[${new Date().toISOString()}] Content modified via ${method}. Backup: ${result.backup}`);
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/** * Fetches the current content from the API.
 * @returns {Promise<Object>} - The current content from the API.
 */
async function getContent() {
  return callAPI('GET');
}

/** * Updates the content on the API.
 * @param {Object} content - The content to update.
 * @returns {Promise<Object>} - The updated content from the API.
 */
async function updateContent(content) {
  return callAPI('PUT', content);
}

/** * Patches a specific path in the content with the given value.
 * @param {string} path - The path to patch.
 * @param {*} value - The value to set at the specified path.
 * @returns {Promise<Object>} - The updated content from the API.
 */
async function patchContent(path, value) {
  return callAPI('PATCH', { path, value });
}

module.exports = {
  getContent,
  updateContent,
  patchContent
};