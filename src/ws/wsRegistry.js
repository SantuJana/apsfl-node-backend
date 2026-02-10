const ReconnectingWebSocket = require('reconnecting-websocket')
const { addLog } = require('../db/log')
const { produceEvent } = require('../redis/producer')

const connections = new Map()

function startWs(config, type) {
    if (connections.has(config.id)) return

    const wsURL = `${config.protocol}://${config.host}:${config.port}/ws/event/${type}`
    const rws = new ReconnectingWebSocket(wsURL)

    rws.addEventListener('message', (event) => {
        if (typeof event.data === 'string') {
            const eventObj = JSON.parse(event.data || '');
            for (const msg of eventObj?.result || []) {
                produceEvent(config.host, {
                    eventid: msg. eventid,
                    alerttype: msg.alerttype ,
                    alertname: msg.alertname ,
                    channelid: msg.channelid ,
                    channelname: msg.channelname ,
                    eventlocation: msg.eventlocation ,
                    eventtime: msg.eventtime ,
                    serverid: msg.serverid ,
                    servertype: msg.servertype ,
                    ts: Date.now().toString() ,
                    servername: msg.server?.servername || '' ,
                    primaryip: msg.server?.primaryip || '' ,
                    sourceId: config.id
                })
            }
        }
    })

    rws.addEventListener('open', () => {
        console.log(`${config.host}(${type.toUpperCase()}): `, 'Connected to event server')
        addLog({ host: config.host, message: `${config.host}(${type}): Connected to Socket Server.` })
    })

    rws.addEventListener('close', () => {
        console.log(`${config.host}(${type.toUpperCase()}): `, 'Connection closed from server')
        addLog({ host: config.host, message: `${config.host}(${type}): Connection closed from Socket Server.` })
    })

    rws.addEventListener('error', (error) => {
        console.log(`${config.host}(${type.toUpperCase()}): `, 'Connection error', error.message)
    })

    connections.set(`${config.id}-${type}`, rws)
}

function stopWs(id) {
    const rws = connections.get(id)
    if (rws) {
        rws.reconnect = false
        rws.close()
        connections.delete(id)
    }
}

function stopAllWs() {
    for (const id of [...connections.keys()]) {
        stopWs(id)
    }
}

module.exports = {
    startWs,
    stopWs,
    stopAllWs,
    connections,
}