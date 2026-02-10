const { getEventCounts, getHourEventCount, cameraWiseCount } = require('../controllers/event.controller')

const router = require('express').Router()

router.get('/:sourceId/:dateEpoch/:type', getEventCounts)
router.get('/hourly/:sourceId/:hourStartEpoch/:type', getHourEventCount)
router.get('/:sourceId/:dateEpoch', cameraWiseCount)

module.exports = router