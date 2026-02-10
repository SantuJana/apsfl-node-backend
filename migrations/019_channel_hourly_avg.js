function up(pgm) {
    pgm.sql(`
        DROP FUNCTION IF EXISTS public.channel_hourly_avg;

        CREATE OR REPLACE FUNCTION public.channel_hourly_avg(cid uuid, stime bigint)
        RETURNS TABLE(
            time_range text,
            avgrecfps integer,
            avgrecbitrate integer
        )
        LANGUAGE 'plpgsql'
        AS $$
        DECLARE
            start_date_time timestamp := to_timestamp(stime / 1000);
            end_date_time timestamp := (to_timestamp(stime / 1000) + INTERVAL '1 day');
        BEGIN
            RETURN QUERY
            WITH hours AS (
                SELECT 
                    gs as hour_start,
                    gs + INTERVAL '1 hour' as hour_end,
                    row_number() over(order by gs) - 1 as hour_no
                FROM generate_series(
                            start_date_time,
                            start_date_time + INTERVAL '23 hours',
                            INTERVAL '1 hour'
                        ) AS gs
            )
            SELECT 
                concat(lpad(h.hour_no::text, 2, '0'), ':00-', lpad(h.hour_no::text, 2, '0'), ':59') as time_range,
                COALESCE(AVG(d.recfps)::integer, 0) avgrecfps,
                COALESCE(AVG(d.recbitrate)::integer, 0) avgrecbitrate
            FROM hours h LEFT JOIN 
            (
                SELECT cs.recfps, cs.recbitrate, cs.ts FROM channelstatus cs
                WHERE cs.ts >= start_date_time AND cs.ts < end_date_time AND cs.channelid = cid
            ) d
            ON d.ts >= h.hour_start AND d.ts < h.hour_end
            GROUP BY h.hour_no
            ORDER BY h.hour_no;
        END
        $$;    
    `)
}

function down(pgm) {
    pgm.sql('DROP FUNCTION IF EXISTS public.channel_hourly_avg;')
}

module.exports = {
    up,
    down
}