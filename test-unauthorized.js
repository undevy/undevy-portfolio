// test-unauthorized.js
// Тест неавторизованного доступа

async function testUnauthorized() {
  console.log('Testing unauthorized access...');
  
  // Без токена
  const response1 = await fetch('http://localhost:3000/api/admin/content');
  console.log('Without token:', response1.status, response1.statusText);
  
  // С неправильным токеном
  const response2 = await fetch('http://localhost:3000/api/admin/content', {
    headers: {
      'Authorization': 'Bearer wrong-token'
    }
  });
  console.log('With wrong token:', response2.status, response2.statusText);
}

testUnauthorized();
