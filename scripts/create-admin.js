const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_JsN5Z0KwCtaV@ep-empty-surf-a17lpl49-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    // Admin user details
    const adminEmail = 'admin@admin.com';
    const adminPassword = 'WtsWts@@688688';
    const fullName = 'Admin Admin';
    const username = 'admin';
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin exists
    const existingAdmin = await client.query(
      'SELECT * FROM "User" WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', adminEmail);
      
      // Update to ensure admin privileges
      await client.query(
        'UPDATE "User" SET "isAdmin" = true, "isEmailVerified" = true, "isActive" = true, "isBlocked" = false WHERE email = $1',
        [adminEmail]
      );
      
      console.log('✅ Updated admin privileges');
      return;
    }
    
    // Create new admin user
    const result = await client.query(
      'INSERT INTO "User" (email, password, "fullName", username, "referralCode", "isAdmin", "isEmailVerified", "isActive", "kycStatus") VALUES ($1, $2, $3, $4, $5, true, true, true, \'APPROVED\') RETURNING id',
      [adminEmail, hashedPassword, fullName, username, referralCode]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 ID:', result.rows[0].id);
    console.log('👤 Username:', username);
    console.log('🎫 Referral Code:', referralCode);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    client.release();
  }
}

createAdminUser()
  .then(() => {
    console.log('\n✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });