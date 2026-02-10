function up(pgm) {
    pgm.addColumn('events', {
        sourceId: { type: 'string', notNull: true, default: ''}
    });

    pgm.dropIndex('events',
        ['host', { name: 'ts', sort: 'desc' }, 'channelid', 'serverid', 'servertype'],
        { 
            name: 'idx_events_host_ts_group',
            include: ['servername', 'channelname'],
            ifExists: true
        }
    );
    
    pgm.dropIndex('events', ['host', 'ts'], {
        name: 'idx_events_host',
        ifExists: true
    });

    pgm.createIndex('events', ['sourceId', 'host', { name: 'ts', sort: 'desc' }, 'servertype'], {
        name: 'idx_events_sourceId_host_ts_servertype'
    });
}

function down(pgm) {
    pgm.dropColumn('events', 'sourceId');

    pgm.createIndex('events',
        ['host', { name: 'ts', sort: 'desc' }, 'channelid', 'serverid', 'servertype'],
        { 
            name: 'idx_events_host_ts_group',
            include: ['servername', 'channelname']
        }
    );

    pgm.createIndex('events', ['host', 'ts'], {
        name: 'idx_events_host'
    });

    pgm.dropIndex('events', 'idx_events_sourceId_host_ts_servertype');
}

module.exports = {
    up,
    down,
}