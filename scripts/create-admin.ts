import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

// Read database URL from .env
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL is not defined')
  process.exit(1)
}

// Create database pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
})

// Read and execute SQL file
async function executeSql() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), 'create-admin-user.sql'), 'utf8')
    await pool.query(sql)
    console.log('Admin user created successfully')
  } catch (error) {
    console.error('Error executing SQL:', error)
  } finally {
    await pool.end()
  }
}

executeSql()