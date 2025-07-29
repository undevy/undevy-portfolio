// src/app/api/admin/content/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { validateContentStructure, deepMerge } from './validator';

// Секретный токен для доступа к API
const ADMIN_TOKEN = 'your-super-secret-token-2024';

// Определяем путь к файлу в зависимости от окружения
const CONTENT_FILE_PATH = process.env.NODE_ENV === 'production' 
  ? '/home/undevy/content.json'
  : path.join(process.cwd(), 'src/app/test-content.json');

// Путь к папке с бэкапами
const BACKUP_DIR = process.env.NODE_ENV === 'production'
  ? '/home/undevy/content-backups'
  : path.join(process.cwd(), 'content-backups');

// Функция для проверки авторизации
function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_TOKEN;
}

// Функция создания бэкапа
async function createBackup(currentContent) {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `content-${timestamp}.json`);
    
    await fs.writeFile(backupPath, currentContent);
    console.log('[ADMIN API] Backup created:', backupPath);
    
    // Удаляем старые бэкапы (оставляем только последние 10)
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('content-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 10) {
      for (const oldBackup of backupFiles.slice(10)) {
        await fs.unlink(path.join(BACKUP_DIR, oldBackup));
        console.log('[ADMIN API] Deleted old backup:', oldBackup);
      }
    }
    
    return backupPath;
  } catch (error) {
    console.error('[ADMIN API] Backup error:', error);
    return null;
  }
}

// GET - получить текущий content.json
export async function GET(request) {
  console.log('[ADMIN API] GET request received');
  
  if (!isAuthorized(request)) {
    console.log('[ADMIN API] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const fileContent = await fs.readFile(CONTENT_FILE_PATH, 'utf-8');
    const content = JSON.parse(fileContent);
    
    // Добавляем статистику
    const stats = {
      profilesCount: Object.keys(content).filter(k => k === k.toUpperCase() && k !== 'GLOBAL_DATA').length,
      lastModified: (await fs.stat(CONTENT_FILE_PATH)).mtime,
      fileSize: fileContent.length
    };
    
    return NextResponse.json({
      success: true,
      content: content,
      stats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[ADMIN API] Error reading content:', error);
    return NextResponse.json(
      { error: 'Failed to read content', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - полностью заменить content.json
export async function PUT(request) {
  console.log('[ADMIN API] PUT request received');
  
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Получаем новый контент
    const newContent = await request.json();
    
    // Валидируем структуру
    const validation = validateContentStructure(newContent);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid content structure', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Читаем текущий контент для бэкапа
    let backupPath = null;
    try {
      const currentContent = await fs.readFile(CONTENT_FILE_PATH, 'utf-8');
      backupPath = await createBackup(currentContent);
    } catch (error) {
      console.log('[ADMIN API] No existing file to backup');
    }
    
    // Записываем новый контент
    await fs.writeFile(
      CONTENT_FILE_PATH,
      JSON.stringify(newContent, null, 2)
    );
    
    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      backup: backupPath,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[ADMIN API] Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - частичное обновление
export async function PATCH(request) {
  console.log('[ADMIN API] PATCH request received');
  
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { path: updatePath, value } = await request.json();
    
    if (!updatePath || value === undefined) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Path and value are required' },
        { status: 400 }
      );
    }
    
    // Читаем текущий контент
    const fileContent = await fs.readFile(CONTENT_FILE_PATH, 'utf-8');
    const currentContent = JSON.parse(fileContent);
    
    // Создаём бэкап
    await createBackup(fileContent);
    
    // Применяем изменение
    const pathParts = updatePath.split('.');
    let target = currentContent;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!target[pathParts[i]]) {
        target[pathParts[i]] = {};
      }
      target = target[pathParts[i]];
    }
    
    target[pathParts[pathParts.length - 1]] = value;
    
    // Валидируем результат
    const validation = validateContentStructure(currentContent);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Update would create invalid structure', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Сохраняем
    await fs.writeFile(
      CONTENT_FILE_PATH,
      JSON.stringify(currentContent, null, 2)
    );
    
    return NextResponse.json({
      success: true,
      message: 'Content patched successfully',
      updatedPath: updatePath,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[ADMIN API] Error in PATCH:', error);
    return NextResponse.json(
      { error: 'Failed to patch content', details: error.message },
      { status: 500 }
    );
  }
}

// OPTIONS для CORS
export async function OPTIONS(request) {
  return new NextResponse(null, { status: 200 });
}
