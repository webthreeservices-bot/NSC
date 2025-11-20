const https = require('https')

// Get token from .env or use a test token
const testToken = 'YOUR_TEST_TOKEN_HERE' // Replace with actual token

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/packages/my-packages?status=ACTIVE',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${testToken}`
  }
}

console.log('Testing /api/packages/my-packages endpoint...\n')
console.log('Note: Start the dev server and get a valid token first\n')

// This is just a template - you need to run this manually with a real token
console.log('To test manually:')
console.log('1. Open browser dev tools')
console.log('2. Go to http://localhost:3000/dashboard')
console.log('3. Check the Network tab for the /api/packages/my-packages request')
console.log('4. Look at the Response tab to see what dates are being returned')
console.log('\nOr use this curl command:')
console.log('curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/packages/my-packages?status=ACTIVE')
