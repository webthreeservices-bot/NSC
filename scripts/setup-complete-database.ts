#!/usr/bin/env node

/**
 * Database Setup Script
 * Complete database initialization for NSC Bot Platform
 * 
 * Usage: npm run db:setup
 * or: node scripts/setup-complete-database.js
 */

const { setupCompleteDatabase, verifyDatabaseSetup, quickHealthCheck } = require('../lib/db-complete-setup')
const { testConnection } = require('../lib/db-connection')

async function main() {
  console.log('🚀 NSC Bot Platform - Complete Database Setup')
  console.log('='.repeat(60))

  try {
    // Step 1: Check environment
    console.log('\n📋 Step 1: Environment Check')
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set!')
      console.log('\n💡 Setup Instructions:')
      console.log('1. Copy your database connection string from Neon/Supabase/etc.')
      console.log('2. Update DATABASE_URL in your .env file')
      console.log('3. Run this script again')
      process.exit(1)
    }

    console.log('✅ Environment variables configured')

    // Step 2: Test connection
    console.log('\n📡 Step 2: Database Connection Test')
    const connectionOk = await testConnection()
    
    if (!connectionOk) {
      console.error('❌ Database connection failed!')
      console.log('\n💡 Troubleshooting:')
      console.log('1. Verify your DATABASE_URL is correct')
      console.log('2. Check if your database server is running')
      console.log('3. Ensure firewall allows connections')
      process.exit(1)
    }

    console.log('✅ Database connection successful')

    // Step 3: Pre-setup verification
    console.log('\n🔍 Step 3: Pre-setup Verification')
    const preVerification = await verifyDatabaseSetup()
    console.log(`📊 Current tables: ${preVerification.tableCount}`)
    
    if (preVerification.missingTables.length > 0) {
      console.log(`⚠️ Missing tables: ${preVerification.missingTables.length}`)
      console.log('Missing:', preVerification.missingTables.join(', '))
    } else {
      console.log('✅ All expected tables present')
    }

    // Step 4: Complete database setup
    console.log('\n🏗️ Step 4: Complete Database Setup')
    const setupResult = await setupCompleteDatabase()

    if (!setupResult.success) {
      console.error('❌ Database setup failed!')
      console.error('Message:', setupResult.message)
      if (setupResult.errors) {
        console.error('\nErrors encountered:')
        setupResult.errors.forEach((error, index) => {
          console.error(`  ${index + 1}. ${error}`)
        })
      }
      
      // Try to continue with verification anyway
      console.log('\n🔍 Attempting verification despite errors...')
    } else {
      console.log('✅ Database setup completed successfully!')
    }

    console.log(`📊 Total tables created: ${setupResult.tablesCreated || 'Unknown'}`)

    // Step 5: Post-setup verification
    console.log('\n✅ Step 5: Post-setup Verification')
    const postVerification = await verifyDatabaseSetup()
    
    console.log(`📊 Final table count: ${postVerification.tableCount}`)
    
    if (postVerification.missingTables.length > 0) {
      console.warn(`⚠️ Still missing ${postVerification.missingTables.length} tables:`)
      postVerification.missingTables.forEach(table => {
        console.warn(`  - ${table}`)
      })
    } else {
      console.log('✅ All expected tables verified!')
    }

    // Step 6: Health check
    console.log('\n🏥 Step 6: Final Health Check')
    const healthOk = await quickHealthCheck()
    
    if (healthOk) {
      console.log('✅ Database health check passed!')
    } else {
      console.warn('⚠️ Database health check failed!')
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SETUP SUMMARY')
    console.log('='.repeat(60))
    console.log(`Database Connection: ${connectionOk ? '✅ OK' : '❌ FAILED'}`)
    console.log(`Schema Setup: ${setupResult.success ? '✅ OK' : '❌ FAILED'}`)
    console.log(`Tables Created: ${setupResult.tablesCreated || 'Unknown'}`)
    console.log(`Missing Tables: ${postVerification.missingTables.length}`)
    console.log(`Health Check: ${healthOk ? '✅ OK' : '❌ FAILED'}`)

    if (setupResult.success && postVerification.missingTables.length === 0 && healthOk) {
      console.log('\n🎉 COMPLETE DATABASE SETUP SUCCESSFUL!')
      console.log('\n📋 Next Steps:')
      console.log('1. Create your first admin user: npm run create:admin')
      console.log('2. Start the development server: npm run dev')
      console.log('3. Visit http://localhost:3000 to test the application')
    } else {
      console.log('\n⚠️ SETUP COMPLETED WITH ISSUES')
      console.log('\n💡 Recommended Actions:')
      
      if (!setupResult.success) {
        console.log('- Review the setup errors above')
        console.log('- Check your database permissions')
        console.log('- Ensure the database schema is compatible')
      }
      
      if (postVerification.missingTables.length > 0) {
        console.log('- Manually create missing tables using SQL scripts')
        console.log('- Check the /lib/db-*.sql files for individual table creation')
      }
      
      if (!healthOk) {
        console.log('- Verify database connectivity and basic table structure')
        console.log('- Check for database corruption or permission issues')
      }
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR during database setup:')
    console.error(error.message)
    console.error('\n🔧 Debugging Information:')
    console.error('Error Stack:', error.stack)
    process.exit(1)
  }
}

// Execute if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✨ Database setup script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Script execution failed:', error.message)
      process.exit(1)
    })
}

module.exports = main