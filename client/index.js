const router = require("express").Router();

router.get("/", require("./controller/home"));
router.get("/vote", require("./controller/vote"));

module.exports = router;