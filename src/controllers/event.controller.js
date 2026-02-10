const { getHourlyEventCount, getSpecificHourEventCount, getCameraWiseCount } = require("../db/event")

async function getEventCounts(req, res) {
    const { sourceId, dateEpoch, type } = req.params

    try {
        const counts = await getHourlyEventCount(dateEpoch, sourceId, type)
        res.json(counts)
    } catch (error) {
        console.log(error.message)
        throw new Error('Failed to fetch event counts')
    }
}

async function getHourEventCount(req, res) {
    const { sourceId, hourStartEpoch, type } = req.params

    try {
        const counts = await getSpecificHourEventCount(sourceId, hourStartEpoch, type)
        res.json(counts[0])
    } catch (error) {
        console.log(error.message)
        throw new Error('Failed to fetch event counts')
    }
}

async function cameraWiseCount(req, res) {
    const { sourceId, dateEpoch } = req.params
    try {
        const records = await getCameraWiseCount(sourceId, dateEpoch)
        res.json(records)
    } catch (error) {
        console.log(error.message)
        throw new Error('Failed to fetch camera wise counts')
    }

}

module.exports = {
    getEventCounts,
    getHourEventCount,
    cameraWiseCount
}