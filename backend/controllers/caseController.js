// controllers/caseController.js
const Case = require('../models/caseModel');

// Create a new case
exports.createCase = async (req, res) => {
  try {
    const newCase = await Case.create(req.body);
    res.status(201).json(newCase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all cases
exports.getCases = async (req, res) => {
  try {
    const cases = await Case.find();
    res.status(200).json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
