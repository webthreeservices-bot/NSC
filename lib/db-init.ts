/**
 * ⚠️ THIS FILE IS DEPRECATED AND DISABLED
 *
 * REASON: Contains dangerous process.exit(-1) that crashes the entire server
 *
 * USE: lib/db-connection.ts instead
 *
 * This file is kept for backward compatibility but does not export a working pool
 */

// Re-export from the correct db-connection file
export { default, testConnection, warmupConnection, getClientWithTimeout, queryWithTimeout } from './db-connection'

console.warn('⚠️  WARNING: lib/db-init.ts is deprecated. Please use lib/db-connection.ts directly')
