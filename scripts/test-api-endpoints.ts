import * as dotenv from 'dotenv'
import * as path from 'path'
import * as jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:3001/api';
  
  // Create a test JWT token for user
  const testUserId = 'user_mhdpmbma_74u9o09'; // test2 user from database
  const token = jwt.sign(
    { userId: testUserId, email: 'test2@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  
  console.log('===========================================');
  console.log('TESTING REFERRAL API ENDPOINTS');
  console.log('===========================================\n');
  console.log('Using test user ID:', testUserId);
  console.log('Token:', token.substring(0, 50) + '...\n');
  
  // Test /api/referrals/direct
  console.log('1. Testing /api/referrals/direct...');
  try {
    const response = await fetch(`${baseUrl}/referrals/direct`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Test /api/referrals/stats
  console.log('\n2. Testing /api/referrals/stats...');
  try {
    const response = await fetch(`${baseUrl}/referrals/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Test /api/referrals/tree
  console.log('\n3. Testing /api/referrals/tree...');
  try {
    const response = await fetch(`${baseUrl}/referrals/tree`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPIEndpoints();
