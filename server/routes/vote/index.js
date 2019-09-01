const router = require("express").Router();

router.post("/", require("../middlewares/rate-limit")("vote"), require("./create"));
router.get("/result", require("./stats"));

module.exports = router;