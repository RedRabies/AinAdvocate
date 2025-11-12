// models/caseModel.js
const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clientName: { type: String, required: true },
  lawyerName: { type: String },
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
