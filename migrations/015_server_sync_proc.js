function up(pgm) {
    pgm.sql(`
        ALTER TABLE servers
        ADD CONSTRAINT servers_unique_source_server
        UNIQUE (sourceid, serverid);
    `);

    pgm.sql(`
        CREATE OR REPLACE FUNCTION public.sync_servers(payload jsonb)
        RETURNS TABLE (
            id uuid,
            sourceid uuid,
            serverid integer,
            servername varchar(255),
            servertype varchar(4),
            primaryip varchar(20),
            createdat timestamptz,
            updatedat timestamptz
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_sourceid uuid;
        BEGIN
            -- Extract sourceid
            SELECT (payload->0->>'sourceid')::uuid
            INTO v_sourceid;

            IF v_sourceid IS NULL THEN
                RAISE EXCEPTION 'sourceid is required in payload';
            END IF;

            -- UPSERT
            INSERT INTO servers (
                sourceid,
                serverid,
                servername,
                servertype,
                primaryip
            )
            SELECT DISTINCT
                p.sourceid,
                p.serverid,
                p.servername,
                p.servertype,
                p.primaryip
            FROM jsonb_to_recordset(payload) AS p(
                sourceid uuid,
                serverid int,
                servername text,
                servertype text,
                primaryip text
            )
            ON CONFLICT ON CONSTRAINT servers_unique_source_server
            DO UPDATE SET
                servername = EXCLUDED.servername,
                servertype = EXCLUDED.servertype,
                primaryip = EXCLUDED.primaryip,
                updatedat = now();

            DELETE FROM servers s
            WHERE s.sourceid = v_sourceid
            AND NOT EXISTS (
                SELECT 1
                FROM jsonb_to_recordset(payload) AS p(serverid int)
                WHERE p.serverid = s.serverid
            );
            

            -- RETURN final state
            RETURN QUERY
            SELECT a.*
            FROM servers a
            WHERE a.sourceid = v_sourceid
            ORDER BY a.serverid;
        END;
        $$;
    `);
}

function down(pgm) {
    pgm.dropFunction('sync_servers', { ifExists: true });
}

module.exports = {
    up,
    down
}