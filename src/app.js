require('dotenv').config()
const express = require('express')
const routes = require('./routes')
const expressStatusMonitor = require('express-status-monitor')

const app = express()

app.use(express.json())
app.use(expressStatusMonitor())

app.use('/api/v1', routes)
app.use('/health', (req, res) => res.send('Healthy'))
app.use((err, req, res, next) => {
    return res.status(500).json({success: false, error: err.message})
})

module.exports = app