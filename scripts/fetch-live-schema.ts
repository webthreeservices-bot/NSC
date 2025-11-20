/**
 * Fetch Live Database Schema from Neon
 *
 * This script connects to your live Neon database and fetches:
 * 1. All enum types and their values
 * 2. BotActivation table structure
 * 3. Package table structure
 * 4. All trigger functions related to bot activation
 *
 * Run with: npx ts-node scripts/fetch-live-schema.ts
 */

import pool from '../lib/db-connection'

async function fetchEnumTypes() {
  console.log('\n📋 FETCHING ENUM TYPES FROM LIVE DATABASE\n')
  console.log('='.repeat(80))

  const query = `
    SELECT
      t.typname as enum_name,
      string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname;
  `

  try {
    const result = await pool.query(query)

    console.log('\n✅ Found', result.rows.length, 'enum types:\n')

    result.rows.forEach((row: any) => {
      console.log(`📌 ${row.enum_name}`)
      console.log(`   Values: ${row.enum_values}`)
      console.log('')
    })

    return result.rows
  } catch (error: any) {
    console.error('❌ Error fetching enum types:', error.message)
    throw error
  }
}

async function fetchTableStructure(tableName: string) {
  console.log(`\n📊 FETCHING ${tableName.toUpperCase()} TABLE STRUCTURE\n`)
  console.log('='.repeat(80))

  const query = `
    SELECT
      column_name,
      data_type,
      udt_name,
      column_default,
      is_nullable,
      character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    ORDER BY ordinal_position;
  `

  try {
    const result = await pool.query(query, [tableName])

    if (result.rows.length === 0) {
      console.log(`⚠️  Table "${tableName}" not found in database!`)
      return []
    }

    console.log(`\n✅ Found ${result.rows.length} columns:\n`)

    result.rows.forEach((col: any) => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
      const type = col.udt_name === 'USER-DEFINED' ? col.data_type : col.udt_name
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''

      console.log(`   ${col.column_name.padEnd(25)} ${type.padEnd(20)} ${nullable}${defaultVal}`)
    })

    console.log('')
    return result.rows
  } catch (error: any) {
    console.error(`❌ Error fetching ${tableName} structure:`, error.message)
    throw error
  }
}

async function fetchTriggerFunctions() {
  console.log('\n⚙️  FETCHING TRIGGER FUNCTIONS\n')
  console.log('='.repeat(80))

  const query = `
    SELECT
      p.proname as function_name,
      pg_get_functiondef(p.oid) as function_definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname LIKE '%bot%'
    ORDER BY p.proname;
  `

  try {
    const result = await pool.query(query)

    console.log(`\n✅ Found ${result.rows.length} bot-related trigger functions:\n`)

    result.rows.forEach((func: any) => {
      console.log(`📌 Function: ${func.function_name}`)
      console.log('─'.repeat(80))
      console.log(func.function_definition)
      console.log('\n')
    })

    return result.rows
  } catch (error: any) {
    console.error('❌ Error fetching trigger functions:', error.message)
    throw error
  }
}

async function fetchBotActivationData() {
  console.log('\n📦 FETCHING SAMPLE BOT ACTIVATION DATA\n')
  console.log('='.repeat(80))

  const query = `
    SELECT *
    FROM "BotActivation"
    ORDER BY "createdAt" DESC
    LIMIT 3;
  `

  try {
    const result = await pool.query(query)

    if (result.rows.length === 0) {
      console.log('⚠️  No bot activations found in database')
      return []
    }

    console.log(`\n✅ Found ${result.rows.length} sample records:\n`)

    result.rows.forEach((bot: any, index: number) => {
      console.log(`Record ${index + 1}:`)
      Object.keys(bot).forEach(key => {
        console.log(`   ${key.padEnd(25)}: ${bot[key]}`)
      })
      console.log('')
    })

    return result.rows
  } catch (error: any) {
    console.error('❌ Error fetching bot activation data:', error.message)
    throw error
  }
}

async function checkBotStatusEnum() {
  console.log('\n🔍 CHECKING BotStatus ENUM SPECIFICALLY\n')
  console.log('='.repeat(80))

  const query = `
    SELECT e.enumlabel as value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'BotStatus'
    ORDER BY e.enumsortorder;
  `

  try {
    const result = await pool.query(query)

    if (result.rows.length === 0) {
      console.log('⚠️  BotStatus enum not found!')
      return []
    }

    console.log('\n✅ BotStatus enum values:')
    const values = result.rows.map((row: any) => row.value)
    console.log('   ', values.join(', '))

    // Check if PENDING is in the enum
    if (values.includes('PENDING')) {
      console.log('\n✅ PENDING is a valid BotStatus value')
    } else {
      console.log('\n❌ PENDING is NOT in BotStatus enum - THIS IS THE PROBLEM!')
    }

    console.log('')
    return values
  } catch (error: any) {
    console.error('❌ Error checking BotStatus enum:', error.message)
    throw error
  }
}

async function main() {
  console.log('\n🚀 LIVE DATABASE SCHEMA ANALYZER')
  console.log('='.repeat(80))
  console.log('Connecting to Neon database...\n')

  try {
    // Fetch all information
    await checkBotStatusEnum()
    await fetchEnumTypes()
    await fetchTableStructure('BotActivation')
    await fetchTableStructure('Package')
    await fetchTableStructure('User')
    await fetchTriggerFunctions()
    await fetchBotActivationData()

    console.log('\n✅ SCHEMA ANALYSIS COMPLETE!')
    console.log('='.repeat(80))
    console.log('\nNext steps:')
    console.log('1. Review the BotStatus enum values above')
    console.log('2. Check if PENDING exists in the enum')
    console.log('3. Review trigger functions for any references to invalid enum values')
    console.log('4. Compare BotActivation table columns with your code expectations\n')

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message)
    console.error('Stack trace:', error.stack)
  } finally {
    // Close the pool
    await pool.end()
    console.log('\n🔌 Database connection closed\n')
    process.exit(0)
  }
}

// Run the script
main()
