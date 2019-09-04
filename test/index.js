const fetch = require("node-fetch");
const {spawn, exec, execFile} = require("child_process");
const {resolve} = require("path");
const assert = require("assert");
const {SERVER_API_PORT, PROCESS_WORKERS_COUNT} = require("../server/util/env");
const server = require("../server");
const RateLimit = require("../server/db/models/rate-limit");

const method = "POST";
const headers = {"Content-Type": "application/json"};

const request = ()=>fetch(`http://localhost:${SERVER_API_PORT}/api/vote`, {method, headers, body: JSON.stringify({id: Math.random()*2>>0})});

async function thousandSyncRequests() {
    let list = [];
    let now = Date.now();
    for (let i=0; i<1000; i++) {
        let res = await request();
        list.push(res.ok);
    }
    let okCount = list.filter(ok=>ok).length;
    let notOkCount = list.filter(ok=>!ok).length;
    let time = Date.now()-now;
    return await new Promise(resolve=>setTimeout(()=>{
        assert(okCount<.01*list.length);
        console.info(`1000 requests done in ${time}ms with ${100*okCount/list.length}% of success`);
        resolve();
    }, 1000));
}

function wait(ms) {
    return new Promise(resolve=>setTimeout(resolve, ms));
}

async function thousandRequestsInOneMinute() {
    let list = [];
    let now = Date.now();
    for (let i=0; i<1000; i++) {
        let time = Date.now();
        let res = await request();
        list.push(res.ok);
        await wait(60-(Date.now()-time));
    }
    let okCount = list.filter(ok=>ok).length;
    let notOkCount = list.filter(ok=>!ok).length;
    let time = Date.now()-now;
    return await new Promise(resolve=>setTimeout(()=>{
        assert(okCount<.01*list.length);
        console.info(`1000 requests done in ${time}ms with ${100*okCount/list.length}% of success`);
        resolve();
    }, 1000));
}

server.on("listening", async ()=>{
    if (!server.isMaster) return;
    await RateLimit.truncate(); //clears the RateLimit DB table
    await thousandSyncRequests();
    await RateLimit.truncate(); //clears the RateLimit DB table
    await thousandRequestsInOneMinute();
    process.exit(0);
});