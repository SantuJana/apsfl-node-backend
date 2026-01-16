const { getLatestLogs } = require("../db/log");

async function getLogs(req, res) {
    const logs = await getLatestLogs()
    return res.json(logs)
}

module.exports = {
    getLogs,
}