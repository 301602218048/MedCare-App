const Medication = require("../models/medication");
const { uploadToS3 } = require("../utils/s3");

const addMedication = async (req, res) => {
  try {
    let prescriptionFileUrl = null;

    if (req.file) {
      prescriptionFileUrl = await uploadToS3(req.file);
    }

    const meds = await Medication.create({
      ...req.body,
      userId: req.user._id,
      prescriptionFile: prescriptionFileUrl,
    });

    res.status(201).json({ success: true, meds });
  } catch (err) {
    console.log("Error in addMedication:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getMedications = async (req, res) => {
  try {
    const meds = await Medication.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, meds });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getFilteredMeds = async (req, res) => {
  try {
    const { search } = req.query;

    let query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { dosage: { $regex: search, $options: "i" } },
        { timeSlots: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const meds = await Medication.find(query).sort({ createdAt: -1 });
    res.json({ success: true, meds });
  } catch (err) {
    console.error("Error in getFilteredMeds:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateMedication = async (req, res) => {
  try {
    let prescriptionFileUrl = null;
    if (req.file) {
      prescriptionFileUrl = await uploadToS3(req.file);
    }

    const updatedData = {
      ...req.body,
      ...(prescriptionFileUrl && { prescriptionFile: prescriptionFileUrl }),
    };

    const updated = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }

    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteMedication = async (req, res) => {
  try {
    const deleted = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Medication not found" });
    }
    res.json({ success: true, message: "Medication deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const latestPres = async (req, res) => {
  try {
    const prescriptions = await Medication.find({
      userId: req.user._id,
      prescriptionFile: { $ne: null },
    })
      .sort({ startDate: -1 })
      .limit(10)
      .select("name startDate prescriptionFile dosage");

    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  addMedication,
  getMedications,
  getFilteredMeds,
  updateMedication,
  deleteMedication,
  latestPres,
};
