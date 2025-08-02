// telegram-bot/handlers/errors.js

const { GrammyError, HttpError } = require('grammy');
const { EMOJI } = require('../config/constants');
const { escapeMarkdown } = require('../utils/format');

/**
 * Global error handler for the bot
 * @param {Error} err - Error object with context
 */
function setupErrorHandler(bot) {
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`[ERROR] While handling update ${ctx.update.update_id}:`, err.error);
    
    const e = err.error;
    
    if (e instanceof GrammyError) {
      console.error('[ERROR] Grammy error:', e.description);
      handleGrammyError(ctx, e);
    } else if (e instanceof HttpError) {
      console.error('[ERROR] Network error:', e);
      handleNetworkError(ctx, e);
    } else {
      console.error('[ERROR] Unknown error:', e);
      handleUnknownError(ctx, e);
    }
  });
}

/**
 * Handles Grammy-specific errors
 */
async function handleGrammyError(ctx, error) {
  // Check for specific Grammy errors
  if (error.description.includes('message is not modified')) {
    // Silently ignore - this happens when we try to edit a message with same content
    return;
  }
  
  if (error.description.includes('message to edit not found')) {
    // Message was probably deleted
    return ctx.reply(`${EMOJI.WARNING} The message you're trying to edit was deleted.`);
  }
  
  // Generic Grammy error
  await sendErrorMessage(ctx, 'Telegram API error occurred. Please try again.');
}

/**
 * Handles network/HTTP errors
 */
async function handleNetworkError(ctx, error) {
  await sendErrorMessage(ctx, 'Network error occurred. Please check your connection and try again.');
}

/**
 * Handles unknown errors
 */
async function handleUnknownError(ctx, error) {
  // Log full error details for debugging
  console.error('[ERROR] Stack trace:', error.stack);
  
  // Send generic message to user
  await sendErrorMessage(ctx, 'An unexpected error occurred. The administrator has been notified.');
}

/**
 * Sends formatted error message to user
 */
async function sendErrorMessage(ctx, message) {
  try {
    await ctx.reply(
      `${EMOJI.ERROR} ${escapeMarkdown(message)}`,
      { parse_mode: 'MarkdownV2' }
    );
  } catch (sendError) {
    // If we can't even send an error message, just log it
    console.error('[ERROR] Failed to send error message:', sendError);
  }
}

/**
 * Wraps an async function with error handling
 * Use this for command handlers to catch and handle errors gracefully
 */
function withErrorHandling(handler) {
  return async (ctx) => {
    try {
      await handler(ctx);
    } catch (error) {
      console.error('[ERROR] In handler:', error);
      
      // Determine user-friendly message based on error type
      let userMessage = 'An error occurred while processing your request.';
      
      if (error.message.includes('API request failed')) {
        userMessage = 'Failed to connect to the server. Please try again later.';
      } else if (error.message.includes('Invalid')) {
        userMessage = error.message; // Validation errors are usually user-friendly
      }
      
      await sendErrorMessage(ctx, userMessage);
    }
  };
}

module.exports = {
  setupErrorHandler,
  withErrorHandling,
  sendErrorMessage
};