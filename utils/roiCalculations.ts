import { queryOne, query } from '@/lib/db'
import { PackageType } from '@/types'

/**
 * Get ROI percentage from database settings
 */
export async function getRoiPercentage(packageAmount: number): Promise<number> {
  try {
    const roiSetting = await queryOne<any>(
      `SELECT * FROM "RoiSettings" WHERE "packageAmount" = $1`,
      [packageAmount]
    )

    if (roiSetting && roiSetting.isActive) {
      return roiSetting.roiPercentage / 100 // Convert percentage to decimal
    }

    // Fallback to default rates if setting not found
    console.warn(`ROI setting not found for package amount ${packageAmount}, using default`)
    return getDefaultRoiRate(packageAmount)
  } catch (error) {
    console.error('Error fetching ROI percentage:', error)
    return getDefaultRoiRate(packageAmount)
  }
}

/**
 * Default ROI rates (fallback)
 */
function getDefaultRoiRate(amount: number): number {
  if (amount >= 500 && amount <= 3000) return 0.03  // 3%
  if (amount >= 5000 && amount <= 10000) return 0.04  // 4%
  if (amount >= 25000 && amount <= 50000) return 0.05  // 5%

  throw new Error('Invalid package amount')
}

/**
 * Calculate ROI amount based on package (using database settings)
 */
export async function calculateRoiFromDb(amount: number): Promise<number> {
  const roiRate = await getRoiPercentage(amount)
  return amount * roiRate
}

/**
 * Calculate ROI for specific package type (legacy support)
 */
export async function calculateRoiByPackageType(amount: number, packageType: PackageType): Promise<number> {
  return await calculateRoiFromDb(amount)
}

/**
 * Get all ROI settings for display
 */
export async function getAllRoiSettings() {
  try {
    const settings = await query<any>(
      `SELECT * FROM "RoiSettings" WHERE "isActive" = true ORDER BY "packageAmount" ASC`,
      []
    )
    return settings
  } catch (error) {
    console.error('Error fetching all ROI settings:', error)
    return []
  }
}

/**
 * Validate ROI percentage against maximum
 */
export async function validateRoiPercentage(
  packageAmount: number,
  newPercentage: number
): Promise<{ valid: boolean; error?: string; maxAllowed?: number }> {
  try {
    const setting = await queryOne<any>(
      `SELECT * FROM "RoiSettings" WHERE "packageAmount" = $1`,
      [packageAmount]
    )

    if (!setting) {
      return {
        valid: false,
        error: 'ROI setting not found for this package amount'
      }
    }

    if (newPercentage < 0) {
      return {
        valid: false,
        error: 'ROI percentage cannot be negative'
      }
    }

    if (newPercentage > setting.maxRoiPercentage) {
      return {
        valid: false,
        error: `ROI percentage cannot exceed ${setting.maxRoiPercentage}%`,
        maxAllowed: setting.maxRoiPercentage
      }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error validating ROI percentage:', error)
    return {
      valid: false,
      error: 'Failed to validate ROI percentage'
    }
  }
}
