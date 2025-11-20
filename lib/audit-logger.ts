/**
 * Audit Logging Service
 * Tracks all security-sensitive and administrative actions
 */

import pool from '@/lib/db-connection'

export type AuditAction = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_CHANGE'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'BRUTE_FORCE_BLOCKED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED'
  | 'PACKAGE_CREATED'
  | 'PACKAGE_UPDATED'
  | 'PACKAGE_DELETED'
  | 'PACKAGE_ACTIVATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'ADMIN_ACTION'
  | 'PERMISSION_CHANGED'
  | 'SETTINGS_UPDATED'

export interface AuditLogEntry {
  userId?: string
  action: AuditAction
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

/**
 * Create audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query(
      `INSERT INTO "AuditLog" (
        "userId", 
        "action", 
        "metadata", 
        "ipAddress", 
        "userAgent", 
        "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        entry.userId || null,
        entry.action,
        JSON.stringify(entry.details || {}),
        entry.ipAddress || null,
        entry.userAgent || null
      ]
    )
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Failed to create audit log:', error)
  } finally {
    client.release()
  }
}

/**
 * Log authentication events
 */
export async function logAuthEvent(
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT',
  userId: string | undefined,
  details: Record<string, any>,
  request?: Request
): Promise<void> {
  const ipAddress = request?.headers.get('x-forwarded-for') || 
                   request?.headers.get('x-real-ip') || 
                   'unknown'
  const userAgent = request?.headers.get('user-agent') || 'unknown'

  await createAuditLog({
    userId,
    action,
    details,
    ipAddress,
    userAgent,
    severity: action === 'LOGIN_FAILED' ? 'MEDIUM' : 'LOW'
  })
}

/**
 * Log admin actions
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId: string | undefined,
  details: Record<string, any>,
  request?: Request
): Promise<void> {
  const ipAddress = request?.headers.get('x-forwarded-for') || 
                   request?.headers.get('x-real-ip') || 
                   'unknown'
  const userAgent = request?.headers.get('user-agent') || 'unknown'

  await createAuditLog({
    userId: adminId,
    action: 'ADMIN_ACTION',
    details: {
      ...details,
      targetUserId,
      adminAction: action
    },
    ipAddress,
    userAgent,
    severity: 'HIGH'
  })
}

/**
 * Log payment events
 */
export async function logPaymentEvent(
  action: 'PAYMENT_RECEIVED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_FAILED',
  userId: string | undefined,
  details: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    details,
    severity: action === 'PAYMENT_FAILED' ? 'MEDIUM' : 'LOW'
  })
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  action: AuditAction,
  userId: string | undefined,
  details: Record<string, any>,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    details,
    severity
  })
}

/**
 * Query audit logs (admin only)
 */
export async function getAuditLogs(filters: {
  userId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  severity?: string
  limit?: number
  offset?: number
}): Promise<any[]> {
  const client = await pool.connect()
  try {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.userId) {
      conditions.push(`"userId" = $${paramIndex++}`)
      params.push(filters.userId)
    }

    if (filters.action) {
      conditions.push(`action = $${paramIndex++}`)
      params.push(filters.action)
    }

    if (filters.startDate) {
      conditions.push(`"createdAt" >= $${paramIndex++}`)
      params.push(filters.startDate)
    }

    if (filters.endDate) {
      conditions.push(`"createdAt" <= $${paramIndex++}`)
      params.push(filters.endDate)
    }

    if (filters.severity) {
      conditions.push(`severity = $${paramIndex++}`)
      params.push(filters.severity)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = filters.limit || 100
    const offset = filters.offset || 0

    params.push(limit)
    params.push(offset)

    const result = await client.query(
      `SELECT * FROM "AuditLog" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    )

    return result.rows
  } catch (error) {
    console.error('Failed to query audit logs:', error)
    return []
  } finally {
    client.release()
  }
}

/**
 * Initialize audit logs table (run this once during deployment)
 * NOTE: This is not needed if you run the NEONDB_SECURITY_MIGRATION.sql
 */
export async function initializeAuditLogsTable(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT,
        severity VARCHAR(20) DEFAULT 'LOW',
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON "AuditLog"("userId")
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_action ON "AuditLog"(action)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON "AuditLog"("createdAt")
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_severity ON "AuditLog"(severity)
    `)

    console.log('✓ Audit logs table initialized successfully')
  } catch (error) {
    console.error('Failed to initialize audit logs table:', error)
  } finally {
    client.release()
  }
}
