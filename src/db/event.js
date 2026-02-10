const { pool } = require(".")

async function insertBatch(values, params) {
    try {
        const sql = `
            INSERT INTO events (host, eventid, alerttype, alertname, channelid, channelname, eventlocation, eventtime, serverid, servertype, ts, servername, primaryip, "sourceId")
            VALUES ${values.join(',')};
        `
        
        await pool.query(sql, params);
    } catch (error) {
        console.log('Error: Failed to insert batch data.', error.message)
    }
}

async function getHourlyEventCount(dateEpoch, sourceId, type = 'itms') {
    const startEpoch = Number(dateEpoch)
    const endEpoch = startEpoch + (24 * 3600000)

    // const sql1 = `
    //     WITH hours AS (
    //         SELECT generate_series(
    //             DATE ($2::date),
    //             DATE ($2::date) + INTERVAL '23 hours',
    //             INTERVAL '1 hour'
    //         ) AS hour_start
    //     )
    //     SELECT COALESCE(e.event_count, 0) AS event_count, TO_CHAR(h.hour_start, 'HH24:00') || '-'
    //         || TO_CHAR(h.hour_start + INTERVAL '59 minutes', 'HH24:59') AS time_range
    //     FROM hours AS h
    //     LEFT JOIN
    //     ( SELECT COUNT(1) as event_count,
    //         DATE_TRUNC('hour', ts AT TIME ZONE 'Asia/Kolkata') as hour_start
    //     FROM events 
    //     WHERE DATE(ts AT TIME ZONE 'Asia/Kolkata') = ($2::date) AND host = $1 AND LOWER(servertype) = LOWER($3)
    //     GROUP BY DATE_TRUNC('hour', ts AT TIME ZONE 'Asia/Kolkata')) as e
    //     ON h.hour_start = e.hour_start;
    // `

    const sql = `
        WITH hours AS (
            SELECT 
                gs as hour_start,
                gs + INTERVAL '1 hour' as hour_end,
                row_number() over(order by gs) - 1 as hour_no
            FROM generate_series(
                        to_timestamp($3::bigint/1000.0),
                        to_timestamp($3::bigint/1000.0) + INTERVAL '23 hours',
                        INTERVAL '1 hour'
                    ) AS gs
        )
        SELECT count(e.host) as event_count, 
        concat(lpad(h.hour_no::text, 2, '0'), ':00-', lpad(h.hour_no::text, 2, '0'), ':59') as time_range FROM hours as h
        LEFT JOIN
        (SELECT * FROM events
            WHERE "sourceId" = $1
            AND ts >= to_timestamp($3::bigint / 1000.0) 
            AND ts < to_timestamp($4::bigint / 1000.0) 
            AND servertype = UPPER($2)) as e
        ON e.ts >= h.hour_start AND e.ts < h.hour_end
        GROUP BY h.hour_start, h.hour_no
        ORDER BY h.hour_start
    `
    const result = await pool.query(sql, [sourceId, type, startEpoch, endEpoch])
    return result.rows
}

async function getSpecificHourEventCount(sourceId, hourStartEpoch, type) {
    const startEpoch = Number(hourStartEpoch)
    const endEpoch = startEpoch + 3600000

    const sql = `
        SELECT count(1) as event_count
        FROM events
        WHERE "sourceId" = $1
        AND ts >= to_timestamp($3::bigint / 1000.0) 
        AND ts < to_timestamp($4::bigint / 1000.0)
        AND LOWER(servertype) = LOWER($2);
    `

    const result = await pool.query(sql, [sourceId, type, startEpoch, endEpoch])
    return result.rows
}

async function getCameraWiseCount(sourceId, dateEpoch) {
    const startEpoch = Number(dateEpoch)
    const endEpoch = startEpoch + (24 * 3600000)

    const sql2 = `
        SELECT channelid, serverid, (array_agg(servername ORDER BY ts DESC))[1] AS servername, servertype, (array_agg(channelname ORDER BY ts DESC))[1] AS channelname, count(1) AS event_count 
        FROM events
        WHERE "sourceId" =  $1
        AND ts >= to_timestamp($2::bigint / 1000.0) 
        AND ts < to_timestamp($3::bigint / 1000.0)
        GROUP BY channelid, serverid, servertype
        ORDER BY channelid
    `
    const result = await pool.query(sql2, [sourceId, startEpoch, endEpoch])

    return result.rows
}

module.exports = {
    insertBatch,
    getHourlyEventCount,
    getSpecificHourEventCount,
    getCameraWiseCount,
}