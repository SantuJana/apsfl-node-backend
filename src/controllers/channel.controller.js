const { getChannelsAvg, getChannelsHourlyAvg, getChannelById } = require('../db/channel')

async function channelsAvg(req, res) {
    const { sourceId, type, dateEpoch } = req.params
    try {
        const result = await getChannelsAvg(sourceId, type, dateEpoch)
        return res.json(result)
    } catch (error) {
        console.log(error)
        throw new Error('Failed to get cameras avg')
    }
}

async function channelsHourlyAvg(req, res) {
    const { channelId, dateEpoch } = req.params
    try {
        const result = await getChannelsHourlyAvg(channelId, dateEpoch)
        return res.json(result)
    } catch (error) {
        console.log(error)
        throw new Error('Failed to get cameras hourly avg')
    }
}

async function getChannel(req, res) {
    const { channelId } = req.params
    try {
        const result = await getChannelById(channelId)
        return res.json(result)
    } catch (error) {
        console.log(error)
        throw new Error('Failed to get cameras hourly avg')
    }
}

module.exports = {
    channelsAvg,
    channelsHourlyAvg,
    getChannel
}