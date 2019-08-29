// TODO: Add a database so clusters can share the same rate-limit database

const {RATE_LIMIT_WINDOW, RATE_LIMIT_REQUESTS} = require("../../util/env");

const RateLimit = require("express-rate-limit")({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_REQUESTS,
    skipFailedRequests: true,
    keyGenerator: req=>`${req.ip}${req.originalUrl}`
});

module.exports = RateLimit;