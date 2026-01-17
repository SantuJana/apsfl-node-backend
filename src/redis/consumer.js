const redis = require(".");
const { insertBatch } = require("../db/event");
const { sleep } = require('../lib/utils')

const CONSUMER_NAME = `worker-${process.pid}`;
console.log(`Consumer: ${CONSUMER_NAME}`)
const BATCH_SIZE = 5000;
const BLOCK_MS = 1000;

let running = true;

async function deleteStreamIfExists() {
    try {
        await redis.del('ws_events');
    } catch (error) {
        console.log('ERROR: Failed to delete stream.')
    }
}

async function ensureConsumerGroup() {
  try {
    await redis.xgroup(
      "CREATE",
      "ws_events",
      "db_writers",
      "$",
      "MKSTREAM"
    );
  } catch (err) {
    if (!err.message.includes("BUSYGROUP")) {
      throw err;
    }
  }
}

async function recoverPending() {
  const res = await redis.xpending(
    "ws_events",
    "db_writers",
    "-",
    "+",
    1000,
    CONSUMER_NAME
  );

  console.log("=====>", res)

  if (!res || res.length === 0) return;

  const ids = res.map(r => r[0]);

  const claimed = await redis.xclaim(
    "ws_events",
    "db_writers",
    CONSUMER_NAME,
    60000,
    ...ids
  );

  await processBatch(claimed);
}

async function consume() {
  while (running) {
    try {
      const res = await redis.xreadgroup(
        "GROUP",
        "db_writers",
        CONSUMER_NAME,
        "COUNT",
        BATCH_SIZE,
        "BLOCK",
        BLOCK_MS,
        "STREAMS",
        "ws_events",
        ">"
      );

      if (!res) continue;

      const [, messages] = res[0];
      await processBatch(messages);

    } catch (err) {
      console.error("Consumer error:", err);
      await sleep(1000);
    }
  }
}

function stopConsume() {
  running = false;
}

async function processBatch(
  messages
) {
    let index = 0
    let ids = []
    let values = []
    let params = []

    for (const [id, fields] of messages) {
        ids.push(id)
        values.push(`($${index * 13 + 1}, $${index * 13 + 2}, $${index * 13 + 3}, $${index * 13 + 4}, $${index * 13 + 5}, $${index * 13 + 6}, $${index * 13 + 7}, $${index * 13 + 8}, $${index * 13 + 9}, $${index * 13 + 10}, $${index * 13 + 11}, $${index * 13 + 12}, $${index * 13 + 13})`)
        params.push(fields[1], Number(fields[3]), Number(fields[5]), fields[7], Number(fields[9]), fields[11], fields[13], fields[15], Number(fields[17]), fields[19], new Date(Number(fields[21])), fields[23], fields[25])
        index++
    }

    await insertBatch(values, params)

    await redis.xack("ws_events", "db_writers", ...ids)
    await redis.xdel("ws_events", ...ids)
}


module.exports = {
    deleteStreamIfExists,
    ensureConsumerGroup,
    recoverPending,
    consume,
    stopConsume
}
