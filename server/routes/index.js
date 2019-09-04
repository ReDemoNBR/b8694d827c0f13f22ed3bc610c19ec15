const router = require("express").Router();
const cors = require("cors");

router.options("*", cors());
router.use(cors());
router.use(require("./middlewares/cluster-log"));
router.use(require("./middlewares/api-version"));

// {...} routes
router.use("/vote", require("./vote"));
router.use("/health", require("./health"));

router.use(require("./middlewares/not-found"));
router.use(require("./middlewares/error-handler"));

module.exports = router;