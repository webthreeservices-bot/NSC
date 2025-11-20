require('dotenv').config();
const { Client } = require('@neondatabase/serverless');
const readline = require('readline');

const log = {
  info: (msg) => console.log('ℹ️ ', msg),
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.log('❌', msg),
  warning: (msg) => console.log('⚠️ ', msg),
};

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function reset() {
  console.log('\n🗑️  Database Reset\n');
  console.log('='.repeat(60));
  log.warning('THIS WILL DELETE ALL DATA IN YOUR DATABASE!');
  log.warning('This action CANNOT be undone!');
  console.log('='.repeat(60));
  
  const answer = await askQuestion('\nType "RESET" to confirm: ');
  
  if (answer.trim().toUpperCase() !== 'RESET') {
    log.info('Reset cancelled');
    process.exit(0);
  }

  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL not found in .env file');
    process.exit(1);
  }

  log.info('Connecting to database...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    log.success('Connected\n');

    console.log('Dropping all tables and types...\n');

    // Drop all views first
    log.info('Dropping views...');
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP VIEW IF EXISTS "' || r.viewname || '" CASCADE';
        END LOOP;
        FOR r IN (SELECT matviewname FROM pg_matviews WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS "' || r.matviewname || '" CASCADE';
        END LOOP;
      END $$;
    `);
    log.success('Views dropped');

    // Drop all tables
    log.info('Dropping tables...');
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
        END LOOP;
      END $$;
    `);
    log.success('Tables dropped');

    // Drop all functions (skip extension functions)
    log.info('Dropping functions...');
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (
          SELECT p.proname, oidvectortypes(p.proargtypes) as argtypes
          FROM pg_proc p
          INNER JOIN pg_namespace n ON p.pronamespace = n.oid
          LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
          WHERE n.nspname = 'public' 
          AND d.objid IS NULL  -- Exclude extension functions
        ) LOOP
          EXECUTE 'DROP FUNCTION IF EXISTS ' || r.proname || '(' || r.argtypes || ') CASCADE';
        END LOOP;
      END $$;
    `);
    log.success('Functions dropped');

    // Drop all sequences
    log.info('Dropping sequences...');
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS "' || r.sequencename || '" CASCADE';
        END LOOP;
      END $$;
    `);
    log.success('Sequences dropped');

    // Drop all types (ENUMs)
    log.info('Dropping custom types...');
    await client.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type
                  INNER JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid
                  WHERE pg_namespace.nspname = 'public' AND typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
        END LOOP;
      END $$;
    `);
    log.success('Custom types dropped');

    console.log('\n' + '='.repeat(60));
    log.success('Database reset completed!');
    console.log('\nDatabase is now empty. Run migration to recreate:');
    console.log('  npm run migrate\n');

  } catch (error) {
    log.error('Reset failed!');
    log.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

reset();
