#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const SQL_SCHEMA_PATH = join(process.cwd(), 'SQL', 'schema.SQL')
const MIGRATIONS_DIR = join(process.cwd(), 'SQL', 'migrations')

function runCommand(command: string, description: string) {
  console.log(`\n🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed successfully`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error)
    process.exit(1)
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...')
  
  if (!existsSync(SQL_SCHEMA_PATH)) {
    console.error('❌ SQL schema not found at:', SQL_SCHEMA_PATH)
    process.exit(1)
  }
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set')
    process.exit(1)
  }
  
  console.log('✅ Prerequisites check passed')
}

function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('🚀 NSC Bot Platform - Database Migration Tool')
  console.log('=' .repeat(50))

  checkPrerequisites()

  switch (command) {
    case 'init':
      console.log('\n📦 Initializing database...')
      runCommand('npx SQL generate', 'Generating SQL Client')
      runCommand('npx SQL db push', 'Pushing schema to database')
      runCommand('npm run db:seed', 'Seeding database with initial data')
      console.log('\n🎉 Database initialization completed!')
      break

    case 'migrate':
      const migrationName = args[1] || `migration_${Date.now()}`
      runCommand('npx SQL generate', 'Generating SQL Client')
      runCommand(`npx SQL migrate dev --name ${migrationName}`, 'Creating and applying migration')
      console.log('\n🎉 Migration completed!')
      break

    case 'deploy':
      console.log('\n🚀 Deploying migrations to production...')
      runCommand('npx SQL generate', 'Generating SQL Client')
      runCommand('npx SQL migrate deploy', 'Deploying migrations')
      console.log('\n🎉 Production deployment completed!')
      break

    case 'reset':
      console.log('\n⚠️  Resetting database (THIS WILL DELETE ALL DATA)...')
      console.log('Press Ctrl+C within 5 seconds to cancel...')
      
      // Wait 5 seconds
      for (let i = 5; i > 0; i--) {
        process.stdout.write(`\r${i}... `)
        execSync('sleep 1', { stdio: 'ignore' })
      }
      
      runCommand('npx SQL migrate reset --force', 'Resetting database')
      runCommand('npm run db:seed', 'Seeding database with initial data')
      console.log('\n🎉 Database reset completed!')
      break

    case 'seed':
      runCommand('npm run db:seed', 'Seeding database')
      console.log('\n🎉 Database seeding completed!')
      break

    case 'studio':
      console.log('\n🎨 Opening SQL Studio...')
      runCommand('npx SQL studio', 'Starting SQL Studio')
      break

    case 'status':
      console.log('\n📊 Database status:')
      runCommand('npx SQL migrate status', 'Checking migration status')
      break

    case 'generate':
      runCommand('npx SQL generate', 'Generating SQL Client')
      break

    default:
      console.log(`
📖 Usage: npm run migrate <command>

Available commands:
  init      - Initialize database (generate + push + seed)
  migrate   - Create and apply new migration
  deploy    - Deploy migrations to production
  reset     - Reset database (⚠️  DESTRUCTIVE)
  seed      - Seed database with initial data
  studio    - Open SQL Studio
  status    - Check migration status
  generate  - Generate SQL Client

Examples:
  npm run migrate init
  npm run migrate migrate add_user_preferences
  npm run migrate deploy
  npm run migrate reset
  npm run migrate seed
  npm run migrate studio
`)
      break
  }
}

if (require.main === module) {
  main()
}
