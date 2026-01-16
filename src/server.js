const app = require('./app')
const http = require('http')
const { connectToDB, pool } = require('./db')
const webSocketRegistry = require('./ws/wsRegistry')
const stompRegistry = require('./stomp/stompRegistry')
const { spinUpSavedWsSources } = require('./ws/wsManager')
const checkRedisConnection = require('./redis/health')
const { ensureConsumerGroup, recoverPending, consume, deleteStreamIfExists, stopConsume } = require('./redis/consumer')
const redis = require('./redis')
const { spinUpSavedStompSources } = require('./stomp/stompManager')

const PORT = process.env.PORT || 5001

const server = http.createServer(app)

async function startServer() {
    await connectToDB()
    await checkRedisConnection()
    await deleteStreamIfExists()
    await ensureConsumerGroup()
    consume()
    server.listen(PORT, () => {
        console.log('Server is running on port ', PORT)
    })
    spinUpSavedWsSources()
    spinUpSavedStompSources()
}

async function shutdown() {
    console.log("Shutting down...");
    stopConsume()
    server.close()
    webSocketRegistry.stopAllWs()
    stompRegistry.stopAllStomp()
    deleteStreamIfExists()
    pool.end()
    redis.quit()
    redis.disconnect()
    process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

startServer()