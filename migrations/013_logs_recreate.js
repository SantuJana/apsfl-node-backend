function up(pgm) {
    pgm.sql(`
        DROP TABLE IF EXISTS new_logs;
    `);

    pgm.sql(`
        CREATE TABLE new_logs
        (LIKE logs INCLUDING ALL);
    `);

    pgm.sql(`
        INSERT INTO new_logs
        SELECT * FROM logs
    `);

    pgm.sql(`
        BEGIN;

        DROP TABLE IF EXISTS logs_old;
        ALTER TABLE logs RENAME TO logs_old;
        ALTER TABLE new_logs RENAME TO logs;

        COMMIT;    
    `);

    pgm.sql(`
        SELECT create_hypertable(
        'logs',
        'ts',
        chunk_time_interval => INTERVAL '1 day',
        migrate_data => true
        );
    `);

    pgm.sql(`
        SELECT add_retention_policy('logs', INTERVAL '3 days');
    `);
}

function down(pgm) {
    pgm.sql(`
        BEGIN;

        DROP TABLE IF EXISTS failed_logs;
        ALTER TABLE logs RENAME TO failed_logs;
        ALTER TABLE logs_old RENAME TO logs;

        COMMIT;    
    `);
}

module.exports = {
    up,
    down
}