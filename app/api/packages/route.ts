import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'

// Available package types with their details
const AVAILABLE_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Package',
    minAmount: 100,
    maxAmount: 999,
    roiPercentage: 10,
    duration: 12,
    features: [
      'Monthly ROI payments',
      'Access to referral program',
      'Basic bot features'
    ]
  },
  {
    id: 'silver',
    name: 'Silver Package',
    minAmount: 1000,
    maxAmount: 4999,
    roiPercentage: 12,
    duration: 12,
    features: [
      'Monthly ROI payments',
      'Access to referral program',
      'Advanced bot features',
      'Priority support'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Package',
    minAmount: 5000,
    maxAmount: 9999,
    roiPercentage: 15,
    duration: 12,
    features: [
      'Monthly ROI payments',
      'Access to referral program',
      'Premium bot features',
      'VIP support',
      'Exclusive webinars'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Package',
    minAmount: 10000,
    maxAmount: 49999,
    roiPercentage: 18,
    duration: 12,
    features: [
      'Monthly ROI payments',
      'Access to referral program',
      'All bot features',
      'Dedicated account manager',
      'Private investment consultations'
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond Package',
    minAmount: 50000,
    maxAmount: null,
    roiPercentage: 20,
    duration: 12,
    features: [
      'Monthly ROI payments',
      'Access to referral program',
      'All bot features',
      'Personal account executive',
      'Custom investment strategies',
      'Exclusive events access'
    ]
  }
]

export async function GET(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  try {
    return NextResponse.json({
      success: true,
      packages: AVAILABLE_PACKAGES
    })
  } catch (error) {
    console.error('Get available packages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available packages' },
      { status: 500 }
    )
  }
}
