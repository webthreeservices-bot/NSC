import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');

console.log('===========================================');
console.log('DATABASE SETUP HELPER');
console.log('===========================================\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Creating .env from .env.example...');
  
  const examplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ .env file created from .env.example');
  } else {
    console.log('❌ .env.example not found either!');
    process.exit(1);
  }
}

// Read current .env
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

// Check DATABASE_URL
const dbUrlLine = lines.find(line => line.startsWith('DATABASE_URL='));
if (dbUrlLine) {
  const currentUrl = dbUrlLine.split('=')[1].replace(/"/g, '');
  console.log('Current DATABASE_URL:', currentUrl);
  
  if (currentUrl.includes('user:password')) {
    console.log('\n⚠️  DATABASE_URL still has default placeholder values!');
    console.log('\nYou need to update the DATABASE_URL in your .env file.');
    console.log('\nOptions:');
    console.log('1. For local PostgreSQL:');
    console.log('   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/nsc_bot?schema=public"');
    console.log('\n2. For Neon (recommended for quick setup):');
    console.log('   - Go to https://neon.tech');
    console.log('   - Create a free account');
    console.log('   - Create a new database');
    console.log('   - Copy the connection string and paste it in .env');
    console.log('\n3. For Supabase:');
    console.log('   - Go to https://supabase.com');
    console.log('   - Create a free project');
    console.log('   - Go to Settings > Database');
    console.log('   - Copy the connection string and paste it in .env');
  } else {
    console.log('✅ DATABASE_URL appears to be configured');
    
    // Test if it's a valid PostgreSQL URL
    const urlPattern = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+/;
    if (!urlPattern.test(currentUrl)) {
      console.log('⚠️  DATABASE_URL format looks incorrect');
      console.log('Expected format: postgresql://username:password@host:port/database');
    }
  }
} else {
  console.log('❌ DATABASE_URL not found in .env file!');
  console.log('Please add DATABASE_URL to your .env file');
}

console.log('\n===========================================');
console.log('QUICK DATABASE SETUP GUIDE');
console.log('===========================================\n');
console.log('For the fastest setup, use Neon (free PostgreSQL):');
console.log('1. Go to https://neon.tech and sign up');
console.log('2. Create a new project (choose any region)');
console.log('3. Copy the connection string from the dashboard');
console.log('4. Replace the DATABASE_URL in your .env file');
console.log('5. Run: npm run db:push');
console.log('\nAlternatively, if you have PostgreSQL installed locally:');
console.log('1. Create a database: createdb nsc_bot');
console.log('2. Update DATABASE_URL in .env with your local credentials');
console.log('3. Run: npm run db:push');
