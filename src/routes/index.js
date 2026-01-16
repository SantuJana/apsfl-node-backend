const router = require('express').Router()
const sourceRoutes = require('./source.route')
const eventRoutes = require('./event.route')
const logRoutes = require('./log.route')

router.use('/source', sourceRoutes)
router.use('/event', eventRoutes)
router.use('/log', logRoutes)

module.exports = router