const { getLogs } = require('../controllers/log.controller')

const router = require('express').Router()

router.get('/', getLogs)

module.exports = router