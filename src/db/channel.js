const { pool } = require(".")

async function getChannelsAvg(sourceId, type, dateEpoch) {
    const sql = `SELECT * FROM getall_channels_avg($1, $2, $3);`

    const { rows } = await pool.query(sql, [sourceId, type.toUpperCase(), dateEpoch])

    return rows
}

async function getChannelsHourlyAvg(channelID, dateEpoch) {
    const sql = `SELECT * FROM channel_hourly_avg($1, $2);`

    const { rows } = await pool.query(sql, [channelID, dateEpoch])

    return rows
}

async function getChannelById(channelID) {
    const sql = `SELECT c.*, CONCAT_WS('_', s.servername, c.channelid) uuid FROM channels c LEFT JOIN servers s ON c.serverid = s.id WHERE c.id = $1;`

    const { rows } = await pool.query(sql, [channelID])

    return rows?.[0] || null
}

module.exports = {
    getChannelsAvg,
    getChannelsHourlyAvg,
    getChannelById
}