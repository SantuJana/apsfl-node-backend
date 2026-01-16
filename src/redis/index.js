const Redis = require('ioredis')

const redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASSWORD || '',
    maxRetriesPerRequest: null,
})

module.exports = redis