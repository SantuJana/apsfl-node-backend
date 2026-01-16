const { getAllSources, getAllEnabledSources, insertSource, getSourceByHost, removeSource, updateSourceStatus, updateSource, getSpecificSource } = require("../db/source");
const { startWs } = require("../ws/wsRegistry");

const TEST_MODE = process.env.TEST_MODE || false

async function fetchAllSources(req, res) {
    const result = await getAllSources()
    return res.json(result)
}

async function fetchSource(req, res) {
    const id = req.params.id
    const result = await getSpecificSource(id)
    return res.json(result[0] || null)
}

async function fetchAllEnabledSources(req, res) {
    const result = await getAllEnabledSources()
    return res.json(result)
}

async function AddSource(req, res) {
    const { name, host, port, protocol, itms, ivms, broker } = req.body

    if (!name || !host || !port || !protocol || itms === undefined || ivms === undefined || !broker) {
        return res.status(400).json({ success: false, error: 'All fields are required.'})
    }

    if (!TEST_MODE) {
        const exists = await getSourceByHost(host)
    
        if (!!exists.length) return res.status(400).json({ success: false, error: 'Host already added.' })
    }

    const result = await insertSource(req.body)
    return res.json(result)
}

async function deleteSource(req, res) {
    const id = req.params.id
    await removeSource(id)
    return res.json({ success: true })
}

async function toggleSourceEnable(req, res) {
    const id = req.params.id
    await updateSourceStatus(id)
    return res.json({ success: true })
}

async function modifySource(req, res) {
    const id = req.params.id
    const { name, host, port, protocol, enabled, itms, ivms } = req.body

    if (!name || !host || !port || !protocol || enabled == undefined || itms === undefined || ivms === undefined) {
        return res.status(400).json({ success: false, error: 'All fields are required.' })
    }

    const result = await updateSource(id, req.body)
    return res.json(result)
}

module.exports = {
    fetchAllSources,
    fetchAllEnabledSources,
    AddSource,
    deleteSource,
    toggleSourceEnable,
    modifySource,
    fetchSource
}