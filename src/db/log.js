const { pool } = require(".")

async function addLog(payload) {
    try {
        const sql = `INSERT INTO logs (host, message) values($1, $2)`
        await pool.query(sql, [payload.host, payload.message])
    } catch (error) {
        
    }
}

async function getLatestLogs() {
    const sql = `SELECT host, message, ts AT TIME ZONE 'Asia/Kolkata' as date_time FROM logs ORDER BY ts DESC LIMIT 200;`
    const result = await pool.query(sql)
    return result.rows
}

module.exports = {
    addLog,
    getLatestLogs
}