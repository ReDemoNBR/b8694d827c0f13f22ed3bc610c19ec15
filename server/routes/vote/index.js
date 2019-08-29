const router = require("express").Router();

router.post("/", require("../middlewares/rate-limit"), require("./create"));
// router.get("/", require("./stats"));

module.exports = router;