function up(pgm) {
    pgm.createTable('events', {
        host: { type: 'string' },
        eventid: { type: 'bigint' },
        alerttype: { type: 'integer' },
        alertname: { type: 'string' },
        channelid: { type: 'integer' },
        channelname: { type: 'string' },
        eventlocation: { type: 'text' },
        eventtime: { type: 'string' },
        serverid: { type: 'integer' },
        servertype: { type: 'string' },
        ts: { type: 'timestamptz', notNull: true, default: pgm.func('now()')}
    })

    pgm.sql(`SELECT create_hypertable('events', 'ts', if_not_exists => TRUE);`);

    pgm.createIndex('events', ['host', 'ts'], {
        name: 'idx_events_host'
    });

    pgm.sql(`SELECT add_retention_policy('events', INTERVAL '2 days');`)
}

function down(pgm) {
    pgm.sql(`DROP TABLE IF EXISTS events CASCADE;`)
}

module.exports = {
    up,
    down,
}