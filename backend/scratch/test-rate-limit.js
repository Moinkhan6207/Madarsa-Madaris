const axios = require('axios');

async function testRateLimit() {
  const url = 'http://localhost:5001/api/v1/auth/login';
  console.log('--- Testing Rate Limiting on /api/v1/auth/login ---');
  
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await axios.post(url, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log(`Request ${i}: Success (Status: ${response.status})`);
    } catch (error) {
      if (error.response) {
        console.log(`Request ${i}: Blocked (Status: ${error.response.status}, Code: ${error.response.data.error?.code})`);
      } else {
        console.log(`Request ${i}: Error (${error.message})`);
      }
    }
  }
}

testRateLimit();
