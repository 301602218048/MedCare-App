const express = require("express");
const path = require("path");
const db = require("./utils/db-connection");
const userRoutes = require("./routes/userRoutes");
const intakeRoutes = require("./routes/intakeRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const sideEffectRoutes = require("./routes/sideEffectRoutes");
const reportRoutes = require("./routes/reportRoutes");
require("dotenv").config();
db();

//models
require("./models/user");
require("./models/intake");
require("./models/medication");
require("./models/sideeffect");
require("./utils/reminder");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/user", userRoutes);
app.use("/intake", intakeRoutes);
app.use("/med", medicationRoutes);
app.use("/sideeffect", sideEffectRoutes);
app.use("/report", reportRoutes);

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "signup.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
