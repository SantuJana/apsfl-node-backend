const { getEventCounts, getHourEventCount, cameraWiseCount } = require('../controllers/event.controller')

const router = require('express').Router()

router.get('/:host/:dateEpoch/:type', getEventCounts)
router.get('/hourly/:host/:hourStartEpoch/:type', getHourEventCount)
router.get('/:sourceId/:dateEpoch', cameraWiseCount)

module.exports = router