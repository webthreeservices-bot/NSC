/**
 * Verify admin user exists and check credentials
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JsN5Z0KwCtaV@ep-ancient-mode-a1wdnpmn-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyAdmin() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking admin user...\n');

    // Check if admin exists
    const adminCheck = await client.query(`
      SELECT id, email, "isAdmin", "isActive", "isBlocked", password
      FROM "User"
      WHERE email = 'admin@admin.com'
    `);

    if (adminCheck.rows.length === 0) {
      console.log('❌ Admin user does not exist!');
      console.log('Creating admin user...\n');

      // Hash password
      const hashedPassword = await bcrypt.hash('WtsWts@@688688', 10);

      // Create admin user
      await client.query(`
        INSERT INTO "User" (
          id, email, password, "fullName", "isAdmin", "isActive",
          "isEmailVerified", "kycStatus", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          'admin@admin.com',
          $1,
          'System Administrator',
          true,
          true,
          true,
          'APPROVED',
          NOW(),
          NOW()
        )
      `, [hashedPassword]);

      console.log('✅ Admin user created successfully!\n');
    } else {
      const admin = adminCheck.rows[0];
      console.log('✅ Admin user found:');
      console.log('   Email:', admin.email);
      console.log('   Is Admin:', admin.isAdmin);
      console.log('   Is Active:', admin.isActive);
      console.log('   Is Blocked:', admin.isBlocked);
      console.log('');

      // Verify password
      const passwordMatch = await bcrypt.compare('WtsWts@@688688', admin.password);
      console.log('   Password Check:', passwordMatch ? '✅ CORRECT' : '❌ INCORRECT');

      if (!passwordMatch) {
        console.log('\n🔧 Updating admin password...');
        const hashedPassword = await bcrypt.hash('WtsWts@@688688', 10);
        await client.query(`
          UPDATE "User"
          SET password = $1, "updatedAt" = NOW()
          WHERE email = 'admin@admin.com'
        `, [hashedPassword]);
        console.log('✅ Password updated!\n');
      }

      if (!admin.isAdmin) {
        console.log('\n🔧 Setting user as admin...');
        await client.query(`
          UPDATE "User"
          SET "isAdmin" = true, "updatedAt" = NOW()
          WHERE email = 'admin@admin.com'
        `);
        console.log('✅ User is now admin!\n');
      }

      if (!admin.isActive || admin.isBlocked) {
        console.log('\n🔧 Activating account...');
        await client.query(`
          UPDATE "User"
          SET "isActive" = true, "isBlocked" = false, "updatedAt" = NOW()
          WHERE email = 'admin@admin.com'
        `);
        console.log('✅ Account activated!\n');
      }
    }

    console.log('✅ Admin verification complete!');
    console.log('\nYou can now login with:');
    console.log('   Email: admin@admin.com');
    console.log('   Password: WtsWts@@688688\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAdmin();
