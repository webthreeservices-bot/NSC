import bcrypt from 'bcrypt'
import { query, queryOne, queryScalar, execute, transaction } from '@/lib/db'
import { randomBytes } from 'crypto'

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n')

  const adminEmail = 'admin@admin.com'
  const adminPassword = 'WtsWts@@688688'
  
  try {
    // Check if admin already exists
    const existingAdmin = await queryOne({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!')
      console.log('📧 Email:', adminEmail)
      console.log('🆔 ID:', existingAdmin.id)
      console.log('👤 Username:', existingAdmin.username)
      console.log('🔑 Admin:', existingAdmin.isAdmin ? 'Yes' : 'No')
      
      // Update to ensure admin status
      if (!existingAdmin.isAdmin) {
        await queryOne({
          where: { id: existingAdmin.id },
          data: { 
            isAdmin: true,
            isEmailVerified: true,
            isActive: true,
            isBlocked: false
          }
        })
        console.log('\n✅ Updated user to admin status')
      }
      
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    // Generate referral code
    const referralCode = randomBytes(4).toString('hex').toUpperCase()

    // Create admin user
    const admin = await queryOne({
      data: {
        id: `user_${Date.now()}`,
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        fullName: 'System Administrator',
        referralCode: referralCode,
        isAdmin: true,
        isEmailVerified: true,
        isActive: true,
        isBlocked: false,
        kycStatus: 'APPROVED'
      }
    })

    console.log('✅ Admin user created successfully!\n')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('🆔 ID:', admin.id)
    console.log('👤 Username:', admin.username)
    console.log('🎫 Referral Code:', admin.referralCode)
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!')
    console.log('🔐 This is the only admin account with full system access.')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await disconnect()
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n✨ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
