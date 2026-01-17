const { pool } = require('../db')
const { randomUUID } = require('crypto')
const { startWs, stopWs } = require('../ws/wsRegistry')
const strict = require('assert/strict')
const { startStomp, stopStomp } = require('../stomp/stompRegistry')

async function getAllSources() {
    const sql = `SELECT * FROM sources ORDER BY created_at DESC;`
    const result = await pool.query(sql)
    return result.rows
}

async function getSpecificSource(id) {
    const sql = `SELECT * FROM sources WHERE id = $1;`
    const result = await pool.query(sql, [id])
    return result.rows
}

async function getAllEnabledSources() {
    const sql = `SELECT * FROM sources WHERE enabled = true;`
    const result = await pool.query(sql)
    return result.rows
}

async function insertSource(payload) {
    const sql = `INSERT INTO sources (id, name, host, port, protocol, itms, ivms, broker) values($1, $2, $3, $4, $5, $6, $7, $8);`
    const id = randomUUID()

    await pool.query(sql, [id, payload.name, payload.host, payload.port, payload.protocol, payload.itms, payload.ivms, payload.broker])

    if (payload.broker === 'ws') {
        if (payload.itms) {
            startWs({id, ...payload}, 'itms')
        }
    
        if (payload.ivms) {
            startWs({id, ...payload}, 'ivms')
        }
    }

    if (payload.broker === 'stomp') {
        startStomp({id, ...payload})
    }

    return {id, ...payload}
}

async function getSourceByHost(host) {
    const sql = `SELECT * FROM sources WHERE host = $1;`

    const result = await pool.query(sql, [host])
    return result.rows
}

async function removeSource(id) {
    const sql = `DELETE FROM sources WHERE id = $1;`

    const result = await pool.query(sql, [id])

    stopWs(`${id}-itms`)
    stopWs(`${id}-ivms`)
    stopStomp(id)
    
    return result.rows
}

async function updateSourceStatus(id) {
    const sql = `UPDATE sources SET enabled = NOT enabled WHERE id = $1;`
    const sqlSelect = `SELECT * FROM sources WHERE id = $1;`

    await pool.query(sql, [id])
    const result = await pool.query(sqlSelect, [id])
    const data = result.rows[0]

    if (data.enabled) {
        if (data.broker === 'ws') {
            if (data.itms) {
                startWs(data, 'itms')
            }
        
            if (data.ivms) {
                startWs(data, 'ivms')
            }
        } else if (data.broker === 'stomp') {
            startStomp(data)
        }
    } else {
        stopWs(`${data.id}-itms`)
        stopWs(`${data.id}-ivms`)
        stopStomp(data.id)
    }
}

async function updateSource(id, payload) {
    const sql = `UPDATE sources SET name = $2, host = $3, port = $4, protocol = $5, itms = $6, ivms = $7, broker = $8 WHERE id = $1;`

    await pool.query(sql, [id, payload.name, payload.host, payload.port, payload.protocol, payload.itms, payload.ivms, payload.broker])

    stopWs(`${id}-itms`)
    stopWs(`${id}-ivms`)
    stopStomp(id)

    setTimeout(() => {
        if (payload.broker === 'ws') {
            if (payload.itms) {
                startWs({id, ...payload}, 'itms')
            }
        
            if (payload.ivms) {
                startWs({id, ...payload}, 'ivms')
            }
        }

        if (payload.broker === 'stomp') {
            startStomp({id, ...payload})
        }
    }, 1000)

    return {id, ...payload}
}

module.exports = {
    getAllSources,
    getAllEnabledSources,
    insertSource,
    getSourceByHost,
    removeSource,
    updateSourceStatus,
    updateSource,
    getSpecificSource
}