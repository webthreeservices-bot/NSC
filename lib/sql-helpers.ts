/**
 * SQL Query Builder - Makes direct SQL queries easier
 * Use these helpers to write direct SQL queries easily
 */

import { query, queryOne, execute, toCamelCase } from './db'

/**
 * SELECT queries made easy
 */
export const sql = {
  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    return queryOne(
      'SELECT * FROM "User" WHERE "id" = $1',
      [userId]
    ).then(u => u ? toCamelCase(u) : null)
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return queryOne(
      'SELECT * FROM "User" WHERE "email" = $1',
      [email.toLowerCase()]
    ).then(u => u ? toCamelCase(u) : null)
  },

  /**
   * Get package by ID
   */
  async getPackageById(packageId: string) {
    return queryOne(
      'SELECT * FROM "Package" WHERE "id" = $1',
      [packageId]
    ).then(p => p ? toCamelCase(p) : null)
  },

  /**
   * Get user's packages
   */
  async getUserPackages(userId: string) {
    return query(
      'SELECT * FROM "Package" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    ).then(p => p.map(pkg => toCamelCase(pkg)))
  },

  /**
   * Count user's active packages
   */
  async countActivePackages(userId: string) {
    const result = await queryOne<any>(
      'SELECT COUNT(*) as count FROM "Package" WHERE "userId" = $1 AND "status" = $2',
      [userId, 'ACTIVE']
    )
    return result ? parseInt(result.count) : 0
  },

  /**
   * Get all transactions for user
   */
  async getUserTransactions(userId: string, limit: number = 50) {
    return query(
      'SELECT * FROM "Transaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2',
      [userId, limit]
    ).then(t => t.map(tx => toCamelCase(tx)))
  },

  /**
   * Get withdrawal requests for user
   */
  async getUserWithdrawals(userId: string) {
    return query(
      'SELECT * FROM "Withdrawal" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    ).then(w => w.map(wd => toCamelCase(wd)))
  },

  /**
   * Get pending withdrawals (admin)
   */
  async getPendingWithdrawals() {
    return query(
      'SELECT * FROM "Withdrawal" WHERE "status" = $1 ORDER BY "createdAt" ASC',
      ['PENDING']
    ).then(w => w.map(wd => toCamelCase(wd)))
  },

  /**
   * Get ROI settings
   */
  async getRoiSettings() {
    return query(
      'SELECT * FROM "RoiSettings" ORDER BY "packageType" ASC',
      []
    ).then(r => r.map(s => toCamelCase(s)))
  },

  /**
   * Get admin user
   */
  async getAdminUser(email: string) {
    return queryOne(
      'SELECT * FROM "User" WHERE "email" = $1 AND "isAdmin" = $2',
      [email.toLowerCase(), true]
    ).then(u => u ? toCamelCase(u) : null)
  },

  /**
   * Get all users (admin)
   */
  async getAllUsers(limit: number = 1000, offset: number = 0) {
    return query(
      'SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    ).then(u => u.map(usr => toCamelCase(usr)))
  },

  /**
   * Count all users
   */
  async countAllUsers() {
    const result = await queryOne<any>(
      'SELECT COUNT(*) as count FROM "User"',
      []
    )
    return result ? parseInt(result.count) : 0
  },

  /**
   * Get payment requests pending
   */
  async getPendingPaymentRequests() {
    return query(
      'SELECT * FROM "PaymentRequest" WHERE "status" = $1 ORDER BY "createdAt" ASC',
      ['PENDING']
    ).then(p => p.map(pr => toCamelCase(pr)))
  },

  /**
   * Get payment request by ID
   */
  async getPaymentRequestById(id: string) {
    return queryOne(
      'SELECT * FROM "PaymentRequest" WHERE "id" = $1',
      [id]
    ).then(p => p ? toCamelCase(p) : null)
  },

  /**
   * Get referral earnings
   */
  async getReferralEarnings(userId: string) {
    return query(
      'SELECT * FROM "Earning" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    ).then(e => e.map(earning => toCamelCase(earning)))
  },

  /**
   * Get bot activation
   */
  async getBotActivation(userId: string) {
    return queryOne(
      'SELECT * FROM "BotActivation" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
      [userId]
    ).then(b => b ? toCamelCase(b) : null)
  },

  /**
   * Get all bot activations
   */
  async getAllBotActivations() {
    return query(
      'SELECT * FROM "BotActivation" ORDER BY "createdAt" DESC',
      []
    ).then(b => b.map(bot => toCamelCase(bot)))
  },
}

/**
 * UPDATE/INSERT/DELETE queries made easy
 */
export const sqlMutate = {
  /**
   * Update user
   */
  async updateUser(userId: string, data: any) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')
    values.push(userId)
    
    return queryOne(
      `UPDATE "User" SET ${setClause} WHERE "id" = $${keys.length + 1} RETURNING *`,
      values
    ).then(u => u ? toCamelCase(u) : null)
  },

  /**
   * Update package
   */
  async updatePackage(packageId: string, data: any) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')
    values.push(packageId)
    
    return queryOne(
      `UPDATE "Package" SET ${setClause} WHERE "id" = $${keys.length + 1} RETURNING *`,
      values
    ).then(p => p ? toCamelCase(p) : null)
  },

  /**
   * Update withdrawal
   */
  async updateWithdrawal(withdrawalId: string, data: any) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')
    values.push(withdrawalId)
    
    return queryOne(
      `UPDATE "Withdrawal" SET ${setClause} WHERE "id" = $${keys.length + 1} RETURNING *`,
      values
    ).then(w => w ? toCamelCase(w) : null)
  },

  /**
   * Update payment request
   */
  async updatePaymentRequest(id: string, data: any) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')
    values.push(id)
    
    return queryOne(
      `UPDATE "PaymentRequest" SET ${setClause} WHERE "id" = $${keys.length + 1} RETURNING *`,
      values
    ).then(p => p ? toCamelCase(p) : null)
  },

  /**
   * Create transaction
   */
  async createTransaction(data: any) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
    const keyString = keys.map(k => `"${k}"`).join(', ')
    
    return queryOne(
      `INSERT INTO "Transaction" (${keyString}) VALUES (${placeholders}) RETURNING *`,
      values
    ).then(t => t ? toCamelCase(t) : null)
  },

  /**
   * Delete user by ID
   */
  async deleteUser(userId: string) {
    return execute(
      'DELETE FROM "User" WHERE "id" = $1',
      [userId]
    )
  },
}

export default { sql, sqlMutate }
