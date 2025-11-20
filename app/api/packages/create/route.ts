import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/middleware/auth'
import { validateRequest, packageCreationSchema } from '@/middleware/validation'
import { createPackage } from '@/services/packageService'
import { handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const authResult = await authenticateToken(request)
  if (authResult instanceof NextResponse) return authResult
  
  const { user } = authResult

  try {
    const body = await request.json()
    
    // Validate request
    const validation = validateRequest(body, packageCreationSchema)
    if (!validation.success) {
  // validation is a union; cast to any to access the error response
  return (validation as any).error
    }
    
    const { amount, network } = validation.data

    // Create package
    const result = await createPackage(user.userId, amount, network as any)

    return NextResponse.json({
      success: true,
      message: 'Package created successfully. Please send USDT to the address below.',
      package: result.package,
      depositAddress: result.depositAddress,
      qrCode: result.qrCode,
      expiresIn: 1800 // 30 minutes in seconds
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create package error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create package' },
      { status: 500 }
    )
  }
}
