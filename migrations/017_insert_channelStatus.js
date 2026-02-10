function up(pgm) {
    pgm.sql(`
        CREATE OR REPLACE FUNCTION public.insert_channelstatus(
            payload jsonb
        )
        RETURNS integer
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_inserted integer;
        BEGIN
            INSERT INTO channelstatus (
                channelid,
                statuscode,
                statustext,
                channelStatus,
                recfps,
                recbitrate,
                ts
            )
            SELECT
                p.channelid,
                p.statuscode,
                p.statustext,
                p.channelStatus,
                p.recfps,
                p.recbitrate,
                COALESCE(p.ts, now())
            FROM jsonb_to_recordset(payload) AS p(
                channelid uuid,
                statuscode text,
                statustext text,
                channelstatus integer,
                recfps integer,
                recbitrate integer,
                ts timestamptz
            );

            GET DIAGNOSTICS v_inserted = ROW_COUNT;
            RETURN v_inserted;
        END;
        $$;
    `);
}

function down(pgm) {
    pgm.sql('DROP FUNCTION IF EXISTS public.insert_channelstatus;')
}

module.exports = {
    up,
    down,
}