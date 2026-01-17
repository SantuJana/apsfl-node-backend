const { Client } = require('@stomp/stompjs')
const WebSocket = require('ws')
const { addLog } = require('../db/log')
const { produceEvent } = require('../redis/producer')

const stompConnections = new Map()

const STOMP_USER = process.env.STOMP_USER
const STOMP_PASSWORD = process.env.STOMP_PASSWORD

if (!STOMP_PASSWORD || !STOMP_USER) throw new Error('Stomp user and password not provided')

function startStomp(config) {
    if (stompConnections.has(config.id)) return

    const WS_URL = `${config.protocol}://${config.host}:${config.port}/notification/websocket`

    const client = new Client({
        brokerURL: WS_URL,

        connectHeaders: {
            login: STOMP_USER,
            passcode: STOMP_PASSWORD,
        },

        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        reconnectDelay: 5000,

        webSocketFactory: () =>
            new WebSocket(WS_URL, {
                rejectUnauthorized: false, // self-signed cert
            }),

        onConnect: () => {
            console.log(`${config.host}: `, '✅ STOMP connected')
            addLog({ host: config.host, message: `${config.host}(stomp): Connected to Stomp Server.` })

            if (config.ivms) {
                console.log(`${config.host}: `, '✅ IVMS subscribed')
                addLog({ host: config.host, message: `${config.host}(stomp-ivms): Subscribed to Stomp ivms.` })
                client.subscribe('/event/ivms', (message) => {
                    const eventObj = JSON.parse(message.body || '');
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
                        })
                    }
                })
            }

            if (config.itms) {
                console.log(`${config.host}: `, '✅ ITMS subscribed')
                addLog({ host: config.host, message: `${config.host}(stomp-itms): Subscribed to Stomp itms.` })
                client.subscribe('/event/itms', (message) => {
                    const eventObj = JSON.parse(message.body || '');
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
                        })
                    }
                })
            }
        },

        onStompError: (frame) => {
            console.error(`${config.host}: `, '❌ STOMP error:', frame.headers['message'])
            console.error(`${config.host}: `, frame.body)
        },

        onWebSocketClose: () => {
            console.log(`${config.host}: `, '🔌 Stomp WebSocket closed')
                addLog({ host: config.host, message: `${config.host}(stomp): Stomp WebSocket closed.` })
        },
    })

    client.activate()

    stompConnections.set(config.id, client)
}

function stopStomp(id) {
    const client = stompConnections.get(id)
    if (client) {
        client.deactivate()
        stompConnections.delete(id)
    }
}

function stopAllStomp() {
    for (const id of [...stompConnections.keys()]) {
        stopStomp(id)
    }
}

module.exports = {
    startStomp,
    stopStomp,
    stopAllStomp
}