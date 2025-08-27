const jwt = require("jsonwebtoken");
const Users = require("../models/user");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const token = req.header("authorization").split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const u = await Users.findOne({ _id: user.userId });
    req.user = u;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Token not valid", success: false });
  }
};

module.exports = {
  auth,
};
