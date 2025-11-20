import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryScalar, execute, transaction } from "@/lib/db"
import { verifyAuth } from '@/middleware/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.userId

    // Get user's referral code
    const user = await queryOne(
      `SELECT "referralCode" FROM "User" WHERE id = $1`,
      [userId]
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find direct referrals (users who used this user's referral code)
    const directReferrals = await query(
      `SELECT id, "fullName", email, "createdAt", "referralCode" FROM "User" WHERE "referredBy" = $1`,
      [user.referralCode]
    )

    // Get earnings from direct referrals
    const directEarnings = await query(
      `SELECT amount, "fromUserId", "createdAt" FROM "Earning" WHERE "userId" = $1 AND "earningType" = $2`,
      [userId, 'DIRECT_REFERRAL']
    )

    // Get level income earnings
    const levelEarnings = await query(
      `SELECT amount, "fromUserId", level, "createdAt" FROM "Earning" WHERE "userId" = $1 AND "earningType" = $2`,
      [userId, 'LEVEL_INCOME']
    )

    // Calculate total earnings
    const totalEarnings = [...directEarnings, ...levelEarnings].reduce(
      (sum, earning) => sum + Number(earning.amount),
      0
    )

    // Define the function outside the route handler to avoid strict mode issues
    const fetchReferralLevel = async (referrers: any[], currentLevel: number): Promise<any[]> => {
      if (currentLevel > 6 || referrers.length === 0) {
        return [];
      }
      
      // Get all referral codes from the current level
      const referralCodes = referrers.map(ref => ref.referralCode);
      
      // Find all users referred by the current level
      const placeholders = referralCodes.map((_, i) => `$${i + 1}`).join(',');
      const nextLevelUsers = await query(
        `SELECT id, "fullName", email, "createdAt", "referralCode", "referredBy"
         FROM "User"
         WHERE "referredBy" IN (${placeholders})`,
        referralCodes
      );
      
      // Add level information to each user
      const usersWithLevel = nextLevelUsers.map(user => ({
        ...user,
        level: currentLevel,
        // Find the direct parent in the referral chain
        parentReferralCode: user.referredBy
      }));
      
      // Recursively fetch the next level
      const nextLevel = await fetchReferralLevel(nextLevelUsers, currentLevel + 1);
      
      return [...usersWithLevel, ...nextLevel];
    };
    
    // Start with direct referrals (level 1) and fetch all deeper levels
    const multiLevelReferrals = await fetchReferralLevel(directReferrals, 1);

    // Combine direct referrals with multi-level referrals
    const allReferrals = [
      // Direct referrals (level 0)
      ...directReferrals.map(ref => ({ 
        ...ref, 
        level: 0,
        earnings: directEarnings
          .filter(e => e.fromUserId === ref.id)
          .reduce((sum, e) => sum + Number(e.amount), 0)
      })),
      // Multi-level referrals (levels 1-6)
      ...multiLevelReferrals.map(ref => ({
        ...ref,
        earnings: levelEarnings
          .filter(e => e.fromUserId === ref.id && e.level === ref.level)
          .reduce((sum, e) => sum + Number(e.amount), 0)
      }))
    ]

    return NextResponse.json({
      success: true,
      referrals: allReferrals,
      totalReferrals: allReferrals.length,
      directReferrals: directReferrals.length,
      totalEarnings
    })
  } catch (error: any) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}

