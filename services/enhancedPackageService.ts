/**
 * Enhanced Package Service
 * Integrates the new payment gateway system with package creation
 */

import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { createPaymentRequest } from './paymentGatewayService'
import { v4 as uuidv4 } from 'uuid'

interface CreatePackageWithPaymentParams {
  userId: string
  amount: number
  network: 'BEP20' | 'TRC20'
}

/**
 * Create package with integrated payment system
 * Returns payment request with QR code instead of just package
 */
export async function createPackageWithPayment(params: CreatePackageWithPaymentParams) {
  const { userId, amount, network } = params

  // Validate amount (valid package amounts)
  const validAmounts = [500, 1000, 3000, 5000, 10000, 25000, 50000]
  if (!validAmounts.includes(amount)) {
    throw new Error(`Invalid package amount. Valid amounts: ${validAmounts.join(', ')}`)
  }

  // Determine package type based on amount
  const packageType = getPackageType(amount)
  const roiPercentage = getRoiPercentage(packageType)

  // Calculate dates
  const investmentDate = new Date()
  const expiryDate = new Date(investmentDate)
  expiryDate.setMonth(expiryDate.getMonth() + 12)

  const nextRoiDate = new Date(investmentDate)
  nextRoiDate.setDate(nextRoiDate.getDate() + 30)

  // Create package with PENDING status
  const pkg = await queryOne(
    `INSERT INTO "Package" (id, "userId", amount, "packageType", "roiPercentage", "investmentDate", "expiryDate", "nextRoiDate", network, status, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [uuidv4(), userId, amount, packageType, roiPercentage, investmentDate, expiryDate, nextRoiDate, network, 'PENDING', new Date(), new Date()]
  )

  // Create payment request with QR code
  const paymentRequest = await createPaymentRequest({
    userId,
    purpose: 'PACKAGE_PURCHASE',
    amount,
    network,
    metadata: {
      packageId: pkg.id,
      packageType,
    },
  })

  return {
    package: {
      id: pkg.id,
      amount: Number(pkg.amount),
      packageType: pkg.packageType,
      roiPercentage: Number(pkg.roiPercentage),
      status: pkg.status,
      investmentDate: pkg.investmentDate,
      expiryDate: pkg.expiryDate,
      nextRoiDate: pkg.nextRoiDate,
      network: pkg.network,
    },
    payment: paymentRequest,
  }
}

/**
 * Get package type based on amount
 */
function getPackageType(amount: number): 'NEO' | 'NEURAL' | 'ORACLE' {
  if (amount >= 500 && amount < 5000) return 'NEO'
  if (amount >= 5000 && amount < 25000) return 'NEURAL'
  return 'ORACLE'
}

/**
 * Get ROI percentage based on package type
 */
function getRoiPercentage(packageType: 'NEO' | 'NEURAL' | 'ORACLE'): number {
  const roiMap = {
    NEO: 3,
    NEURAL: 4,
    ORACLE: 5,
  }
  return roiMap[packageType]
}

/**
 * Get package with payment status
 */
export async function getPackageWithPaymentStatus(packageId: string) {
  const pkg = await queryOne(
    `SELECT * FROM "Package" WHERE id = $1`,
    [packageId]
  )

  if (!pkg) {
    throw new Error('Package not found')
  }

  // Find associated payment request
  const paymentRequest = await query(
    `SELECT * FROM "PaymentRequest"
     WHERE "userId" = $1 AND purpose = $2 AND metadata->>'packageId' = $3
     ORDER BY "createdAt" DESC
     LIMIT 1`,
    [pkg.userId, 'PACKAGE_PURCHASE', packageId]
  )

  return {
    package: {
      id: pkg.id,
      amount: Number(pkg.amount),
      packageType: pkg.packageType,
      roiPercentage: Number(pkg.roiPercentage),
      status: pkg.status,
      investmentDate: pkg.investmentDate,
      expiryDate: pkg.expiryDate,
      depositTxHash: pkg.depositTxHash,
      network: pkg.network,
    },
    paymentRequest: paymentRequest[0] || null,
  }
}

/**
 * Get user's packages with payment status
 */
export async function getUserPackagesWithPayment(userId: string) {
  const packages = await query(
    `SELECT * FROM "Package" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
    [userId]
  )

  const packagesWithPayment = await Promise.all(
    packages.map(async (pkg) => {
      // Find associated payment request
      const paymentRequest = await query(
        `SELECT * FROM "PaymentRequest"
         WHERE "userId" = $1 AND purpose = $2 AND metadata->>'packageId' = $3
         ORDER BY "createdAt" DESC
         LIMIT 1`,
        [userId, 'PACKAGE_PURCHASE', pkg.id]
      )

      return {
        id: pkg.id,
        amount: Number(pkg.amount),
        packageType: pkg.packageType,
        roiPercentage: Number(pkg.roiPercentage),
        status: pkg.status,
        investmentDate: pkg.investmentDate,
        expiryDate: pkg.expiryDate,
        totalRoiPaid: Number(pkg.totalRoiPaid),
        roiPaidCount: pkg.roiPaidCount,
        depositTxHash: pkg.depositTxHash,
        network: pkg.network,
        paymentStatus: paymentRequest[0]?.status || null,
        paymentRequestId: paymentRequest[0]?.id || null,
      }
    })
  )

  return packagesWithPayment
}

export default {
  createPackageWithPayment,
  getPackageWithPaymentStatus,
  getUserPackagesWithPayment,
}
