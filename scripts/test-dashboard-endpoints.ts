import * as dotenv from 'dotenv'
import * as path from 'path'
import * as jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

async function testDashboardEndpoints() {
  const baseUrl = 'http://localhost:3000/api';
  
  // Create a test JWT token for user
  const testUserId = 'user_mhdpmbma_74u9o09'; // test2 user from database
  const token = jwt.sign(
    { userId: testUserId, email: 'test2@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  
  console.log('===========================================');
  console.log('TESTING DASHBOARD API ENDPOINTS');
  console.log('===========================================\n');
  console.log('Using test user ID:', testUserId);
  console.log('Token:', token.substring(0, 50) + '...\n');
  
  let allPassed = true;
  
  // Test /api/user/profile
  console.log('1. Testing /api/user/profile...');
  try {
    const response = await fetch(`${baseUrl}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status !== 200 || !data.success) {
      console.log('❌ FAILED');
      allPassed = false;
    } else {
      console.log('✅ PASSED');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    allPassed = false;
  }
  
  // Test /api/packages/my-packages
  console.log('\n2. Testing /api/packages/my-packages...');
  try {
    const response = await fetch(`${baseUrl}/packages/my-packages?status=ACTIVE`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status !== 200 || !data.success) {
      console.log('❌ FAILED');
      allPassed = false;
    } else {
      console.log('✅ PASSED');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    allPassed = false;
  }
  
  // Test /api/earnings/summary
  console.log('\n3. Testing /api/earnings/summary...');
  try {
    const response = await fetch(`${baseUrl}/earnings/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status !== 200 || !data.success) {
      console.log('❌ FAILED');
      allPassed = false;
    } else {
      console.log('✅ PASSED');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    allPassed = false;
  }
  
  // Test /api/packages (available packages)
  console.log('\n4. Testing /api/packages (available packages)...');
  try {
    const response = await fetch(`${baseUrl}/packages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status !== 200 || !data.success) {
      console.log('❌ FAILED');
      allPassed = false;
    } else {
      console.log('✅ PASSED');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    allPassed = false;
  }
  
  console.log('\n===========================================');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!');
  } else {
    console.log('❌ SOME TESTS FAILED - Check the errors above');
  }
  console.log('===========================================');
}

testDashboardEndpoints();
