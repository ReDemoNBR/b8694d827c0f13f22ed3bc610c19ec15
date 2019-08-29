const Cluster = require("cluster");
const OS = require("os");
const {promises: {stat}} = require("fs");
const Bytes = require("bytes");
const {
    DEFAULT_LIMIT, DEFAULT_MAX_LIMIT,
    API_HEADER_NAME, API_HEADER_VALUE,
    MAX_UPLOAD_FILE_SIZE, MAX_REQUEST_BODY_SIZE,
    PROCESS_WORKERS_COUNT, DB_TIMEZONE,
    MAXMIND_DB_PATH, MAXMIND_DB_FILENAME
} = require("../../util/env");

const {entries} = Object;
const {floor, round} = Math;

const listFormat = new Intl.ListFormat("en-GB", {type: "conjunction", style: "long"});

function parseTime(seconds) {
    seconds = round(Number(seconds));
    let days = floor(seconds/(3600*24));
    seconds -= days*(3600*24);
    let hours = floor(seconds/3600);
    seconds -= hours*3600;
    let minutes = floor(seconds/60);
    seconds -= minutes*60;
    
    let prettyDays = days>0?days+(days===1?" day":" days"):"";
    let prettyHours = hours>0?hours+(hours===1?" hour":" hours"):"";
    let prettyMinutes = minutes>0?minutes+(minutes===1?" minute":" minutes"):"";
    let prettySeconds = seconds>0?seconds+(seconds===1?" second":" seconds"):"";
    return listFormat.format([prettyDays, prettyHours, prettyMinutes, prettySeconds].filter(a=>a));
}

module.exports = async (req, res)=>{
    const maxmind = await stat(`${MAXMIND_DB_PATH}/${MAXMIND_DB_FILENAME}`);
    return res.send({
        worker: Cluster.id,
        status: "OK",
        operatingSystem: {
            arch: OS.arch(),
            cpus: OS.cpus().length,
            freeMemory: Bytes(OS.freemem()),
            platform: OS.platform(),
            release: OS.release(),
            totalMemory: Bytes(OS.totalmem()),
            type: OS.type(),
            upSince: new Date(Date.now()-OS.uptime()*1000),
            uptime: parseTime(OS.uptime())
        },
        process: {
            arch: process.arch,
            memoryUsage: entries(process.memoryUsage()).reduce((memory, [key, value])=>({...memory, [key]: Bytes(value)}), {}),
            platform: process.platform,
            upSince: new Date(Date.now()-process.uptime()*1000),
            uptime: parseTime(process.uptime()),
            version: process.version
        },
        application: {
            databaseTimezone: DB_TIMEZONE,
            defaultLimit: DEFAULT_LIMIT,
            defaultMaxLimit: DEFAULT_MAX_LIMIT,
            maxRequestBodySize: MAX_REQUEST_BODY_SIZE,
            maxUploadFileSize: MAX_UPLOAD_FILE_SIZE,
            httpHeader: API_HEADER_NAME,
            version: API_HEADER_VALUE,
            workers: PROCESS_WORKERS_COUNT
        },
        maxmind: {
            databaseType: MAXMIND_DB_FILENAME,
            databaseSize: Bytes(maxmind.size),
            lastUpdate: maxmind.mtime
        }
    });
};