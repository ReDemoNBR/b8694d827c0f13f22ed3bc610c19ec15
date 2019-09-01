const RateLimit = require("../../db/models/rate-limit");
const ExpressRateLimit = require("express-rate-limit");
const {RATE_LIMIT_WINDOW, RATE_LIMIT_REQUESTS} = require("../../util/env");


module.exports = (namespace="default") => {
    function RateLimitStore(namespace) {
        this.namespace = namespace;
        this.incr = async function increment(key, cb) {
            const namespace = this.namespace;
            try {
                let rateLimit = await RateLimit.findOne({where: {namespace, key}});
                // if 'key' is not used for a certain time, then reset it
                if (rateLimit && new Date(Date.now()-RATE_LIMIT_WINDOW)>rateLimit.updated) {
                    this.resetKey(key);
                    rateLimit = null;
                }
                if (rateLimit) await RateLimit.increment("hits", {where: {namespace, key}});
                else await RateLimit.create({namespace, key, hits: 1});
                return cb(null, rateLimit && Number(rateLimit.hits || 0)+1, new Date(Date.now()+RATE_LIMIT_WINDOW));
            } catch(e) {
                return cb(e);
            }
        };
        this.decrement = async function decrement(key) {
            const namespace = this.namespace;
            try {
                await RateLimit.decrement("hits", {where: {namespace, key}});
            } catch(e) {
                console.warn(`Error on decrementing ${namespace}->${key}`);
                console.warn(e);
            }
        };
        this.resetKey = async function resetKey(key) {
            const namespace = this.namespace;
            try {
                await RateLimit.destroy({where: {namespace, key}});
            } catch(e) {
                console.warn(`Error on resetting ${namespace}->${key}`);
                console.warn(e);
            }
        };
    }
    
    return ExpressRateLimit({
        windowMs: RATE_LIMIT_WINDOW,
        max: RATE_LIMIT_REQUESTS,
        skipFailedRequests: true,
        store: new RateLimitStore(namespace)
    });
};