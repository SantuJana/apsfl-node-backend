function up(pgm) {
    pgm.sql(`
        DROP TABLE IF EXISTS new_events;
    `);

    pgm.sql(`
        CREATE TABLE new_events
        (LIKE events INCLUDING ALL);
    `);

    pgm.sql(`
        INSERT INTO new_events
        SELECT * FROM events
    `);

    pgm.sql(`
        BEGIN;

        DROP TABLE IF EXISTS events_old;
        ALTER TABLE events RENAME TO events_old;
        ALTER TABLE new_events RENAME TO events;

        COMMIT;    
    `);

    pgm.sql(`
        SELECT create_hypertable(
        'events',
        'ts',
        chunk_time_interval => INTERVAL '1 day',
        migrate_data => true
        );
    `);

    pgm.sql(`
        SELECT add_retention_policy('events', INTERVAL '3 days');
    `);
}

function down(pgm) {
    pgm.sql(`
        BEGIN;

        DROP TABLE IF EXISTS failed_events;
        ALTER TABLE events RENAME TO failed_events;
        ALTER TABLE events_old RENAME TO events;

        COMMIT;    
    `);
}

module.exports = {
    up,
    down
}