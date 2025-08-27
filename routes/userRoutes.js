const express = require("express");
const router = express.Router();
const {
  addUser,
  userLogin,
  editUser,
  getUser,
} = require("../controllers/userController");
const { auth } = require("../middlewares/auth");

router.post("/signup", addUser);
router.post("/login", userLogin);
router.put("/editUser", auth, editUser);
router.get("/getUser", auth, getUser);

module.exports = router;
