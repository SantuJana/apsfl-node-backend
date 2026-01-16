const redis = require(".");

async function checkRedisConnection() {
    try {
        const res = await redis.ping()

        if (res !== 'PONG') {
            throw new Error(`Unexpected PING response: ${res}`);
        }

        console.log("✅ Redis connected");
    } catch (error) {
        console.error("❌ Redis connection failed", err);
        throw err;
    }
}

module.exports = checkRedisConnection