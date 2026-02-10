function up(pgm) {
    pgm.createIndex('channelstatus', [{name: 'ts', sort: 'desc'}, 'channelid']);
    pgm.createIndex('servers', ['sourceid', 'servertype', 'serverid', 'servername']);
    pgm.createIndex('channels', ['channelid', 'channelname']);
}

function down(pgm) {
    pgm.dropIndex('channelstatus', [{name: 'ts', sort: 'desc'}, 'channelid']);
    pgm.dropIndex('servers', ['sourceid', 'servertype', 'serverid', 'servername']);
    pgm.dropIndex('channels', ['channelid', 'channelname']);
}

module.exports = {
    up,
    down,
}