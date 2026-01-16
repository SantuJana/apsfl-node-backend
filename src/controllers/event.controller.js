const { getHourlyEventCount, getSpecificHourEventCount } = require("../db/event")

async function getEventCounts(req, res) {
    const { host, date, type } = req.params

    try {
        const counts = await getHourlyEventCount(date, host, type)
        res.json(counts)
    } catch (error) {
        console.log(error.message)
        throw new Error('Failed to fetch event counts')
    }
}

async function getHourEventCount(req, res) {
    const { host, date, hour, type } = req.params

    try {
        const counts = await getSpecificHourEventCount(host, date, hour, type)
        res.json(counts[0])
    } catch (error) {
        console.log(error.message)
        throw new Error('Failed to fetch event counts')
    }
}

module.exports = {
    getEventCounts,
    getHourEventCount
}