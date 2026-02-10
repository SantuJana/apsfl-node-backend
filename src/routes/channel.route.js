const { channelsAvg, channelsHourlyAvg, getChannel } = require('../controllers/channel.controller')

const router = require('express').Router()

router.get('/hourly/:channelId/:dateEpoch', channelsHourlyAvg)
router.get('/:sourceId/:type/:dateEpoch', channelsAvg)
router.get('/:channelId', getChannel)

module.exports = router