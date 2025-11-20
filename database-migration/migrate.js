require('dotenv').config();
const { Client } = require('@neondatabase/serverless');
const chalk = require('chalk');

// Import all migration SQL
const migrations = require('./migrations');

// Color helpers
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  step: (num, total, msg) => console.log(chalk.cyan(`[${num}/${total}]`), msg),
};

async function runMigration() {
  const startTime = Date.now();
  
  console.log(chalk.bold.blue('\n🚀 NSC Bot Platform - Database Migration\n'));
  console.log('='.repeat(60));
  
  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL not found in environment variables');
    log.info('Please create a .env file with your NeonDB connection string');
    log.info('Example: DATABASE_URL=postgresql://user:pass@host.neon.tech/db');
    process.exit(1);
  }
  
  log.info(`Connecting to database...`);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    log.success('Connected to NeonDB successfully\n');
    
    const totalSteps = migrations.length;
    let completedSteps = 0;
    
    // Execute each migration in order
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      const stepNum = i + 1;
      
      console.log('─'.repeat(60));
      log.step(stepNum, totalSteps, `Executing: ${chalk.bold(migration.name)}`);
      log.info(`Description: ${migration.description}`);
      
      try {
        await client.query(migration.sql);
        completedSteps++;
        log.success(`${migration.name} completed successfully`);
      } catch (error) {
        log.error(`Failed to execute ${migration.name}`);
        log.error(`Error: ${error.message}`);
        
        // Show where the error occurred
        if (error.position) {
          const lines = migration.sql.split('\n');
          const errorLine = parseInt(error.position) / 100; // Approximate
          log.warning(`Check around line ${Math.floor(errorLine)} in the SQL`);
        }
        
        throw error;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    log.success(`All migrations completed successfully! (${completedSteps}/${totalSteps})`);
    
    // Run verification
    console.log('\n' + chalk.bold.yellow('🔍 Verifying installation...\n'));
    await verifyInstallation(client);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(60));
    log.success(`Migration completed in ${duration}s`);
    console.log(chalk.bold.green('\n✨ Database is ready to use!\n'));
    
    // Show next steps
    console.log(chalk.bold.yellow('📋 Next Steps:'));
    console.log('  1. Change admin password (default: Admin@123)');
    console.log('  2. Update platform wallet addresses in PlatformWallet table');
    console.log('  3. Configure SystemSetting values');
    console.log('  4. Test the application\n');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log.error('Migration failed!');
    log.error(error.message);
    
    if (error.code) {
      log.warning(`Error Code: ${error.code}`);
    }
    
    console.log('\n' + chalk.yellow('💡 Troubleshooting:'));
    console.log('  - Check your DATABASE_URL is correct');
    console.log('  - Ensure you have CREATE TABLE permissions');
    console.log('  - Try running: node reset.js (to drop all tables and retry)');
    console.log('  - Check NeonDB dashboard for connection issues\n');
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function verifyInstallation(client) {
  try {
    // Count tables
    const tablesResult = await client.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tableCount = parseInt(tablesResult.rows[0].count);
    log.info(`Tables created: ${tableCount}`);
    
    if (tableCount < 30) {
      log.warning('Expected 35+ tables, some may be missing');
    } else {
      log.success('Table count looks good');
    }
    
    // Count functions
    const functionsResult = await client.query(
      "SELECT COUNT(*) as count FROM information_schema.routines WHERE routine_schema = 'public'"
    );
    const functionCount = parseInt(functionsResult.rows[0].count);
    log.info(`Functions created: ${functionCount}`);
    
    // Check admin user
    const adminResult = await client.query(
      `SELECT email, role FROM "User" WHERE role = 'SUPER_ADMIN' LIMIT 1`
    );
    if (adminResult.rows.length > 0) {
      log.success(`Admin user created: ${adminResult.rows[0].email}`);
    } else {
      log.warning('Admin user not found');
    }
    
    // Check system settings
    const settingsResult = await client.query(
      `SELECT COUNT(*) as count FROM "SystemSetting"`
    );
    const settingsCount = parseInt(settingsResult.rows[0].count);
    log.info(`System settings: ${settingsCount}`);
    
    if (settingsCount < 50) {
      log.warning('Expected 60+ settings, some may be missing');
    } else {
      log.success('System settings loaded');
    }
    
  } catch (error) {
    log.warning('Verification encountered issues (this may be normal if migration is incomplete)');
    console.log('  ', error.message);
  }
}

// Run migration
runMigration();
