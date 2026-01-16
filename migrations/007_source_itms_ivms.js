function up(pgm) {
    pgm.addColumn('sources', {
        itms: { type: 'boolean', notNull: true, default: false },
        ivms: { type: 'boolean', notNull: true, default: false }
    })
}

function down(pgm) {
    pgm.dropColumn('sources', 'itms');
    pgm.dropColumn('sources', 'ivms');
}

module.exports = {
    up,
    down
}