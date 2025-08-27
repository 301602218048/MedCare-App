const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  addMedication,
  getMedications,
  getFilteredMeds,
  updateMedication,
  deleteMedication,
  latestPres,
} = require("../controllers/medicationController");
const { auth } = require("../middlewares/auth");

router.post("/addMed", auth, upload.single("prescriptionFile"), addMedication);
router.get("/getMeds", auth, getMedications);
router.get("/latest", auth, latestPres);
router.get("/getFilteredMeds", auth, getFilteredMeds);
router.put("/updateMed/:id", auth, updateMedication);
router.delete("/deleteMed/:id", auth, deleteMedication);

module.exports = router;
