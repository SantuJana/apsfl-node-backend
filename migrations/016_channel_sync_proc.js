function up(pgm) {
    pgm.sql(`
        ALTER TABLE channels
        ADD CONSTRAINT channels_unique_server_channel
        UNIQUE (serverid, channelid);
    `);

    pgm.sql(`
        CREATE OR REPLACE FUNCTION sync_channels(payload jsonb)
        RETURNS TABLE (
            id uuid,
            serverid uuid,
            channelid int,
            channelname varchar,
            channelip varchar,
            channeltype int,
            createdat timestamptz,
            updatedat timestamptz
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_serverid uuid;
        BEGIN
            -- 1️⃣ Extract serverid (assumes all rows have same serverid)
            SELECT (payload->0->>'serverid')::uuid
            INTO v_serverid;

            IF v_serverid IS NULL THEN
                RAISE EXCEPTION 'serverid is required in payload';
            END IF;

            -- 2️⃣ UPSERT channels
            INSERT INTO channels (
                serverid,
                channelid,
                channelname,
                channelip,
                channeltype
            )
            SELECT DISTINCT
                p.serverid,
                p.channelid,
                p.channelname,
                p.channelip,
                p.channeltype
            FROM jsonb_to_recordset(payload) AS p(
                serverid uuid,
                channelid int,
                channelname varchar,
                channelip varchar,
                channeltype int
            )
            ON CONFLICT ON CONSTRAINT channels_unique_server_channel
            DO UPDATE SET
                channelname = EXCLUDED.channelname,
                channelip = EXCLUDED.channelip,
                channeltype = EXCLUDED.channeltype,
                updatedat = now();

            -- 3️⃣ DELETE servers not present in payload (FOR THIS SOURCE ONLY)
            DELETE FROM channels c
            WHERE c.serverid = v_serverid
            AND NOT EXISTS (
                SELECT 1
                FROM jsonb_to_recordset(payload) AS p(channelid int)
                WHERE p.channelid = c.channelid
            );

            -- 4️⃣ RETURN final state
            RETURN QUERY
            SELECT a.*
            FROM channels as a
            WHERE a.serverid = v_serverid
            ORDER BY a.channelid;
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