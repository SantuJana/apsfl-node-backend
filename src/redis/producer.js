const redis = require(".");

async function produceEvent(host, event) {
    try {
        await redis.xadd(
            "ws_events",
            "*",
            "host",
            host,
            "eventid",
            event.eventid,
            "alerttype",
            event.alerttype,
            "alertname",
            event.alertname,
            "channelid",
            event.channelid,
            "channelname",
            event.channelname,
            "eventlocation",
            event.eventlocation,
            "eventtime",
            event.eventtime,
            "serverid",
            event.serverid,
            "servertype",
            event.servertype,
            "ts",
            event.ts,
        )
    } catch (error) {
        console.log(`${host}: `, 'Failed to push event on redis')
    }
}

module.exports = { produceEvent }