const { Pool } = require("pg");

exports.pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

exports.connectToDB = async () => {
  try {
    await this.pool.query('SELECT 1 as test')
    console.log('Successfully connected to Database')
  } catch (error) {
    console.log('Failed to connected to Database')
  }
}
