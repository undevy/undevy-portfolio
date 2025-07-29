// test-admin-api-full.js
// Полный тест админского API

const API_URL = 'http://localhost:3000/api/admin/content';
const TOKEN = 'your-super-secret-token-2024';

// Цвета для красивого вывода
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testGet() {
  console.log(colors.blue + '\n=== Testing GET ===' + colors.reset);
  
  const response = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Stats:', data.stats);
  console.log('Success:', data.success ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset);
}

async function testPutInvalid() {
  console.log(colors.blue + '\n=== Testing PUT with invalid data ===' + colors.reset);
  
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ invalid: 'structure' })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Error:', data.error);
  console.log('Details:', data.details);
  console.log('Should fail:', response.status === 400 ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset);
}

async function testPatch() {
  console.log(colors.blue + '\n=== Testing PATCH ===' + colors.reset);
  
  const response = await fetch(API_URL, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      path: 'LOCAL_TEST.profile.status.availability',
      value: 'Busy until January 2025'
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Result:', data);
  console.log('Success:', data.success ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset);
}

// Запускаем все тесты последовательно
async function runAllTests() {
  console.log(colors.yellow + 'Starting Admin API tests...' + colors.reset);
  
  await testGet();
  await testPutInvalid();
  await testPatch();
  
  console.log(colors.yellow + '\nAll tests completed!' + colors.reset);
}

runAllTests().catch(console.error);
