const express = require("express");
const router = express.Router();
const {
  addLog,
  getLogs,
  getTodayLog,
} = require("../controllers/intakeController");
const { auth } = require("../middlewares/auth");

router.post("/addLog", auth, addLog);
router.get("/getLogs", auth, getLogs);
router.get("/today", auth, getTodayLog);

module.exports = router;
