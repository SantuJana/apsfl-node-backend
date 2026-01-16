const { pool } = require(".")

async function insertBatch(values, params) {
    try {
        const sql = `
            INSERT INTO events (host, eventid, alerttype, alertname, channelid, channelname, eventlocation, eventtime, serverid, servertype, ts)
            VALUES ${values.join(',')};
        `
        
        await pool.query(sql, params);
    } catch (error) {
        console.log('Error: Failed to insert batch data.', error.message)
    }
}

async function getHourlyEventCount(date, host, type = 'itms') {
    const sql = `
        WITH hours AS (
            SELECT generate_series(
                DATE ($2::date),
                DATE ($2::date) + INTERVAL '23 hours',
                INTERVAL '1 hour'
            ) AS hour_start
        )
        SELECT COALESCE(e.event_count, 0) AS event_count, TO_CHAR(h.hour_start, 'HH24:00') || '-'
            || TO_CHAR(h.hour_start + INTERVAL '59 minutes', 'HH24:59') AS time_range
        FROM hours AS h
        LEFT JOIN
        ( SELECT COUNT(1) as event_count,
            DATE_TRUNC('hour', ts AT TIME ZONE 'Asia/Kolkata') as hour_start
        FROM events 
        WHERE DATE(ts AT TIME ZONE 'Asia/Kolkata') = ($2::date) AND host = $1 AND LOWER(servertype) = LOWER($3)
        GROUP BY DATE_TRUNC('hour', ts AT TIME ZONE 'Asia/Kolkata')) as e
        ON h.hour_start = e.hour_start;
    `
    const result = await pool.query(sql, [host, date, type])
    return result.rows
}

async function getSpecificHourEventCount(host, date, hour, type) {
    const sql = `
        SELECT COUNT(1) AS event_count, CONCAT(LPAD(($4::varchar), 2, '0'), ':00-', LPAD(($4::varchar), 2, '0'), ':59') as time_range
        FROM events 
        WHERE ts >= (DATE ($3::date) + CAST(CONCAT(LPAD(($4::varchar), 2, '0'), ':00:00') as TIME)) AT TIME ZONE 'Asia/Kolkata'
              AND ts < (DATE ($3::date) + CAST(CONCAT(LPAD(($4::varchar), 2, '0'), ':00:00') as TIME)) AT TIME ZONE 'Asia/Kolkata' + INTERVAL '1 hour'
              AND host = $1
              AND LOWER(servertype) = LOWER($2);
    `

    const result = await pool.query(sql, [host, type, date, hour])
    return result.rows
}

module.exports = {
    insertBatch,
    getHourlyEventCount,
    getSpecificHourEventCount
}