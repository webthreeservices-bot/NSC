import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"

export const dynamic = 'force-dynamic'

/**
 * Health Check Endpoint
 * 
 * @route GET /api/health
 * @access Public (System/Monitoring Only)
 * @description System health monitoring endpoint for infrastructure/DevOps monitoring.
 *              NOT called by frontend. Used by:
 *              - Vercel/hosting platform health checks
 *              - External uptime monitors (UptimeRobot, Pingdom, etc.)
 *              - Load balancers
 *              - CI/CD health verification
 * 
 * @returns {Object} Health status including database, memory, and environment checks
 * 
 * @example
 * // Example response (200 OK):
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-11-05T10:30:00.000Z",
 *   "version": "1.0.0",
 *   "checks": {
 *     "database": { "status": "connected" },
 *     "environment": { "status": "ok" }
 *   }
 * }
 * 
 * @example
 * // Example response (503 Service Unavailable):
 * {
 *   "status": "unhealthy",
 *   "error": "Database connection failed",
 *   "checks": { "database": { "status": "disconnected" } }
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    await query(`SELECT 1`)
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NEXT_PUBLIC_APP_URL'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: 'connected',
          responseTime: `${responseTime}ms`
        },
        environment: {
          status: missingEnvVars.length === 0 ? 'ok' : 'warning',
          missing: missingEnvVars
        },
        memory: {
          usage: process.memoryUsage(),
          free: Math.round((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      }
    }

    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown database error'
        }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

