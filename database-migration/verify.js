require('dotenv').config();
const { Client } = require('@neondatabase/serverless');

const log = {
  info: (msg) => console.log('ℹ️ ', msg),
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.log('❌', msg),
  warning: (msg) => console.log('⚠️ ', msg),
};

async function verify() {
  console.log('\n🔍 Database Verification\n');
  console.log('='.repeat(60));

  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL not found in .env file');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    log.success('Connected to database\n');

    // Check tables
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tablesResult.rows[0].count);
    
    console.log('📊 Tables');
    log.info(`Found: ${tableCount} tables`);
    if (tableCount >= 30) {
      log.success('Table count looks good (expected 35+)');
    } else {
      log.warning(`Expected 35+ tables, found ${tableCount}`);
    }

    // List some key tables
    const keyTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('User', 'Package', 'Transaction', 'SystemSetting')
      ORDER BY tablename
    `);
    if (keyTables.rows.length === 4) {
      log.success('Key tables exist: User, Package, Transaction, SystemSetting');
    } else {
      log.warning('Some key tables may be missing');
    }

    // Check functions
    console.log('\n🔧 Functions');
    const functionsResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
    `);
    const functionCount = parseInt(functionsResult.rows[0].count);
    log.info(`Found: ${functionCount} functions`);
    if (functionCount >= 10) {
      log.success('Function count looks good (expected 15+)');
    } else {
      log.warning(`Expected 15+ functions, found ${functionCount}`);
    }

    // Check indexes
    console.log('\n📑 Indexes');
    const indexesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    const indexCount = parseInt(indexesResult.rows[0].count);
    log.info(`Found: ${indexCount} indexes`);
    if (indexCount >= 40) {
      log.success('Index count looks good (expected 50+)');
    }

    // Check admin user
    console.log('\n👤 Admin User');
    const adminResult = await client.query(`
      SELECT id, email, role, "isActive", "createdAt"
      FROM "User" 
      WHERE role = 'SUPER_ADMIN' 
      LIMIT 1
    `);
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      log.success(`Admin user exists: ${admin.email}`);
      log.info(`Role: ${admin.role}, Active: ${admin.isActive}`);
      log.warning('⚠️  Default password: Admin@123 - CHANGE IMMEDIATELY!');
    } else {
      log.error('Admin user not found!');
    }

    // Check system settings
    console.log('\n⚙️  System Settings');
    const settingsResult = await client.query(`
      SELECT COUNT(*) as count FROM "SystemSetting"
    `);
    const settingsCount = parseInt(settingsResult.rows[0].count);
    log.info(`Found: ${settingsCount} settings`);
    
    if (settingsCount >= 50) {
      log.success('Settings loaded successfully (expected 60+)');
    } else {
      log.warning(`Expected 60+ settings, found ${settingsCount}`);
    }

    // Sample some critical settings
    const criticalSettings = await client.query(`
      SELECT key, value 
      FROM "SystemSetting" 
      WHERE key IN ('MIN_WITHDRAWAL', 'WITHDRAWAL_FEE', 'PLATFORM_STATUS')
      ORDER BY key
    `);
    if (criticalSettings.rows.length > 0) {
      console.log('\n  Critical settings:');
      criticalSettings.rows.forEach(row => {
        console.log(`  - ${row.key}: ${row.value}`);
      });
    }

    // Check cron jobs
    console.log('\n⏰ Cron Jobs');
    const cronResult = await client.query(`
      SELECT COUNT(*) as count FROM "CronJob"
    `);
    const cronCount = parseInt(cronResult.rows[0].count);
    log.info(`Found: ${cronCount} cron jobs (expected 8)`);

    // Check platform wallets
    console.log('\n💰 Platform Wallets');
    const walletsResult = await client.query(`
      SELECT network, address, "isActive" 
      FROM "PlatformWallet" 
      ORDER BY network
    `);
    
    if (walletsResult.rows.length > 0) {
      log.info(`Found: ${walletsResult.rows.length} wallet addresses`);
      walletsResult.rows.forEach(wallet => {
        const status = wallet.isActive ? '✓' : '✗';
        console.log(`  ${status} ${wallet.network}: ${wallet.address.substring(0, 20)}...`);
      });
      log.warning('⚠️  Update these with real wallet addresses!');
    }

    // Database size
    console.log('\n💾 Database Info');
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    log.info(`Database size: ${sizeResult.rows[0].size}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    const allGood = tableCount >= 30 && functionCount >= 10 && adminResult.rows.length > 0;
    
    if (allGood) {
      log.success('✨ Database verification passed!');
      console.log('\n📋 Next Steps:');
      console.log('  1. Change admin password');
      console.log('  2. Update platform wallet addresses');
      console.log('  3. Review system settings');
      console.log('  4. Test your application\n');
    } else {
      log.warning('⚠️  Some issues found - review output above');
      console.log('\n💡 If tables are missing, try:');
      console.log('  npm run reset');
      console.log('  npm run migrate\n');
    }

  } catch (error) {
    log.error('Verification failed!');
    log.error(error.message);
    
    if (error.message.includes('does not exist')) {
      log.warning('Tables may not be created yet. Run: npm run migrate');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

verify();
