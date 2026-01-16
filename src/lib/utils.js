async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
    sleep
}