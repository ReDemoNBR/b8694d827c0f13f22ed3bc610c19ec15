const Cluster = require("cluster");

if (Cluster.isMaster) {
    const {PROCESS_WORKERS_COUNT} = require("./util/env");
    Cluster.on("exit", require("./cluster/exit"));
    Cluster.on("fork", require("./cluster/fork"));
    Cluster.on("online", require("./cluster/online"));
    for (let i=0; i<PROCESS_WORKERS_COUNT; i++) Cluster.fork();
} else {
    const Express = require("express");
    const {resolve} = require("path");
    const {SERVER_API_PORT, PROD, MAX_REQUEST_BODY_SIZE, RATE_LIMIT_WINDOW, RATE_LIMIT_REQUESTS} = require("./util/env");
    const app = Express();
    app.listen = require("util").promisify(app.listen);
    
    app.use(Express.json({limit: MAX_REQUEST_BODY_SIZE}));
    app.use(Express.urlencoded({extended: false, limit: MAX_REQUEST_BODY_SIZE}));
    app.use(require("compression")());
    app.use(require("helmet")());
    app.use(require("frameguard")({action: "deny"}));
    app.use(require("referrer-policy")({policy: "same-origin"}));
    
    if (PROD) app.enable("trust proxy");
    else app.set("json spaces", "\t");
    app.set("etag", "strong");
    
    // views
    app.engine("handlebars", require("express-handlebars")());
    app.set("view engine", "handlebars");
    app.set("views", resolve(__dirname, "../client/views"));
    
    app.use("/static", Express.static(resolve(__dirname, "../client/static")));
    app.use("/api", require("./routes"));
    app.use(require("../client/"));
    
    require("./db").sync({logging: PROD?false:undefined}).then(async ()=>{
        await app.listen(SERVER_API_PORT);
        console.info(`Server open on port ${SERVER_API_PORT}`);
    }).catch(e=>{
        console.error(`Error opening server on port ${SERVER_API_PORT}`);
        console.error(e);
        process.exit(1);
    });
}