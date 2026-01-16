async function up(pgm) {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS timescaledb`);

  pgm.createTable("sources", {
    id: { type: "uuid", primaryKey: true },
    ip: { type: "text", notNull: true },
    port: { type: "integer", notNull: true },
    enabled: { type: "boolean", default: true },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });
}

async function down(pgm) {
  pgm.dropTable("sources");
}

module.exports = {
    up,
    down
}