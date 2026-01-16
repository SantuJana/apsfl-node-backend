const { getEventCounts, getHourEventCount } = require('../controllers/event.controller')

const router = require('express').Router()

router.get('/:host/:date/:type', getEventCounts)
router.get('/:host/:date/:hour/:type', getHourEventCount)

module.exports = router