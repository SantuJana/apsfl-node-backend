const { fetchAllSources, fetchAllEnabledSources, AddSource, deleteSource, toggleSourceEnable, modifySource, fetchSource } = require('../controllers/source.controller')

const router = require('express').Router()

router.get('/', fetchAllSources)
router.get('/enabled', fetchAllEnabledSources)
router.post('/', AddSource)
router.get('/:id', fetchSource)
router.delete('/:id', deleteSource)
router.patch('/:id', toggleSourceEnable)
router.put('/:id', modifySource)

module.exports = router