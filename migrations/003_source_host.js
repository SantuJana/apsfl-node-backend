function up(pgm) {
    pgm.renameColumn('sources', 'ip', 'host')
}

function down(pgm) {
    pgm.renameColumn('sources', 'host', 'ip')
}

module.exports = {
    up,
    down,
}