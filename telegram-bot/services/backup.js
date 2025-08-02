// telegram-bot/services/backup.js

const fs = require('fs').promises;
const path = require('path');
const { BACKUP_DIR, BACKUP_RETENTION } = require('../config/constants');
const { getBackupFiles } = require('../utils/helpers');

/**
 * Creates a backup of current content
 * @param {string} currentContent - Current content as string
 * @returns {Promise<string>} - Path to created backup
 */
async function createBackup(currentContent) {
  try {
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Generate timestamp-based filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `content-${timestamp}.json`);
    
    // Write backup file
    await fs.writeFile(backupPath, currentContent);
    console.log('[BACKUP] Created:', backupPath);
    
    // Clean up old backups
    await cleanupOldBackups();
    
    return backupPath;
  } catch (error) {
    console.error('[BACKUP] Error creating backup:', error);
    return null;
  }
}

/**
 * Removes old backups keeping only recent ones
 */
async function cleanupOldBackups() {
  try {
    const backupFiles = await getBackupFiles();
    
    if (backupFiles.length > BACKUP_RETENTION) {
      // Delete oldest backups
      const filesToDelete = backupFiles.slice(BACKUP_RETENTION);
      
      for (const file of filesToDelete) {
        const filePath = path.join(BACKUP_DIR, file);
        await fs.unlink(filePath);
        console.log('[BACKUP] Deleted old backup:', file);
      }
    }
  } catch (error) {
    console.error('[BACKUP] Error cleaning up:', error);
  }
}

/**
 * Loads content from a specific backup
 * @param {number} versionNumber - Version number (1 = most recent)
 * @returns {Promise<Object>} - Parsed backup content
 */
async function loadBackup(versionNumber) {
  const backupFiles = await getBackupFiles();
  
  if (versionNumber < 1 || versionNumber > backupFiles.length) {
    throw new Error(`Version #${versionNumber} not found. Available: 1-${backupFiles.length}`);
  }
  
  const selectedBackup = backupFiles[versionNumber - 1];
  const backupPath = path.join(BACKUP_DIR, selectedBackup);
  
  const content = await fs.readFile(backupPath, 'utf-8');
  return {
    data: JSON.parse(content),
    filename: selectedBackup,
    path: backupPath
  };
}

/**
 * Compares two content objects and finds differences
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @param {string} path - Current path in object tree
 * @returns {Array} - Array of differences
 */
function findDifferences(obj1, obj2, path = '') {
  const diffs = [];
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  
  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    const val1 = obj1?.[key];
    const val2 = obj2?.[key];
    
    if (val1 === undefined) {
      diffs.push({ type: 'added', path: currentPath });
    } else if (val2 === undefined) {
      diffs.push({ type: 'removed', path: currentPath });
    } else if (typeof val1 === 'object' && typeof val2 === 'object' && 
               val1 !== null && val2 !== null && !Array.isArray(val1)) {
      // Recursively check nested objects
      diffs.push(...findDifferences(val1, val2, currentPath));
    } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      diffs.push({ type: 'changed', path: currentPath });
    }
  }
  
  return diffs;
}

module.exports = {
  createBackup,
  loadBackup,
  findDifferences,
  getBackupFiles
};