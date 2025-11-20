#!/usr/bin/env node

/**
 * Recalculate Referral Earnings Script
 *
 * This script will:
 * 1. Delete all existing referral earnings and transactions
 * 2. Recalculate earnings for all existing packages using the updated function
 *
 * Usage: node scripts/recalculate_referral_earnings.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Database connection - you'll need to set these environment variables
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'your_database_name';
const DB_USER = process.env.DB_USER || 'your_username';
const DB_PASSWORD = process.env.DB_PASSWORD || 'your_password';

const CONNECTION_STRING = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('🔄 Starting referral earnings recalculation...');
console.log('⚠️  WARNING: This will delete all existing referral earnings and recalculate them.');
console.log('');

// Check if we should proceed
if (process.argv.includes('--dry-run')) {
  console.log('🧪 DRY RUN MODE - No changes will be made');
  console.log('');
}

// Read the SQL script
const sqlScriptPath = path.join(__dirname, 'recalculate_referral_earnings.sql');
const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

console.log('📄 SQL Script loaded successfully');
console.log('');

// Build the psql command
const psqlCommand = `psql "${CONNECTION_STRING}" -c "${sqlScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;

try {
  if (process.argv.includes('--dry-run')) {
    console.log('🧪 Would execute command:');
    console.log(psqlCommand);
    console.log('');
    console.log('✅ Dry run complete - no changes made');
  } else {
    console.log('⚡ Executing recalculation...');
    const result = execSync(psqlCommand, { encoding: 'utf8', stdio: 'inherit' });
    console.log('');
    console.log('✅ Referral earnings recalculation completed successfully!');
    console.log('');
    console.log('📊 Check your database for the updated earnings.');
    console.log('🔍 You can verify the results by checking the network stats in your application.');
  }
} catch (error) {
  console.error('❌ Error during recalculation:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Make sure your database connection environment variables are set');
  console.log('2. Ensure you have psql installed and in your PATH');
  console.log('3. Check that the database is accessible');
  console.log('4. You can also run the SQL script manually using a database client');
  process.exit(1);
}