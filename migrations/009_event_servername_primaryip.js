function up(pgm) {
    pgm.addColumn('events', {
        servername:{type: 'string', notNull: true, default: ''},
        primaryip: {type: 'string', notNull: true, default: ''}
    })
}

function down(pgm) {
    pgm.dropColumn('events', 'servername')
    pgm.dropColumn('events', 'primaryip')
}

module.exports = {
    up,
    down
}