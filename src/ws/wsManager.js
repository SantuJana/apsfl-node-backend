const { getAllEnabledSources } = require("../db/source");
const { startWs } = require("./wsRegistry");

async function spinUpSavedWsSources() {
    try {
        const sources = await getAllEnabledSources()

        for (const source of sources) {
            if (source.broker === 'ws') {
                if (source.itms) {
                    startWs(source, 'itms')
                }
                
                if (source.ivms) {
                    startWs(source, 'ivms')
                }
            }
        }
    } catch (error) {
        console.log('Error: Failed to spin up the saved ws source connections.', error.message)
    }
}

module.exports = {
    spinUpSavedWsSources,
}