function up(pgm) {
    pgm.createTable('logs', {
        id: { type: 'bigint', generated: "ALWAYS AS IDENTITY"},
        host: { type: 'string', notNull: true },
        message: { type: 'string', notNull: true },
        ts: { type: 'timestamptz', notNull: true, default: pgm.func('now()')}
    });

    pgm.sql(`SELECT create_hypertable('logs', 'ts', if_not_exists => TRUE);`);

    pgm.createIndex('logs', ['host', 'ts'], {
        name: 'idx_logs_host'
    });

    pgm.sql(`SELECT add_retention_policy('logs', INTERVAL '2 days');`)
}

function down(pgm) {
    pgm.sql('DROP TABLE IF EXISTS logs CASCADE;')
}

module.exports = {
    up,
    down,
}