const express = require("express");
const router = express.Router();
const { analytics } = require("../controllers/reportController");
const { auth } = require("../middlewares/auth");

router.get("/analytics", auth, analytics);

module.exports = router;
