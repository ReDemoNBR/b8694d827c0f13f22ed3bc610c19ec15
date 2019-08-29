const ms = require("ms");
const {resolve} = require("path");
const {abs, min} = Math;
const {env} = process;
let processCount = env.PROCESS_WORKERS_COUNT || "upto-4";
processCount = abs(parseInt(processCount)) || processCount;
if (processCount && typeof processCount==="string") {
    processCount = processCount.toLowerCase();
    let threads = require("os").cpus().length || 1; //added at least one thread because some android phones CPUs are not detected and cpus().length = 0
    if (processCount==="all") processCount = threads;
    else if (processCount.startsWith("upto-")) {
        processCount = abs(parseInt(processCount.replace("upto-", ""))) || 4;
        processCount = min(processCount, threads);
    } else processCount = min(threads, 4);
}


module.exports = Object.freeze({
    // DATABASE
    DB_HOST: env.PGHOST || env.DB_HOST || "localhost",
    DB_PORT: parseInt(env.PGPORT || env.DB_PORT) || 5432,
    DB_NAME: env.PGDATABASE || env.DB_NAME || "wall",
    DB_USERNAME: env.PGUSER || env.DB_USERNAME || "admin",
    DB_PASSWORD: env.PGPASSWORD || env.DB_PASSWORD || "admin",
    DB_TIMEZONE: env.DB_TIMEZONE || "Etc/UTC",
    DB_MIN_CONNECTIONS: abs(parseInt(env.DB_MIN_CONNECTIONS)) || 1,
    DB_MAX_CONNECTIONS: abs(parseInt(env.DB_MAX_CONNECTIONS)) || 25,
    DB_IDLE_TIME: abs(parseInt(env.DB_IDLE_TIME)) || 10000,
    DB_ACQUIRE_TIME: abs(parseInt(env.DB_ACQUIRE_TIME)) || 60000,
    DB_CHECK_INTERVAL_CONNECTIONS: abs(parseInt(env.DB_CHECK_INTERVAL_CONNECTIONS)) || 3000,
    // DB BACKUP
    DB_BACKUP_COMPRESSION_LEVEL: parseInt(env.DB_BACKUP_COMPRESSION_LEVEL) || 6,
    DB_BACKUP_TMP_PATH: env.DB_BACKUP_TMP_PATH || "/tmp",
    DB_BACKUP_ROTATE_AFTER: ms(env.DB_BACKUP_ROTATE_AFTER || "7 days"),
    DB_BACKUP_MIN_BACKUPS: parseInt(env.DB_BACKUP_MIN_BACKUPS) || 7,
    DB_BACKUP_S3_BUCKET: env.DB_BACKUP_S3_BUCKET || "database-backup",
    // API SERVICE
    SERVER_API_PORT: abs(parseInt(env.SERVER_API_PORT)) || 10000,
    API_HEADER_NAME: env.API_HEADER_NAME || "X-Waller-Version",
    MAX_REQUEST_BODY_SIZE: env.MAX_BODY_REQUEST_SIZE || "500KB",
    API_HEADER_VALUE: env.API_HEADER_VALUE || "0.0.1",
    RATE_LIMIT_WINDOW: ms(env.RATE_LIMIT_WINDOW || "1 minute"),
    RATE_LIMIT_REQUESTS: abs(parseInt(env.RATE_LIMIT_REQUESTS)) || 20,
    // PROCESS
    PROCESS_WORKERS_COUNT: processCount,
    NODE_ENV: env.NODE_ENV,
    NODE_CLUSTER_SCHED_POLICY: env.NODE_CLUSTER_SCHED_POLICY,
    PROD: env.NODE_ENV==="production",
    CLUSTER_LOG: (env.CLUSTER_LOG || "true").trim().toLowerCase()==="true"
});