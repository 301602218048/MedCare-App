const express = require("express");
const router = express.Router();
const { add, list } = require("../controllers/sideEffectController");
const { auth } = require("../middlewares/auth");

router.post("/add", auth, add);
router.get("/list", auth, list);

module.exports = router;
