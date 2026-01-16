function up(pgm) {
    pgm.addColumn('sources', {
        broker: { type: 'string', notNull: true, default: 'stomp'}
    })
}

function down(pgm) {
    pgm.dropColumn('sources', 'broker')
}

module.exports = {
    up,
    down,
}