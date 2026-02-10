function up (pgm) {
    pgm.createIndex('events',
        ['host', { name: 'ts', sort: 'desc' }, 'channelid', 'serverid', 'servertype'],
        { 
            name: 'idx_events_host_ts_group',
            include: ['servername', 'channelname']
        }
    );
}

function down (pgm) {
    pgm.dropIndex('events', 'idx_events_host_ts_group');
}

module.exports = {
    up,
    down
}