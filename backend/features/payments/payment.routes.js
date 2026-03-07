const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const invoiceController = require('../invoices/invoice.controller'); // Keep invoice routes here or separate?
const { verifyToken: auth } = require('../../shared/middlewares/auth.middleware');

// Payments
router.post('/', auth, paymentController.processPayment);
router.get('/', auth, paymentController.getPayments);

// Invoices (Nested or separate? Let's keep invoice reads here for simplicity or mount separate in server.js)
// Let's rely on server.js mounting /api/invoices for clarity

module.exports = router;
