const axios = require('axios');

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      email: 'faculty@lab.edu',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login successful, token retrieved.');

    const res = await axios.get('http://localhost:5005/api/announcements', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Announcements retrieved:', res.data);
  } catch (err) {
    console.error('API request failed:', err.response ? err.response.data : err.message);
  }
}

run();
