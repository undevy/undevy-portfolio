// bot.js
// Telegram бот для управления content.json (на grammY)

require('dotenv').config();
const { Bot, InlineKeyboard } = require('grammy');

// Конфигурация из .env
const token = process.env.TELEGRAM_BOT_TOKEN;
const apiUrl = process.env.API_URL;
const apiToken = process.env.API_TOKEN;
const adminUserId = process.env.ADMIN_USER_ID;

// Проверяем наличие обязательных переменных
if (!token || !apiUrl || !apiToken) {
  console.error('Missing required environment variables!');
  console.error('Please check your .env file');
  process.exit(1);
}

// Создаём бота
const bot = new Bot(token);

// Middleware для проверки авторизации
bot.use(async (ctx, next) => {
  // Пропускаем не-message события
  if (!ctx.from) return next();
  
  const userId = ctx.from.id;
  
  // Если ADMIN_USER_ID не установлен, разрешаем всем (для тестирования)
  const isAuthorized = !adminUserId || String(userId) === String(adminUserId);
  
  if (!isAuthorized) {
    return ctx.reply('❌ Unauthorized. This bot is private.');
  }
  
  // Логируем все действия
  const action = ctx.message?.text || ctx.callbackQuery?.data || 'unknown';
  console.log(`[${new Date().toISOString()}] User @${ctx.from.username} (${userId}): ${action}`);
  
  return next();
});

// Функция для работы с API
async function callAPI(method, data = null) {
  const options = {
    method: method,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(apiUrl, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Команда /start
bot.command('start', async (ctx) => {
  const welcomeMessage = `
🤖 *Portfolio Content Manager*

Доступные команды:
- /status - Проверить статус и статистику
- /get - Получить текущий content.json
- /test - Тестовая команда с кнопками

_Версия: 1.0.0 (grammY)_
`;
  
  await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

// Команда /status
bot.command('status', async (ctx) => {
  try {
    await ctx.reply('⏳ Проверяю статус...');
    
    const result = await callAPI('GET');
    
    const statusMessage = `
✅ *Статус системы*

📊 *Статистика:*
- Профилей: ${result.stats.profilesCount}
- Размер файла: ${(result.stats.fileSize / 1024).toFixed(1)} KB
- Последнее изменение: ${new Date(result.stats.lastModified).toLocaleString('ru-RU')}

🔗 API URL: \`${apiUrl}\`
⏰ Время сервера: ${new Date(result.timestamp).toLocaleString('ru-RU')}
`;
    
    await ctx.reply(statusMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply(`❌ Ошибка: ${error.message}`);
  }
});

// Команда /get
bot.command('get', async (ctx) => {
  try {
    await ctx.reply('⏳ Получаю content.json...');
    
    const result = await callAPI('GET');
    
    // Проверяем размер
    const contentStr = JSON.stringify(result.content, null, 2);
    if (contentStr.length > 4000) {
      // Если слишком большой, отправляем файлом
      await ctx.replyWithDocument({
        source: Buffer.from(contentStr, 'utf-8'),
        filename: 'content.json'
      }, {
        caption: '📄 Текущий content.json'
      });
    } else {
      // Если влезает, отправляем текстом
      await ctx.reply('```json\n' + contentStr + '\n```', { 
        parse_mode: 'Markdown' 
      });
    }
  } catch (error) {
    await ctx.reply(`❌ Ошибка: ${error.message}`);
  }
});

// Команда /test с inline клавиатурой
bot.command('test', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('📊 Статус', 'action_status')
    .text('📄 Получить JSON', 'action_get')
    .row()
    .text('✏️ Редактировать', 'action_edit');
  
  await ctx.reply('Выберите действие:', {
    reply_markup: keyboard
  });
});

// Обработка inline кнопок
bot.callbackQuery('action_status', async (ctx) => {
  await ctx.answerCallbackQuery(); // Убираем "часики"
  await ctx.reply('⏳ Проверяю статус...');
  
  try {
    const result = await callAPI('GET');
    const statusMessage = `
✅ *Статус системы*

📊 *Статистика:*
- Профилей: ${result.stats.profilesCount}
- Размер файла: ${(result.stats.fileSize / 1024).toFixed(1)} KB
- Последнее изменение: ${new Date(result.stats.lastModified).toLocaleString('ru-RU')}
`;
    await ctx.reply(statusMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply(`❌ Ошибка: ${error.message}`);
  }
});

bot.callbackQuery('action_get', async (ctx) => {
  await ctx.answerCallbackQuery();
  
  try {
    await ctx.reply('⏳ Получаю content.json...');
    const result = await callAPI('GET');
    
    const contentStr = JSON.stringify(result.content, null, 2);
    await ctx.replyWithDocument({
      source: Buffer.from(contentStr, 'utf-8'),
      filename: 'content.json'
    }, {
      caption: '📄 Текущий content.json'
    });
  } catch (error) {
    await ctx.reply(`❌ Ошибка: ${error.message}`);
  }
});

bot.callbackQuery('action_edit', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('🚧 Функция редактирования будет доступна в следующей версии!');
});

// Обработка неизвестных команд
bot.on('message:text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) {
    await ctx.reply('❓ Неизвестная команда. Используйте /start для просмотра доступных команд.');
  }
});

// Обработка ошибок
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Запуск бота
bot.start({
  onStart: () => console.log('Bot started successfully! Waiting for messages...'),
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down bot...');
  bot.stop();
  process.exit(0);
});
