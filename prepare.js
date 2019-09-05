const db = require("./server/db");

db.sync().then(async ()=>{
    await db.drop();
    await db.sync();
    process.exit(0);
}).catch(e=>console.error("Error preparing database") || console.error(e) || process.exit(1));