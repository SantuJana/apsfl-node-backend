function up(pgm) {
    pgm.sql(`
        DROP FUNCTION IF EXISTS public.getall_channels_avg(uuid, varchar(10), bigint);

        CREATE OR REPLACE FUNCTION public.getall_channels_avg(sid uuid, stype varchar(10), stime bigint)
        RETURNS TABLE(
            "uuid" text, 
            channelid integer, 
            channelname character varying(255), 
            channelip character varying(20), 
            serverid integer, 
            servername character varying(255),
            avgrecfps integer,
            avgrecbitrate integer,
            dbchannelid uuid
        )
        LANGUAGE 'plpgsql'
        AS $$
        DECLARE
            start_date_time timestamp := to_timestamp(stime / 1000);
            end_date_time timestamp := (to_timestamp(stime / 1000) + INTERVAL '1 day');
        BEGIN
            
            RETURN QUERY
            SELECT 
            CONCAT_WS('_', s.servername, c.channelid) uuid,
            c.channelid,
            c.channelname,
            c.channelip,
            s.serverid,
            s.servername,
            COALESCE(AVG(cs.recfps)::integer, 0) avgrecfps,
            COALESCE(AVG(cs.recbitrate)::integer, 0) avgrecbitrate,
            c.id dbchannelid
            FROM channels c
            LEFT JOIN servers s ON c.serverid = s.id
            LEFT JOIN (
				SELECT * from channelstatus 
				WHERE ts >= start_date_time AND ts < end_date_time
			) cs ON cs.channelid = c.id
            WHERE s.sourceid = sid AND s.servertype = stype
            GROUP BY c.channelid, c.channelname, c.channelip, s.serverid, s.servername, c.id
            ORDER BY c.channelid;
        END
        $$;  
    `);

    pgm.dropIndex('channels', ['channelid', 'channelname']);
    pgm.createIndex('channels', ['channelid', 'channelname', 'channelip']);
}

function down(pgm) {
    pgm.sql('DROP FUNCTION IF EXISTS public.getall_channels_avg(uuid, varchar(10), bigint);')
    pgm.dropIndex('channels', ['channelid', 'channelname', 'channelip']);
    pgm.createIndex('channels', ['channelid', 'channelname']);
}

module.exports = {
    up,
    down
}