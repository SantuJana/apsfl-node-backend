function up(pgm) {
    pgm.createExtension('pgcrypto', { ifNotExists: true });
    pgm.createExtension('timescaledb', { ifNotExists: true });

    pgm.createTable('servers', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
        sourceid: { type: 'uuid', notNull: true, references: 'sources(id)', onDelete: 'CASCADE'},
        serverid: { type: 'integer', notNull: true},
        servername: { type: 'varchar(255)', notNull: true},
        servertype: { type: 'varchar(4)', notNull: true},
        primaryip: { type: 'varchar(20)', notNull: true},
        createdat: { type: 'timestamptz', notNull: true, default: pgm.func('now()')},
        updatedat: { type: 'timestamptz', notNull: true, default: pgm.func('now()')}
    });

    pgm.createTable('channels', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()')},
        serverid: { type: 'uuid', notNull: true, references: 'servers(id)', onDelete: 'CASCADE'},
        channelid: { type: 'integer', notNull: true},
        channelname: { type: 'varchar(255)', notNull: true},
        channelip: { type: 'varchar(20)', notNull: true},
        channeltype: { type: 'integer', notNull: true},
        createdat: { type: 'timestamptz', notNull: true, default: pgm.func('now()')},
        updatedat: { type: 'timestamptz', notNull: true, default: pgm.func('now()')}
    });

    pgm.createTable('channelstatus', {
        channelid: { type: 'uuid', notNull: true, references: 'channels(id)', onDelete: 'CASCADE'},
        statuscode: { type: 'varchar(20)', notNull: true},
        statustext: { type: 'varchar(50)', notNull: true},
        channelstatus: { type: 'integer', notNull: true},
        recfps: { type: 'integer', notNull: true},
        recbitrate: { type: 'integer', notNull: true},
        ts: { type: 'timestamptz', notNull: true, default: pgm.func('now()')}
    });

    pgm.sql(`
        SELECT create_hypertable(
            'channelstatus',
            'ts',
            if_not_exists => TRUE,
            chunk_time_interval => INTERVAL '1 day'
        )    
    `);

    pgm.sql(`
        SELECT add_retention_policy('channelstatus', INTERVAL '3 days');
    `);
}

function down(pgm) {
    pgm.dropTable('servers', { ifExists: true, cascade: true });
    pgm.dropTable('channelstatus', { ifExists: true, cascade: true });
}

module.exports = {
    up,
    down
}