const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query("SELECT typname FROM pg_type WHERE typname = 'EarningType'");
    console.log('EarningType enum exists:', result.rows.length > 0);

    if (result.rows.length > 0) {
      // Get the oid of the type
      const typeResult = await pool.query("SELECT oid FROM pg_type WHERE typname = 'EarningType'");
      const typeOid = typeResult.rows[0].oid;

      const enumValues = await pool.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = $1 ORDER BY enumsortorder", [typeOid]);
      console.log('Enum values:', enumValues.rows.map(r => r.enumlabel));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();