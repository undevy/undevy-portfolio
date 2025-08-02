// telegram-bot/utils/helpers.js

const fs = require('fs').promises;
const path = require('path');
const { BACKUP_DIR } = require('../config/constants');

/**
 * Gets sorted list of backup files
 * @returns {Promise<Array>} - Array of backup filenames, newest first
 */
async function getBackupFiles() {
  try {
    const files = await fs.readdir(BACKUP_DIR);
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
 * Parses backup filename to readable date
 * @param {string} filename - Backup filename
 * @returns {string} - Human-readable date
 */
function parseBackupName(filename) {
  const rawTimestamp = filename.replace('content-', '').replace('.json', '');
  const normalized = rawTimestamp.replace(
    /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    '$1T$2:$3:$4.$5Z'
  );
  return new Date(normalized).toLocaleString('ru-RU');
}

/**
 * Creates timestamp for current moment
 * @returns {string} - Formatted timestamp HH:MM:SS
 */
function getTimestamp() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Splits long message into chunks
 * @param {string} message - Long message to split
 * @param {number} maxLength - Maximum chunk length
 * @returns {Array} - Array of message chunks
 */
function splitMessage(message, maxLength = 4000) {
  if (message.length <= maxLength) return [message];
  
  const chunks = [];
  let currentChunk = '';
  
  const lines = message.split('\n');
  
  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxLength) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
}

module.exports = {
  getBackupFiles,
  parseBackupName,
  getTimestamp,
  splitMessage
};