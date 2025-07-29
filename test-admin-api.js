// test-admin-api.js
// Тестовый скрипт для проверки админского API

const API_URL = 'http://localhost:3000/api/admin/content';
const TOKEN = 'your-super-secret-token-2024';

async function testGet() {
  console.log('Testing GET /api/admin/content...');
  
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Запускаем тест
testGet();
