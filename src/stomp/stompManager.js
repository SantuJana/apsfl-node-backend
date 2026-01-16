const { getAllEnabledSources } = require("../db/source");
const { startStomp } = require("./stompRegistry");

async function spinUpSavedStompSources() {
    try {
        const sources = await getAllEnabledSources()

        for (const source of sources) {
            if (source.broker === 'stomp') {
                startStomp(source)
            }
        }
    } catch (error) {
        console.log('Error: Failed to spin up the saved stomp source connections.', error.message)
    }
}

module.exports = {
    spinUpSavedStompSources,
}