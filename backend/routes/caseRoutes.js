// routes/caseRoutes.js
const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');

router.post('/', caseController.createCase); // Add new case
router.get('/', caseController.getCases);    // Get all cases

module.exports = router;
