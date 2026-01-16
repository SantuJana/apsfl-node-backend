function up(pgm) {
    pgm.addColumn('sources', {
        protocol: { type: 'string', notNull: true, default: 'wss' }
    })
}

function down(pgm) {
    pgm.dropColumn('sources', 'protocol')
}

module.exports = {
    up,
    down,
}