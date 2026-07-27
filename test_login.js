async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@studypilot.com', password: 'demo1234' })
    });
    const data = await response.json();
    console.log('STATUS:', response.status);
    console.log('RESPONSE:', data);
  } catch (error) {
    console.error('ERROR:', error);
  }
}

testLogin();
