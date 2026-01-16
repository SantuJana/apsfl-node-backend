function up(pgm) {
    pgm.addColumn('sources', {
        name: { type: 'string', notNull: true }
    })
}

function down(pgm) {
    pgm.removeColumn('sources', 'name')
}

module.exports = {
    up,
    down,
}