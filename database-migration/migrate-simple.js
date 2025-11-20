require('dotenv').config();
const { Client } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const log = {
  info: (msg) => console.log('ℹ️ ', msg),
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.log('❌', msg),
  warning: (msg) => console.log('⚠️ ', msg),
};

async function migrate() {
  console.log('\n🚀 NSC Bot Platform - Database Migration\n');
  console.log('='.repeat(60));

  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL not found!');
    log.info('Create a .env file with: DATABASE_URL=postgresql://...');
    process.exit(1);
  }

  log.info('Connecting to NeonDB...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    log.success('Connected to NeonDB\n');

    // SQL files to execute in order
    const sqlFiles = [
      '../database-schema/01_enums.sql',
      '../database-schema/02_core_tables.sql',
      '../database-schema/03_financial_tables.sql',
      '../database-schema/04_system_tables.sql',
      '../database-schema/05_functions.sql',
      '../database-schema/06_triggers.sql',
      '../database-schema/07_views.sql',
      '../database-schema/08_initial_data.sql',
      '../database-schema/09_indexes_optimization.sql',
    ];

    for (let i = 0; i < sqlFiles.length; i++) {
      const fileName = sqlFiles[i];
      const stepNum = i + 1;
      const filePath = path.join(__dirname, fileName);

      console.log(`\n[${stepNum}/${sqlFiles.length}] ${path.basename(fileName)}`);
      console.log('─'.repeat(60));

      if (!fs.existsSync(filePath)) {
        log.error(`File not found: ${filePath}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      log.info(`Executing ${sql.length} characters of SQL...`);

      try {
        await client.query(sql);
        log.success(`Completed successfully`);
      } catch (error) {
        log.error(`Failed: ${error.message}`);
        
        // Continue with other files even if one fails
        if (error.message.includes('already exists')) {
          log.warning('Some objects already exist, continuing...');
        } else {
          throw error;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    log.success('Migration completed!');
    
    // Verify
    console.log('\n🔍 Verifying installation...\n');
    await verify(client);

    console.log('\n✨ Database is ready!\n');
    console.log('📋 Next Steps:');
    console.log('  1. Change admin password (admin@nscbot.com / Admin@123)');
    console.log('  2. Update platform wallet addresses');
    console.log('  3. Configure system settings\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log.error('Migration failed!');
    log.error(error.message);
    console.log('\n💡 Try: npm run reset (then migrate again)\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function verify(client) {
  try {
    const tables = await client.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
    );
    log.info(`Tables: ${tables.rows[0].count}`);

    const functions = await client.query(
      "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'"
    );
    log.info(`Functions: ${functions.rows[0].count}`);

    const admin = await client.query(
      `SELECT email FROM "User" WHERE role = 'SUPER_ADMIN' LIMIT 1`
    );
    if (admin.rows.length > 0) {
      log.success(`Admin user: ${admin.rows[0].email}`);
    }

    const settings = await client.query(`SELECT COUNT(*) FROM "SystemSetting"`);
    log.info(`Settings: ${settings.rows[0].count}`);

  } catch (error) {
    log.warning('Verification incomplete (this is normal if migration is partial)');
  }
}

migrate();
