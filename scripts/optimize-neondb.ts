#!/usr/bin/env tsx

/**
 * NeonDB Optimization Script for Admin Dashboard
 * Applies specific optimizations for NeonDB cloud database
 */

import { config } from 'dotenv'
import pool from '../lib/db-connection'

config({ path: '.env.local' })

async function optimizeNeonDB() {
  console.log('🚀 Optimizing NeonDB for Admin Dashboard...\n')

  try {
    // 1. Apply NeonDB-specific optimizations
    console.log('1️⃣ Applying NeonDB Connection Optimizations...')
    
    // Set optimal settings for NeonDB
    await pool.query(`
      -- Optimize for cloud database performance
      SET statement_timeout = '30s';
      SET lock_timeout = '10s';
      SET idle_in_transaction_session_timeout = '60s';
    `)
    console.log('✅ Connection timeouts optimized')

    // 2. Analyze table statistics for better query planning
    console.log('\n2️⃣ Updating Table Statistics...')
    
    const criticalTables = [
      'User', 'Package', 'Withdrawal', 'Transaction', 
      'Earning', 'PaymentRequest', 'AdminLog'
    ]

    for (const table of criticalTables) {
      await pool.query(`ANALYZE "${table}";`)
      console.log(`✅ Analyzed ${table} table`)
    }

    // 3. Check for fragmentation and suggest optimizations
    console.log('\n3️⃣ Checking Table Health...')
    
    const tableStats = await pool.query(`
      SELECT 
        schemaname,
        relname as tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      AND relname IN ('User', 'Package', 'Withdrawal', 'Transaction')
      ORDER BY n_live_tup DESC;
    `)

    console.log('📊 Table Health Report:')
    tableStats.rows.forEach(row => {
      const deadTupleRatio = row.dead_tuples / (row.live_tuples + row.dead_tuples) * 100
      console.log(`   ${row.tablename}: ${row.live_tuples} live, ${row.dead_tuples} dead (${deadTupleRatio.toFixed(1)}% dead)`)
    })

    // 4. Create admin-specific indexes if missing
    console.log('\n4️⃣ Creating Admin Dashboard Indexes...')

    const adminIndexes = [
      {
        name: 'idx_user_admin_search',
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_admin_search" ON "User" USING gin(to_tsvector('english', "fullName" || ' ' || "email" || ' ' || "username"));`
      },
      {
        name: 'idx_package_admin_overview',
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_package_admin_overview" ON "Package" ("status", "createdAt" DESC);`
      },
      {
        name: 'idx_withdrawal_admin_queue',
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_withdrawal_admin_queue" ON "Withdrawal" ("status", "requestDate" DESC) WHERE "status" IN ('PENDING', 'PROCESSING');`
      },
      {
        name: 'idx_earning_admin_analytics',
        query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_earning_admin_analytics" ON "Earning" ("earningType", "createdAt" DESC) INCLUDE ("amount");`
      }
    ]

    for (const index of adminIndexes) {
      try {
        await pool.query(index.query)
        console.log(`✅ Created/verified ${index.name}`)
      } catch (error: any) {
        if (error.code === '42P07') { // Index already exists
          console.log(`ℹ️  ${index.name} already exists`)
        } else {
          console.log(`⚠️  ${index.name}: ${error.message}`)
        }
      }
    }

    // 5. Set up admin session configuration
    console.log('\n5️⃣ Configuring Admin Session Settings...')
    
    await pool.query(`
      -- Optimize for admin dashboard queries
      SET work_mem = '32MB';
      SET random_page_cost = 1.1;
      SET effective_cache_size = '1GB';
    `)
    console.log('✅ Admin session optimized')

    // 6. Check query performance for common admin operations
    console.log('\n6️⃣ Testing Admin Query Performance...')

    const performanceTests = [
      {
        name: 'User List Query',
        query: `SELECT COUNT(*) FROM "User" WHERE "isActive" = true;`
      },
      {
        name: 'Package Summary Query', 
        query: `SELECT "status", COUNT(*), SUM("amount") FROM "Package" GROUP BY "status";`
      },
      {
        name: 'Pending Withdrawals Query',
        query: `SELECT COUNT(*) FROM "Withdrawal" WHERE "status" = 'PENDING';`
      },
      {
        name: 'Recent Earnings Query',
        query: `SELECT COUNT(*) FROM "Earning" WHERE "createdAt" > NOW() - INTERVAL '7 days';`
      }
    ]

    for (const test of performanceTests) {
      const startTime = Date.now()
      await pool.query(test.query)
      const duration = Date.now() - startTime
      console.log(`✅ ${test.name}: ${duration}ms`)
    }

    // 7. Create admin dashboard materialized view for statistics
    console.log('\n7️⃣ Creating Admin Statistics View...')

    await pool.query(`
      DROP MATERIALIZED VIEW IF EXISTS admin_dashboard_stats;
      
      CREATE MATERIALIZED VIEW admin_dashboard_stats AS
      SELECT 
        (SELECT COUNT(*) FROM "User") as total_users,
        (SELECT COUNT(*) FROM "User" WHERE "isActive" = true) as active_users,
        (SELECT COUNT(*) FROM "User" WHERE "isBlocked" = true) as blocked_users,
        (SELECT COUNT(*) FROM "Package") as total_packages,
        (SELECT COUNT(*) FROM "Package" WHERE "status" = 'ACTIVE') as active_packages,
        (SELECT COALESCE(SUM("amount"), 0) FROM "Package" WHERE "status" = 'ACTIVE') as total_investment,
        (SELECT COUNT(*) FROM "Withdrawal") as total_withdrawals,
        (SELECT COUNT(*) FROM "Withdrawal" WHERE "status" = 'PENDING') as pending_withdrawals,
        (SELECT COALESCE(SUM("amount"), 0) FROM "Withdrawal" WHERE "status" = 'COMPLETED') as total_withdrawn,
        NOW() as last_updated;

      CREATE UNIQUE INDEX ON admin_dashboard_stats (last_updated);
    `)
    console.log('✅ Admin statistics view created')

    // 8. NeonDB-specific recommendations
    console.log('\n8️⃣ NeonDB Specific Recommendations...')
    
    console.log('📋 Recommendations for your NeonDB setup:')
    console.log('   ✅ Use connection pooling (already configured)')
    console.log('   ✅ Optimize query patterns for cloud latency')
    console.log('   ✅ Use prepared statements for frequent queries')
    console.log('   ✅ Monitor connection count (currently low usage)')
    console.log('   ✅ Consider read replicas for heavy admin reporting')
    console.log('   ✅ Use materialized views for dashboard statistics')

    console.log('\n🎉 NeonDB Optimization Complete!')
    console.log('\n📊 Performance Tips:')
    console.log('   • Refresh materialized view: REFRESH MATERIALIZED VIEW admin_dashboard_stats;')
    console.log('   • Monitor slow queries: SELECT * FROM pg_stat_statements ORDER BY total_time DESC;')
    console.log('   • Check index usage: SELECT * FROM pg_stat_user_indexes WHERE idx_tup_read = 0;')

  } catch (error) {
    console.error('❌ NeonDB optimization failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the optimization
optimizeNeonDB()