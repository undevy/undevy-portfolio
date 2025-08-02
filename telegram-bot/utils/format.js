// telegram-bot/utils/format.js

const { EMOJI } = require('../config/constants');


/**
 * Escapes special characters in text for Telegram Markdown.
 * @param {string} text 
 * @returns {string}
 */
function escapeMarkdown(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Formats a date to a human-readable string.
 * @param {*} date 
 * @returns 
 */
function formatDate(date) {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** * Truncates text to a specified length, adding ellipsis if necessary.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/** * Formats file size in a human-readable way.
 * @param {number} bytes 
 * @returns {string}
 */ 
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

module.exports = {
  escapeMarkdown,
  formatDate,
  truncateText,
  formatFileSize
};