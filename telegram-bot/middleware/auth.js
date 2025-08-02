// telegram-bot/middleware/auth.js

const { ADMIN_USER_ID, EMOJI } = require('../config/constants');

/**
 * Authorization middleware for bot commands
 * @param {Context} ctx - Bot context
 * @param {Function} next - Next middleware
 */
async function authMiddleware(ctx, next) {
  if (!ctx.from) return next();
  
  const userId = ctx.from.id;
  const isAuthorized = !ADMIN_USER_ID || String(userId) === String(ADMIN_USER_ID);
  
  if (!isAuthorized) {
    console.log(`[AUTH] Unauthorized access attempt by User ID: ${userId}`);
    return ctx.reply(`${EMOJI.ERROR} Unauthorized. This bot is private.`);
  }
  
  // Log authorized action
  const action = ctx.message?.text || ctx.callbackQuery?.data || 'unknown';
  const username = ctx.from.username || 'no-username';
  console.log(`[AUTH] Authorized: @${username} (${userId}) - ${action}`);
  
  return next();
}

module.exports = authMiddleware;